import datetime
import re

from flask_socketio import emit
from sqlalchemy.exc import OperationalError, ProgrammingError, IntegrityError
from flask import session, json, current_app, render_template, url_for, request
from sqlalchemy.orm import joinedload
from flask_mail import Message

from core import Cache, API
from core.messages import send_message
from core.middleware import HttpException, HttpNotFoundException
from core.router import permissions
from dal.shared import get_fillable, token_required, access_required, Paginator, system_call
from dal.user import User, db, Role, UserToken, UserAttributes, UserMessage, UserGroup
from views import Result


class Users(API):

    def get(self):

        if 'logged_in' in session:
            try:
                user = User.query.filter_by(email=session['user_email']).first()
            except (ProgrammingError, OperationalError):
                return Result.error('install', 501)
            if user:
                return user_to_dict(user)

        else:
            try:
                # the second param is a function that would raise exception
                # if table not exist we cache it to avoid multiple
                # executions when a user is just logged out.
                Cache.remember('users.count', User.query.count, 24 * 60 * 60)
            except (ProgrammingError, OperationalError):
                return Result.error('install', 501)

        return Result.error('no session', 403)

    @token_required
    def put(self):
        user = request.user
        raw_data = request.get_json()

        if 'first_name' in raw_data:
            user.first_name = raw_data['first_name']

        if 'last_name' in raw_data:
            user.last_name = raw_data['last_name']

        access = user.attributes.access
        preferences = user.attributes.preferences

        if raw_data['attributes']:
            if 'access' in raw_data['attributes']:
                user.attributes.user_access = json.dumps({**access, **raw_data['attributes']['access']})

            if 'preferences' in raw_data['attributes']:
                user.attributes.user_preferences = json.dumps({**preferences, **raw_data['attributes']['preferences']})

        db.session.commit()
        emit('USER_WS_CHANGED', {'data': user.id}, namespace='/' + str(user.id), broadcast=True)
        return Result.success()


class UsersManager(API):

    @token_required
    @access_required
    def get(self):

        page = request.args.get('page', 1)
        total_pages = 1
        q = request.args.get('query')
        if q:
            users = User.query.filter(
                (User.first_name.like('%' + q + '%')) |
                (User.last_name.like('%' + q + '%')) |
                (User.email.like('%' + q + '%'))
            ).all()
        else:
            paginator = Paginator(User.query, int(page), request.args.get('orderBy'), request.args.get('orderDir'))
            total_pages = paginator.total_pages
            users = paginator.get_result()

        user_list = list(map(lambda user: {
            'first_name': user.first_name,
            'last_name': user.last_name,
            'name': user.first_name + ' ' + user.last_name,
            'id': user.id,
            'email': user.email,
            'attributes': get_user_attr(user),
            'roles': list(map(lambda r: {
                'name': r.name,
                'id': r.id
            }, user.roles))
        }, users))

        return Result.paginate(user_list, page, total_pages)

    @token_required
    @access_required
    def post(self):
        raw_data = request.get_json()
        user_data = get_fillable(User, **raw_data)
        if 'email' in user_data:
            user_data['email'] = user_data['email'].lower()
        user = User(**user_data)
        if 'password' in raw_data:
            user.hash_password()

        if raw_data['roles']:
            for role in Role.query.filter(Role.id.in_(raw_data['roles'])):
                user.roles.append(role)

        user.attributes = UserAttributes()
        if raw_data['attributes'] and 'access' in raw_data['attributes']:
            user.attributes.user_access = json.dumps(raw_data['attributes']['access'])

        if raw_data['attributes'] and 'preferences' in raw_data['attributes']:
            user.attributes.user_preferences = json.dumps(raw_data['attributes']['preferences'])

        db.session.add(user)
        db.session.commit()

        if not user.password:
            ut = UserToken(target=request.host_url.rstrip('/') + url_for('user_activate_url'))
            ut.new_token(user.email)
            user.tokens.append(ut)
            db.session.commit()
            msg = Message('Verifica Tu Cuenta', recipients=[user.email])
            msg.html = render_template(
                'email/account_activate.html',
                name=user.first_name,
                url=request.host_url,
                token='account/activate/' + ut.token
            )
            current_app.mail(msg)

        return dict(id=user.id)

    @token_required
    @access_required
    def put(self, user_id):
        raw_data = request.get_json()
        user = User.query.options(joinedload('roles')).filter_by(id=user_id).first()

        if not user:
            return Result.error('User does not exist')

        user.first_name = raw_data['first_name']
        user.last_name = raw_data['last_name']
        user.roles = []

        if raw_data['attributes']:
            if raw_data['attributes'] and 'access' in raw_data['attributes']:
                user.attributes.user_access = json.dumps(raw_data['attributes']['access'])

            if raw_data['attributes'] and 'preferences' in raw_data['attributes']:
                user.attributes.user_preferences = json.dumps(raw_data['attributes']['preferences'])

        if raw_data['roles']:
            for role in Role.query.filter(Role.id.in_(
                    list(map(
                        lambda r: r['id'], raw_data['roles'])
                    ))):
                user.roles.append(role)

        db.session.commit()
        emit('USER_WS_CHANGED', {'data': user.id}, namespace='/' + str(user.id), broadcast=True)

        return Result.success()

    @token_required
    @access_required
    def delete(self, user_id):
        user = User.query.options(joinedload('roles')).filter_by(id=user_id).first()
        user.roles = []
        db.session.delete(user)
        db.session.commit()
        return Result.success()


class Session(API):
    def post(self):
        auth = request.authorization

        if not auth or not auth.username or not auth.password:
            return Result.error('Could not verify')

        user = User.query.filter_by(email=auth.username.lower()).first()

        if not user:
            return Result.error('Could not verify')

        if user.password_correct(auth.password):
            session['logged_in'] = True
            session['user_email'] = user.email
            return user_to_dict(user)

        return Result.error('Could not verify')

    def delete(self):

        if 'logged_in' in session:
            session.pop('logged_in')
            session.pop('user_email')
            return {}

        return Result.error('no session', 401)


class Roles(API):

    @token_required
    @access_required
    def post(self):
        role = request.get_json()

        if not role:
            return Result.error('name is required')

        current = Role.query.filter_by(name=role).count()

        if current > 0:
            return Result.error('name already in used')

        role = Role(name=role.title())
        db.session.add(role)
        db.session.commit()

        return {
            'id': role.id,
            'name': role.name,
            'permissions': role.permissions
        }

    @token_required
    @access_required
    def get(self):
        roles = Role.query.all()
        data = []
        for role in roles:
            data.append({
                'id': role.id,
                'name': role.name,
                'permissions': role.get_permissions
            })

        return data

    @token_required
    @access_required
    def put(self):
        data = request.get_json()
        role = Role.query.filter_by(id=data['id']).first()
        role.permissions = json.dumps(data['permissions'])
        db.session.commit()
        emit('ROLE_WS_CHANGED', {'data': role.name}, namespace='/' + role.name, broadcast=True)
        return Result.success()

    @token_required
    @access_required
    def delete(self):
        role_id = request.get_json()
        try:
            Role.query.filter_by(id=role_id).delete()
            db.session.commit()
        except IntegrityError as e:
            return Result.error('integrity constraint', 409)

        return Result.success()


class Permissions(API):

    @token_required
    def get(self):
        return permissions


class UserTokens(API):

    def get(self, user_token):
        jwt = UserToken.query.filter_by(token=user_token).first()

        time = datetime.datetime.utcnow()

        if jwt and jwt.expires > time:
            return Result.custom({'isValid': True}, 200)

        return Result.custom({'isValid': False}, 400)


class Activate(API):

    def post(self):
        data = request.get_json()
        ut = UserToken.query.filter_by(token=data['token']).first()

        if not ut or ut.expires <= datetime.datetime.utcnow():
            raise HttpException('Invalid token')

        if ut.target != request.base_url:
            raise HttpException('Invalid target')

        parsed = r'^(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&*(),.?":{}|<>])'

        if len(data['pw']) < 6 or not re.match(parsed, data['pw']) or data['pw'] != data['pw2']:
            raise HttpException('Invalid password')

        user = ut.user
        user.password = data['pw']
        user.hash_password()
        ut.expires = datetime.datetime.utcnow()
        db.session.commit()

        return Result.success()


class Audit(API):

    @token_required
    @access_required
    def get(self):
        pass


class UserPasswords(API):
    def put(self):
        data = request.get_json()
        if data is None or 'email' not in data:
            raise HttpException('Missing email')

        user = User.query.filter_by(email=data['email']).first()
        if user is not None:
            send_user_token_email(user, 'Actualiza tu contraseña', 'email/change_password.html')

        # for security reasons, even if user does not exist, we return a success call
        return Result.success()


def send_user_token_email(user: User, mail_subject, template):
    ut = UserToken(target=request.host_url.rstrip('/') + url_for('user_activate_url'))
    ut.new_token(user.email)
    user.tokens.append(ut)
    db.session.commit()
    msg = Message(mail_subject, recipients=[user.email])
    msg.html = render_template(
        template,
        name=user.first_name,
        url=request.host_url,
        token='account/activate/' + ut.token
    )
    current_app.mail(msg)


class Messages(API):
    @token_required
    def get(self):
        total_unread = UserMessage.query.filter_by(user_id=request.user.id, read=False).count()
        page = request.args.get('page', 1)
        paginator = Paginator(
            UserMessage.query.filter_by(user_id=request.user.id),
            int(page),
            request.args.get('orderBy', 'date'),
            request.args.get('orderDir', 'desc')
        )
        total_pages = paginator.total_pages

        return Result.custom(
            {'list': paginator.get_items(), 'page': page, 'total_pages': total_pages, 'total_unread': total_unread}
        )

    @system_call
    def post(self):
        send_message(**request.json)
        return Result.success()

    def put(self, message_id):
        message = UserMessage.query.filter_by(id=message_id).first()
        message.read = True
        db.session.commit()
        return Result.success()


class UserGroups(API):

    @token_required
    @access_required
    def post(self):
        data = request.get_json()

        group = UserGroup(name=data['name'].upper().strip())
        users = User.query.filter(User.id.in_(data['ids'])).all()

        for user in users:
            group.users.append(user)

        db.session.commit()

        return Result.id(group.id)

    @token_required
    @access_required
    def get(self, group_id=None):
        if group_id is None:
            result = {}
            for item in self._get_user_groups_query().all():
                if item.name not in result:
                    result.update({item.name: {'name': item.name, 'id': item.id, 'users': []}})
                result[item.name]['users'].append({
                    'name': '{} {}'.format(item.first_name, item.last_name),
                    'id': item.id
                })
            return result

        up = self._get_user_groups_query().filter(UserGroup.id == group_id).all()

        if len(up) == 0:
            raise HttpNotFoundException()

        result = {'users': []}
        for item in up:
            result['name'] = item.name
            result['id'] = item.id
            result['users'].append({'name': '{} {}'.format(item.first_name, item.last_name), 'id': item.user_id})
        return result

    @staticmethod
    def _get_user_groups_query():
        return UserGroup.query.add_columns(
            UserGroup.name, UserGroup.id, User.first_name, User.last_name, User.id.label('user_id')
        ).join(User, UserGroup.users)

def get_user_attr(user: User):
    return {
        'preferences': json.loads(
            user.attributes.user_preferences
        ) if hasattr(user.attributes, 'user_preferences') else {},
        'access': json.loads(
            user.attributes.user_access
        ) if hasattr(user.attributes, 'user_access') else {}
    }


def user_to_dict(user: User) -> dict:
    return {
        'user': {
            'email': user.email,
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'roles':
                list(map(lambda r: {
                    'name': r.name,
                    'id': r.id,
                    'permissions': r.get_permissions
                }, user.roles)),
            'attributes': get_user_attr(user)

        },
        'token': user.get_token()
    }
