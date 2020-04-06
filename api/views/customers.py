import hashlib
from datetime import datetime
from mimetypes import guess_all_extensions
from flask import request
from sqlalchemy.orm import joinedload
from config import configs
from config.constants import DOCUMENT_CATEGORIES
from core import API, Cache, utils
from core.AWS import Storage
from core.middleware import HttpException, HttpNotFoundException
from core.utils import local_to_utc, EGaugeAPI
from dal.customer import Customer, CustomerProject, Installation, InstallationPanelModel, \
    InstallationInverterModel, InstallationDocument, InstallationStatus
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
                joinedload('customer_projects.installations.installation_documents'),
                joinedload('customer_projects.installations.installation_status'),
                joinedload('customer_projects.installations.financing')
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
            raise HttpNotFoundException()

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
        project = CustomerProject.query.filter_by(id=project_id).first()
        if not project:
            raise HttpNotFoundException()

        json = get_fillable(CustomerProject, **request.get_json())
        for field, value in json.items():
            setattr(project, field, value)

        db.session.commit()
        return Result.success('Success', 201)


class CustomerInstallations(API):

    @token_required
    @access_required
    def post(self):

        data = request.get_json().copy()
        data['start_date'] = local_to_utc(data['start_date'])

        c = Installation(**get_fillable(Installation, **data))
        if 'panels' in data:
            for panel in data['panels']:
                c.panels.append(
                    InstallationPanelModel(
                        model_id=panel['id'], quantity=panel['quantity'], serials=panel['serials']
                    )
                )

        if 'inverters' in data:
            for inverter in data['inverters']:
                c.inverters.append(
                    InstallationInverterModel(
                        model_id=inverter['id'], quantity=inverter['quantity'], serials=inverter['serials']
                    )
                )
        c.installation_status = InstallationStatus()
        db.session.add(c)
        db.session.commit()
        return Result.id(c.id)


    @token_required
    @access_required
    def put(self, installation_id):
        c = Installation.query.filter_by(id=installation_id).first()

        if not c:
            raise HttpNotFoundException()

        json = get_fillable(Installation, **request.get_json())

        for field, value in json.items():
            setattr(c, field, value)

        data = request.get_json().copy()
        if 'panels' in data:
            InstallationPanelModel.query.filter_by(installation_id=installation_id).delete()
            for panel in data['panels']:
                db.session.add(InstallationPanelModel(
                    installation_id=installation_id, model_id=panel['id'], quantity=int(panel['quantity']), serials=panel['serials'])
                )
        if 'inverters' in data:
            InstallationInverterModel.query.filter_by(installation_id=installation_id).delete()
            for inverter in data['inverters']:
                db.session.add(InstallationInverterModel(
                    installation_id=installation_id,
                    model_id=inverter['id'],
                    quantity=int(inverter['quantity']),
                    serials=inverter['serials']
                ))

        db.session.commit()
        return Result.success('Success', 201)


class CustomerDocuments(API):

    @token_required
    @access_required
    def post(self):
        category = request.form.get('category')
        name = request.form.get('name')
        installation_id = request.form.get('installation_id')
        file = request.files.get('file')

        if category not in DOCUMENT_CATEGORIES:
            raise HttpException('Invalid Category')

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
            docs = Installation.query.filter_by(id=installation_id).first()
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
                raise HttpNotFoundException()

        else:
            paginator = Paginator(
                InstallationDocument.query,
                page,
                request.args.get('orderBy'),
                request.args.get('orderDir')
            )
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


class EGauge(API):
    # TODO: Uncomment following two lines
    # @token_required
    # @access_required
    def get(self, installation_id):
        inst = Installation.query.filter_by(id=installation_id).first()
        if inst is None:
            raise HttpNotFoundException()
        egauge = EGaugeAPI(inst.egauge_url)
        return egauge.get_month_range_egauge()
