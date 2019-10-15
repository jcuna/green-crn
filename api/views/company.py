from core import API
from dal.models import CompanyProfile
from views import Result

class Company(API):
    def get(self):
        return Result.model(CompanyProfile.query.first())
