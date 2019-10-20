from core import API
from dal.user import CompanyProfile
from views import Result

class Company(API):
    def get(self):
        return Result.model(CompanyProfile.query.first())
