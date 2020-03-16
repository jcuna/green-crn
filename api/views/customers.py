import hashlib
from datetime import datetime
from mimetypes import guess_extension, guess_all_extensions
from flask import request
from sqlalchemy.orm import joinedload
from config import configs
from core import API, Cache
from core.AWS import Storage
from core.middleware import HttpException
from core.utils import local_to_utc
from dal.customer import Customer, CustomerProject, Installations, InstallationPanelModel, \
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
                joinedload('customer_projects.installations'),
                joinedload('customer_projects.installations.panels.panel_model'),
                joinedload('customer_projects.installations.inverters.inverter_model'),
                joinedload('customer_projects.installations.installation_documents')
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

    @token_required
    @access_required
    def put(self, project_id):
        c = CustomerProject.query.filter_by(id=project_id).first()
        if not c:
            raise HttpException('Not found', 404)

        json = get_fillable(CustomerProject, **request.get_json())
        for field, value in json.items():
            setattr(c, field, value)

        db.session.commit()
        return Result.success('Success', 201)


class CustomerInstallations(API):

    @token_required
    @access_required
    def post(self):

        data = request.get_json().copy()
        data['start_date'] = local_to_utc(data['start_date'])

        c = Installations(**get_fillable(Installations, **data))
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


    @token_required
    @access_required
    def put(self, installation_id):
        c = Installations.query.filter_by(id=installation_id).first()

        if not c:
            raise HttpException('Not found', 404)

        json = get_fillable(Installations, **request.get_json())

        for field, value in json.items():
            setattr(c, field, value)

        data = request.get_json().copy()
        if 'panels' in data:
            for panel in data['panels']:
                d =  InstallationPanelModel.query.filter_by(panel_model_id=panel['id'],installation_id=installation_id).first()
                if d:
                    setattr(d,'panel_quantity', int(panel['quantity']))

        if 'inverters' in data:
            for inverter in data['inverters']:
                e =  InstallationInverterModel.query.filter_by(inverter_model_id=inverter['id'],installation_id=installation_id).first()
                if e:
                    setattr(e,'inverter_quantity', int(inverter['quantity']))

        db.session.commit()
        return Result.success('Success', 201)


class CustomerDocuments(API):

    @token_required
    @access_required
    def post(self):
        name = request.form.get('name')
        category = request.form.get('category')
        installation_id = request.form.get('installation_id')
        file = request.files.get('file')

        extension = max(guess_all_extensions(file.content_type),key=len)

        key_name = 'documents/{}/{}'.format(installation_id, hashlib.sha256(
            (str(datetime.utcnow().timestamp()) + name + extension + installation_id).encode('utf8')
        ).hexdigest() + extension)

        s3 = Storage(configs.UPLOAD_FILE_BUCKET)

        inst_doc = InstallationDocument(
            name=name,
            installation_id=installation_id,
            category=category,
            object_key=key_name
        )
        s3.put_new(file.read(), key_name, file.content_type)
        file.close()

        db.session.add(inst_doc)
        db.session.commit()

        return Result.success()

    @token_required
    @access_required
    def get(self, installation_id=None):
        page = int(request.args.get('page', 1))

        if installation_id:
            docs = Installations.query.filter_by(id=installation_id).first()
            if docs:
                s3 = Storage(configs.UPLOAD_FILE_BUCKET)
                row = dict(docs)
                row['signed_urls'] = []
                if docs:
                    [row['signed_urls'].append({
                        'category': installation_document.category,
                        'name': installation_document.name,
                        'object': installation_document.object_key,
                        'url': Cache.remember(
                            'f_%s' % installation_document.object_key,
                            lambda: s3.sign_url(installation_document.object_key),
                            14400
                        )
                    }
                    ) for installation_document in docs.installation_documents]

                return row
            else:
                raise HttpException('Not found')

        else:
            paginator = Paginator(InstallationDocument.query, page, request.args.get('orderBy'), request.args.get('orderDir'))
            total_pages = paginator.total_pages
            result = paginator.get_items()

        return Result.paginate(result, page, total_pages)

    @token_required
    @access_required
    def delete(self, installation_id):
        object_key = request.get_json()['object_key']
        doc = InstallationDocument.query.filter_by(object_key=object_key, installation_id=installation_id).first()

        if not doc:
            raise HttpException('Invalid id')

        db.session.delete(doc)
        db.session.commit()

        s3 = Storage(configs.UPLOAD_FILE_BUCKET)
        s3.remove(object_key)

        return Result.success()