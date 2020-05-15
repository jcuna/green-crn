import base64
import importlib
import json
import re
from datetime import datetime
from io import BytesIO
from urllib.parse import unquote

import pdfkit
import pytz

from PIL import Image
from dateutil.relativedelta import relativedelta
from flask import request, current_app, render_template, send_file, session
from flask_mail import Message
from kanpai import Kanpai
from markupsafe import Markup
from sqlalchemy import desc, asc, and_, or_

from config import configs
from core import API
from core.middleware import HttpException
from dal.user import User, CompanyProfile
from dal.customer import Customer
from dal.shared import token_required, db, access_required
from views import Result


ACTION_PDF = 'pdf'
ACTION_HTML = 'html'
TAG_RE = re.compile(r'<[^>]+>')

EQ = 'eq'
NE = 'ne'
GT = 'gt'
LT = 'lt'
GTE = 'ge'
LTE = 'le'

COMPARATOR = [EQ, NE, GT, LT, GTE, LTE]

TODAY = 'today'
YESTERDAY = 'yesterday'
TOMORROW = 'tomorrow'

RELATIVE_VALUES = [TODAY, YESTERDAY, TOMORROW]

class Email(API):

    @token_required
    def post(self, action):
        model_id = request.form.get('model_id')
        model = request.form.get('model')

        title = request.form.get('title')
        template = request.form.get('template')
        if not model or not model_id or not template:
            raise HttpException('missing required values')

        q = db.session.query()
        if model == 'user':
            email = q.add_columns(User.email).filter(User.id == model_id).first()
        elif model == 'customer':
            email = q.add_columns(Customer.email).filter(Customer.id == model_id).first()
        else:
            raise HttpException('Invalid model')

        if email is not None:

            if action == ACTION_PDF:
                meta, png = request.form.get('png').split(',')
                email_pdf(email.email, BytesIO(base64.b64decode(png)), template, title)
                return Result.success()
            elif action == ACTION_HTML:
                body = request.form.get('body')
                email_html(email.email, base64.b64decode(body).decode(), template, title)
                return Result.success()

        raise HttpException('invalid request')


def email_pdf(email: str, png: BytesIO, template, title=''):
    date = datetime.now(tz=pytz.timezone(configs.TIME_ZONE)).strftime('%m-%d-%Y %I:%M:%S %p')
    msg = Message('Recibo %s' % date, recipients=[email])

    rgba = Image.open(png)
    rgb = Image.new('RGB', rgba.size, (255, 255, 255))  # white background
    rgb.paste(rgba, mask=rgba.split()[3]) # paste using alpha channel as mask
    pdf = BytesIO()
    rgb.save(pdf, 'PDF', quality=95, optimize=True)

    msg.attach('recibo-%s.pdf' % date, 'application/pdf', pdf.getvalue(), 'attachment')
    msg.html = render_template(
        template,
        body=Markup('<h3>%s</h3>' % title)
    )
    current_app.mail(msg)


def email_html(email: str, body, template, title=''):
    date = datetime.now(tz=pytz.timezone(configs.TIME_ZONE)).strftime('%m-%d-%Y %I:%M:%S %p')
    msg = Message('Recibo %s' % date, recipients=[email])

    msg.html = render_template(
        template,
        body=Markup('<h3>%s</h3>%s' % (title, body))
    )
    msg.body = '%s\n' % title + TAG_RE.sub('\n', body)
    current_app.mail(msg)


class HtmlToPdf(API):

    @token_required
    def post(self):

        extra_css = []
        styles = ''
        template = request.json.get('template', 'print.html')
        data = request.get_json()
        if data is None or 'html' not in data or 'filename' not in data:
            raise HttpException('Missing necessary arguments')
        html = unquote(base64.b64decode(data['html']).decode())
        filename = data['filename'] + '.pdf'
        if 'extra_css' in data:
            extra_css = [unquote(base64.b64decode(link).decode()) for link in data['extra_css']]

        if 'styles' in data:
            styles = unquote(base64.b64decode(data['styles']).decode())

        body = render_template(template, body=Markup(html), styles=Markup(styles), extra_css=extra_css)

        fp = BytesIO()
        pdf = pdfkit.from_string(body, False)
        fp.write(pdf)
        fp.seek(0)

        return send_file(fp, attachment_filename=filename, as_attachment=True, cache_timeout=3600)


class Widgets(API):

    processed_models = []

    @token_required
    @access_required
    def get(self):
        models = []
        model: db.ModelIter
        for model in db.Model._decl_class_registry.values():
            self.processed_models.clear()
            if hasattr(model, 'allowed_widget') and model.allowed_widget and isinstance(model, type) \
                    and issubclass(model, db.Model):
                schema = self.build_model_schema(model)
                schema['class'] = '{}.{}'.format(model.__module__, model.__name__)
                models.append(schema)
        return models

    @token_required
    @access_required
    def post(self):
        widget = request.get_json()
        schema = Kanpai.Object({
            'name': (Kanpai.String(error='Widget name is required.').trim().required()
                     .match(r'^[a-zA-Z-_]+$', error='Name may consists of letters, dashes and underscores')),
            'description': (Kanpai.String(error='Widget description is required.').trim().required()),
            'private': Kanpai.Boolean(),
            'schema': (Kanpai.Object({
                'model': Kanpai.String().required().trim().match(r'[a-zA-Z\.]+'),
                'limit': (Kanpai.Number().max(50)),
                'order_dir': Kanpai.String().anyOf('desc', 'asc'),
                'order_by': (Kanpai.String().match(r'^[a-zA-Z-_\.]+$')),
                'conditions': (Kanpai.Array().of(Kanpai.Object({
                    'AND': (Kanpai.Array().of(Kanpai.Object({
                        'column': Kanpai.String().required(),
                        'value': Kanpai.String().required(),
                        'comparator': Kanpai.String().required().anyOf(COMPARATOR)
                    }))),
                    'OR': (Kanpai.Array().of(Kanpai.Object({
                        'column': Kanpai.String(),
                        'value': Kanpai.String()
                    })))
                }).required())),
                'relationships': Kanpai.Array().of(Kanpai.String()),
                'fields': Kanpai.Array().of(Kanpai.String()).required(),
                'labels': Kanpai.Array().of(Kanpai.String())
            }).required(error='Please provide schema.'))
        }).required()

        validation_result = schema.validate(widget.copy())

        if validation_result.get('success', False) is False:
            raise HttpException(validation_result.get('error'))

        private = False
        if 'private' in widget:
            private = True

        if private:
            user = User.query.filter_by(email=session['user_email']).first()
            attr = {}
            if user.attributes.user_preferences:
                attr = user.attributes.preferences
                if 'widgets' not in attr:
                    attr['widgets'] = {}
                attr['widgets'][widget['name']] = widget
            user.attributes.user_preferences = json.dumps(attr)
        else:
            company = CompanyProfile.query.first()
            if 'widgets' not in company.settings:
                company.settings.update({'widgets': {}})
                company.settings['widgets'].update({widget['name']: widget})

        db.session.commit()
        return Result.success()

    def build_model_schema(self, model):
        schema = {'fields': [], 'relationships': []}
        for cln in model.__dict__.keys():
            if hasattr(model.__mapper__.attrs, cln):
                if hasattr(getattr(model.__mapper__.attrs, cln), 'deferred') and \
                        not getattr(model.__mapper__.attrs, cln).deferred:
                    schema['fields'].append(cln)
                elif cln in model.__mapper__.relationships:
                    rel_entity = model.__mapper__.relationships[cln].entity.entity
                    if str(rel_entity) not in self.processed_models:
                        self.processed_models.append(str(rel_entity))
                        relationship = self.build_model_schema(rel_entity)
                        relationship['name'] = cln
                        relationship['class'] = '{}.{}'.format(
                            model.__mapper__.relationships[cln].entity.entity.__module__,
                            model.__mapper__.relationships[cln].entity.entity.__name__
                        )
                        schema['relationships'].append(relationship)
        return schema


class RunWidget(API):

    @token_required
    @access_required
    def get(self, widget_name):
        widget_type = request.args.get('type', 'global')
        if widget_type == 'private':
            user = User.query.filter_by(email=session['user_email']).first()
            if 'widgets' not in user.attributes.preferences or \
                    widget_name not in user.attributes.preferences['widgets']:
                raise HttpException('Not found', 404)
            widget = user.attributes.preferences['widgets'][widget_name]
        else:
            c = CompanyProfile.query.first()
            if 'widgets' not in c.settings or widget_name not in c.settings['widgets']:
                raise HttpException('Not found', 404)
            widget = c.settings['widgets'][widget_name]

        model = self.get_package_component(widget['schema']['model'])

        query = db.session.query(model)
        if 'relationships' in widget['schema'] and widget['schema']['relationships'] is not None:
            for relationship in widget['schema']['relationships']:
                query = query.join(self.get_package_component(relationship))
        columns = []
        for field in widget['schema']['fields']:
            columns.append(self.get_package_component(field))

        query = query.add_columns(*columns)

        if 'order_by' in widget['schema'] and widget['schema']['order_by'] is not None:
            order_dir = desc if 'order_dir' in widget['schema'] and widget['schema']['order_dir'] == 'desc' else asc
            order_by = self.get_package_component(widget['schema']['order_by'])
            query = query.order_by(order_dir(order_by))

        if 'conditions' in widget['schema']:
            for condition in widget['schema']['conditions']:
                query = self._apply_condition(query, condition)

        limit = widget['schema']['limit'] if 'limit' in widget['schema'] else 20
        return Result.query_response(query.limit(limit).all())

    @staticmethod
    def get_package_component(fq_component):
        components = fq_component.split('.')
        mod = importlib.import_module(components[0])
        for comp in components[1:]:
            mod = getattr(mod, comp)
        return mod

    def _apply_condition(self, query, conditions):
        for sql_operator, clauses in conditions.items():
            sql_op = or_ if sql_operator == 'OR' else and_
            all_conditions = []
            if not clauses:
                continue
            for clause in clauses:
                cln = self.get_package_component(clause['column'])
                value = clause['value']
                if clause['value'] in RELATIVE_VALUES:
                    today = datetime.now()
                    if clause['value'] == YESTERDAY:
                        value = today - relativedelta(days=1)
                    elif clause['value'] == TOMORROW:
                        value = today + relativedelta(days=1)
                    else:
                        value = today
                comp = self.get_package_component('operator.{}'.format(clause['comparator']))
                all_conditions.append(comp(cln, value))
            query = query.filter(sql_op(*all_conditions))

        return query


class Health(API):

    def get(self):
        return {'status': 'ok'}
