import hashlib
from datetime import datetime
from mimetypes import guess_extension
from flask import request
from sqlalchemy.orm import joinedload
from config import configs
from config.constants import DOCUMENT_UPLOAD_BUCKET
from core import API
from core.AWS import Storage
from core.middleware import HttpException
from core.utils import local_to_utc
from dal.customer import Customer, CustomerProject, CustomerInstallation, InstallationPanelModel, \
    InstallationInverterModel, InstallationDocument
from dal.shared import Paginator, token_required, access_required, get_fillable, db
from views import Result


class Customers(API):

    @token_required
    @access_required
    def get(self, customer_id=None):
        if customer_id:
            customer = Customer.query.options(
                joinedload('customer_projects'),
                joinedload('customer_installations'),
                joinedload('customer_installations.panels.panel_model'),
                joinedload('customer_installations.inverters.inverter_model'),
                joinedload('customer_installations.installation_documents')
            ).filter_by(id=customer_id)

            return Result.model(customer.first())

        page = request.args.get('page', 1)
        total_pages = 1
        q = request.args.get('query')

        if q:
            customers = Customer.query.filter(
                (Customer.first_name.like('%' + q + '%')) |
                (Customer.last_name.like('%' + q + '%')) |
                (Customer.primary_email.like('%' + q + '%')) |
                (Customer.primary_phone.like('%' + q + '%'))
                (Customer.identification_number.like('%' + q + '%'))
            ).all()
        else:
            paginator = Paginator(
                Customer.query,
                int(page),
                request.args.get('orderBy', 'last_name'),
                request.args.get('orderDir', 'desc')
            )
            total_pages = paginator.total_pages
            customers = paginator.get_items()

        return Result.paginate(customers, page, total_pages)

    @token_required
    @access_required
    def post(self):

        c = Customer(**get_fillable(Customer, **request.get_json()))
        db.session.add(c)
        db.session.commit()
        return Result.id(c.id)

    @token_required
    @access_required
    def put(self, customer_id):
        c = Customer.query.filter_by(id=customer_id).first()
        if not c:
            raise HttpException('Not found', 404)

        json = get_fillable(Customer, **request.get_json())
        for field, value in json.items():
            setattr(c, field, value)

        db.session.commit()
        return Result.success('Success', 201)


class CustomerProjects(API):

    @token_required
    @access_required
    def post(self):

        c = CustomerProject(**get_fillable(CustomerProject, **request.get_json()))
        db.session.add(c)
        db.session.commit()
        return Result.id(c.id)


class CustomerInstallations(API):

    @token_required
    @access_required
    def post(self):

        data = request.get_json().copy()
        data['start_date'] = local_to_utc(data['start_date'])

        c = CustomerInstallation(**get_fillable(CustomerInstallation, **data))
        if 'panels' in data:
            for panel in data['panels']:
                c.panels.append(
                    InstallationPanelModel(panel_model_id=panel['id'], panel_quantity=panel['quantity'])
                )

        if 'inverters' in data:
            for inverter in data['inverters']:
                c.inverters.append(
                    InstallationInverterModel(inverter_model_id=inverter['id'], inverter_quantity=inverter['quantity'])
                )

        db.session.add(c)
        db.session.commit()
        return Result.id(c.id)


class CustomerDocuments(API):

    bucket = configs.BUCKETS_PREFIX + DOCUMENT_UPLOAD_BUCKET

    @token_required
    @access_required
    def post(self):
        name = request.form.get('name')
        installation_id = request.form.get('customer_installation_id')
        file = request.files.get('file')

        extension = guess_extension(file.content_type)

        key_name = 'documents/%s/%s-%s' % (installation_id, name, hashlib.sha256(
            (str(datetime.utcnow().timestamp()) + name + extension + installation_id).encode('utf8')
        ).hexdigest() + extension)

        s3 = Storage(self.bucket)

        inst_doc = InstallationDocument(
            name=name,
            customer_installation_id=installation_id,
            file_extension=extension,
            object_key=key_name
        )
        s3.put_new(file.read(), key_name, file.content_type)
        file.close()

        db.session.add(inst_doc)
        db.session.commit()

        return Result.success()
