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
    def custom(result: dict):
        return result, 200

    @staticmethod
    def model(data):
        if isinstance(data, list):
            return list(map(dict, data))

        return dict(data)
