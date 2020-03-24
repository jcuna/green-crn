import sys
import traceback
from flask import Flask, jsonify, request
from core import get_logger


class Middleware:

    def __init__(self, app: Flask, debug: bool):
        self.app = app
        self.debug = debug

    def __call__(self, environ, start_response) -> Flask:
        # do any middleware stuff here!
        return self.app(environ, start_response)


def error_handler(app: Flask):
    status_code = 500
    app_logger = get_logger('app')

    def handle_error_response(error: Exception):
        app_logger.error(request.path)
        app_logger.exception(error)
        _, _, tb = sys.exc_info()
        json_output = {
            'error': error.__message__ if isinstance(error, HttpException) else str(error),
        }
        if app.debug:
            json_output['traceback'] = traceback.format_list(traceback.extract_tb(tb))

        response = jsonify(json_output)

        if hasattr(error, 'status_code'):
            response.status_code = error.status_code
        elif hasattr(error, 'code') and isinstance(error.code, int):
            response.status_code = error.code
        else:
            response.status_code = status_code

        return response

    app.register_error_handler(Exception, handle_error_response)


class HttpException(Exception):
    def __init__(self, message, status_code=400):
        super(Exception, self).__init__(message)

        self.__message__ = message
        self.status_code = status_code
