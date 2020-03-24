import datetime


class Result:

    @staticmethod
    def success(message='Success', code=200):
        return {'message': message}, code

    @staticmethod
    def error(message='Unexpected Error', code=400):
        return {'error': message}, code

    @staticmethod
    def id(_id: int):
        return {'id': _id}, 200

    @staticmethod
    def paginate(result: list, page: int, total_pages: int):
        return {'list': result, 'page': page, 'total_pages': total_pages}, 200

    @staticmethod
    def custom(result: dict, code=200):
        return result, code

    @staticmethod
    def model(data):
        if isinstance(data, list):
            return list(map(dict, data))

        return dict(data)

    @staticmethod
    def query_response(data):
        response = []
        for row in data:
            out = {}
            for field in row.keys():
                val = Result.get_field_value(row, field)
                if not hasattr(val, 'query'):
                    out.update({field: val})
            response.append(out)
        return response

    @staticmethod
    def get_field_value(obj, attr):
        val = getattr(obj, attr)
        if isinstance(val, datetime.date):
            return str(val)
        return val
