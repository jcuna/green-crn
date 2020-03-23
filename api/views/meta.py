from sqlalchemy.orm import joinedload

from config.constants import DOCUMENTS_SECTION_CLIENT, DOCUMENTS_SECTION_LEGAL, DOCUMENTS_SECTION_DISTRIBUTOR, \
    DOCUMENTS_SECTION_CNE, OTHER
from core import API
from dal.customer import Country, SourceProject, ProjectType, Distributor, Rate, Transformer, TrCapacity, Phase, \
    Tension, PanelModel, InverterModel
from dal.shared import token_required, access_required
from views import Result

class Countries(API):

    @token_required
    @access_required
    def get(self):
        return Result.model(Country.query.options(joinedload('provinces')).all())


class SourceProjects(API):
    @token_required
    @access_required
    def get(self):
        return Result.model(SourceProject.query.all())


class ProjectTypes(API):
    @token_required
    @access_required
    def get(self):
        return Result.model(ProjectType.query.all())


class Distributors(API):
    @token_required
    @access_required
    def get(self):
        return Result.model(Distributor.query.all())


class Rates(API):
    @token_required
    @access_required
    def get(self):
        return Result.model(Rate.query.all())


class Transformers(API):
    @token_required
    @access_required
    def get(self):
        return Result.model(Transformer.query.all())


class TrCapacities(API):
    @token_required
    @access_required
    def get(self):
        return Result.model(TrCapacity.query.all())


class Phases(API):
    @token_required
    @access_required
    def get(self):
        return Result.model(Phase.query.all())


class Tensions(API):
    @token_required
    @access_required
    def get(self):
        return Result.model(Tension.query.all())


class PanelModels(API):
    @token_required
    @access_required
    def get(self):
        return Result.model(PanelModel.query.all())


class InverterModels(API):
    @token_required
    @access_required
    def get(self):
        return Result.model(InverterModel.query.all())

class DocumentCategories(API):
    @token_required
    @access_required
    def get(self):

        return [OTHER, DOCUMENTS_SECTION_CLIENT, DOCUMENTS_SECTION_LEGAL, DOCUMENTS_SECTION_DISTRIBUTOR, DOCUMENTS_SECTION_CNE]

class DocumentTypes(API):
    @token_required
    @access_required
    def get(self):

        return 1
