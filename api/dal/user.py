import json
from datetime import datetime, timedelta

from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy.orm import relationship, deferred
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from sqlalchemy.dialects import sqlite

from dal import db
from dal.shared import ModelIter
from config import random_token, configs
from config.routes import default_access

# sqlite is used for testing and it does not auto increment Big Int since there's no support
BigInteger = db.BigInteger().with_variant(sqlite.INTEGER(), 'sqlite')

admin_access = {
    'company': '*'
}

admin_preferences = {}

user_roles = db.Table(
    'user_roles',
    db.Column('id', BigInteger, primary_key=True),
    db.Column('user_id', BigInteger, db.ForeignKey('users.id'), index=True),
    db.Column('role_id', BigInteger, db.ForeignKey('roles.id'), index=True)
)


class User(db.Model, ModelIter):
    __tablename__ = 'users'
    allowed_widget = True
    fillable = ['password', 'email', 'first_name', 'last_name', 'deleted']

    id = db.Column(BigInteger, primary_key=True)
    email = db.Column(db.String(50, collation=configs.DB_COLLATION), nullable=False, unique=True)
    password = db.Column(db.String(80, collation=configs.DB_COLLATION), nullable=True)
    first_name = db.Column(db.String(50, collation=configs.DB_COLLATION), nullable=False, index=True)
    last_name = db.Column(db.String(50, collation=configs.DB_COLLATION), nullable=False, index=True)
    created_at = db.Column(db.DateTime(), nullable=False, default=datetime.utcnow)
    deleted = db.Column(db.Boolean, nullable=False, server_default='0', index=True)
    roles = relationship('Role', secondary=user_roles, lazy='joined', backref=db.backref('users', lazy='dynamic'))
    tokens = relationship('UserToken', back_populates='user')
    attributes = relationship('UserAttributes', back_populates='user', lazy='joined', uselist=False)
    audit = relationship('Audit')

    def hash_password(self):
        self.password = generate_password_hash(str(self.password).encode('ascii'), method='sha256')

    def password_correct(self, plain_password):
        return check_password_hash(self.password, plain_password)

    def get_token(self):
        exp = datetime.utcnow() + timedelta(minutes=30)
        return {
            'value': jwt.encode(
                {'email': self.email, 'exp': exp},
                configs.SECRET_KEY,
                algorithm='HS256').decode('utf-8'),
            'expires': round(exp.timestamp())
        }


class UserAttributes(db.Model, ModelIter):
    __tablename__ = 'user_attributes'

    ua_id = db.Column(BigInteger, primary_key=True)
    user_id = db.Column(BigInteger, db.ForeignKey('users.id'), index=True)
    user_access = db.Column(
        db.Text(collation=configs.DB_COLLATION),
        comment='A JSON schema of table/rows access',
        nullable=False,
        default='{}'
    )
    user_preferences = db.Column(
        db.Text(collation=configs.DB_COLLATION),
        comment='A JSON schema user preferences',
        nullable=False,
        default='{}'
    )

    user = relationship(User, back_populates='attributes', uselist=False)

    @property
    def preferences(self):
        return json.loads(self.user_preferences)

    @property
    def access(self):
        return json.loads(self.user_access)


class UserToken(db.Model, ModelIter):
    __tablename__ = 'user_tokens'

    id = db.Column(BigInteger, primary_key=True)
    user_id = db.Column(BigInteger, db.ForeignKey('users.id'), index=True)
    token = db.Column(db.String(64, collation=configs.DB_COLLATION, ), unique=True, nullable=False)
    expires = db.Column(db.DateTime(), nullable=False)
    target = db.Column(
        db.String(250, collation=configs.DB_COLLATION),
        comment='Target api url where token will be validated',
        nullable=False
    )

    user = relationship(User, back_populates='tokens')

    def new_token(self, email: str, expires: datetime = None):
        while not self.token:
            temp_token = random_token(email)
            so = self.query.filter_by(token=temp_token).count()

            if not so:
                self.token = temp_token

        self.expires = expires if expires else datetime.utcnow() + timedelta(hours=4)


class Role(db.Model, ModelIter):
    __tablename__ = 'roles'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30, collation=configs.DB_COLLATION), index=True)
    permissions = db.Column(db.Text(collation=configs.DB_COLLATION))

    @property
    def get_permissions(self):

        combined_permissions = default_access.copy()

        if self.permissions:
            for key, userGrants in json.loads(self.permissions).items():
                for defaultKey, defaultGrants in default_access.items():
                    if key == defaultKey:
                        for grant in defaultGrants:
                            if grant not in userGrants:
                                userGrants.append(grant)

                combined_permissions.update({key: userGrants})

        return combined_permissions


class Audit(db.Model, ModelIter):
    __tablename__ = 'audits'

    id = db.Column(BigInteger, primary_key=True)
    date = db.Column(db.DateTime(), nullable=False, index=True, default=datetime.utcnow)
    user_id = db.Column(BigInteger, db.ForeignKey('users.id'), index=True, nullable=True)
    ip = db.Column(db.String(15), nullable=False)
    endpoint = db.Column(db.String(255, collation=configs.DB_COLLATION), nullable=False)
    method = db.Column(db.String(7, collation=configs.DB_COLLATION), nullable=False)
    headers = db.Column(db.Text(collation=configs.DB_COLLATION))
    payload = db.Column(db.Text(collation=configs.DB_COLLATION))
    response = db.Column(db.Text(collation=configs.DB_COLLATION))

    user = relationship(User, uselist=False)


class CompanyProfile(db.Model, ModelIter):
    __tablename__ = 'company_profile'
    allowed_widget = True
    fillable = ['name', 'address', 'contact', 'logo']

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30, collation=configs.DB_COLLATION), unique=True, nullable=False)
    address = db.Column(db.Text(collation=configs.DB_COLLATION), nullable=False)
    contact = db.Column(db.String(10, collation=configs.DB_COLLATION), nullable=False)
    logo = db.Column(db.LargeBinary)
    settings = db.Column(
        MutableDict.as_mutable(db.JSON),
        comment='A JSON schema for global settings',
        nullable=False,
        server_default='{}')


class UserMessage(db.Model, ModelIter):
    __tablename__ = 'user_messages'
    allowed_widget = True

    id = db.Column(BigInteger, primary_key=True)
    user = relationship(User, uselist=False)
    date = db.Column(db.DateTime(), nullable=False, default=datetime.utcnow)
    read = db.Column(db.Boolean, nullable=False, index=True, server_default='0')
    subject = db.Column(db.String(255, collation=configs.DB_COLLATION), nullable=False)
    message = db.Column(db.Text(collation=configs.DB_COLLATION))

    user_id = db.Column(BigInteger, db.ForeignKey('users.id'), index=True, nullable=True)


class Note(db.Model, ModelIter):
    __tablename__ = 'notes'
    allowed_widget = True

    id = db.Column(db.Integer, primary_key=True)
    user = relationship(User, backref='notes')
    comment = db.Column(db.String)
    date = db.Column(db.DateTime())
    model_name = db.Column(db.String(96, collation=configs.DB_COLLATION), nullable=False)
    model_id = db.Column(db.Integer, index=True, nullable=True)

    user_id = deferred(db.Column(BigInteger, db.ForeignKey('users.id'), index=True, nullable=True))

    __table_args__ = (db.Index('note_model_name_id_idx', model_name, model_id), )
