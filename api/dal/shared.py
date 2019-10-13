from datetime import datetime
from decimal import Decimal, getcontext
from math import ceil
from flask_sqlalchemy import SQLAlchemy, BaseQuery
from sqlalchemy.orm import joinedload
from functools import wraps
import jwt
from views import Result

db = SQLAlchemy()


def row2dict(row):
    d = {}

    if row:
        for column in row.__table__.columns:
            attr = getattr(row, column.name)
            if isinstance(attr, Decimal):
                getcontext().prec = 2
                d[column.name] = str(attr)
            elif isinstance(attr, datetime):
                d[column.name] = str(attr)
            elif not isinstance(attr, str):
                d[column.name] = str(attr) if attr is not None else ''
            else:
                d[column.name] = attr

    return d


def get_fillable(model: db.Model, get_attr_object=False, **kwargs):
    if not hasattr(model, 'fillable') and any(kwargs):
        raise Exception('Must declare a fillable on class ' + model.__name__)

    fillable = {}
    for attribute_name in model.fillable:
        if attribute_name in kwargs:
            if get_attr_object:
                key = getattr(model, attribute_name)
            else:
                key = attribute_name
            fillable[key] = kwargs[attribute_name][0] if isinstance(kwargs[attribute_name], list) else \
                kwargs[attribute_name]

    return fillable


def token_required(f):
    from dal.models import User
    from flask import current_app, request

    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'X-Access-Token' in request.headers:
            token = request.headers['X-ACCESS-TOKEN']

        if not token:
            return Result.error('Token is missing!', 401)

        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.options(joinedload('roles')).filter_by(email=data['email']).first()
        except Exception:
            return Result.error('Token is invalid!', 401)

        request.user = current_user
        return f(*args, **kwargs)

    return decorated


def access_required(f):
    from flask import request
    from core.router import permissions

    @wraps(f)
    def access_decorator(*args, **kwargs):

        if not request.user:
            return Result.error('Invalid user', 401)

        has_access = False

        for role in request.user.roles:
            for name, grant in role.get_permissions.items():
                if name == permissions[request.endpoint]:
                    for access in grant:
                        if access == access_map()[request.method]:
                            has_access = True
                            break

        if not has_access:
            return Result.error('Access denied', 403)

        return f(*args, **kwargs)

    return access_decorator


def access_map():
    return {
        'GET': 'read',
        'PUT': 'write',
        'POST': 'write',
        'DELETE': 'delete'
    }


class Paginator:
    per_page = 20

    def __init__(self, query: BaseQuery, page: int = 1, order_by: str = None, order_dir: str = None):
        self.total = query.count()
        self.offset = (page * self.per_page) - self.per_page
        self.total_pages = ceil(self.total / self.per_page)
        self.query = query
        self.page = page

        if order_by:
            order_by = getattr(self.query.column_descriptions[0]['type'], order_by)
            order_dir = getattr(order_by, order_dir if order_dir else 'asc')
            self.query = self.query.order_by(order_dir())

    def get_items(self) -> list:
        items = self.get_result()
        return list(map(lambda row: dict(row), items))

    def get_result(self):
        return self.query.offset(self.offset).limit(self.per_page)


class ModelIter(object):

    def __init__(self, *args, **kwargs):
        super(self, *args, **kwargs)

    def __iter__(self):
        if hasattr(self, '__table__'):
            for column in self.__table__.columns:
                attr = getattr(self, column.name)
                if isinstance(attr, Decimal):
                    getcontext().prec = 2
                    yield column.name, str(attr)
                elif isinstance(attr, datetime):
                    yield column.name, str(attr.isoformat())
                elif isinstance(attr, bool) or isinstance(attr, int):
                    yield column.name, attr
                elif not isinstance(attr, str):
                    yield column.name, str(attr) if attr is not None else None
                else:
                    yield column.name, attr
