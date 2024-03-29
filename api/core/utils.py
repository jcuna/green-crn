import logging
import os
from datetime import datetime
from pathlib import Path


import pytz
import boto3
from flask import Flask
import requests
from urllib import parse
from requests.auth import HTTPDigestAuth
import xmltodict

from logging.handlers import TimedRotatingFileHandler
from config import configs


def configure_loggers(app: Flask):
    if configs.APP_ENV == 'production':
        logging.basicConfig()
    elif hasattr(configs, 'TESTING') and configs.TESTING:
        return
    elif len(app.logger.handlers) == 0 or isinstance(app.logger.handlers[0], logging.StreamHandler):
        level = logging.DEBUG if app.debug else logging.INFO

        boto3.set_stream_logger('', level + logging.DEBUG)

        app_logger = get_logger('app')

        # combine these loggers into app/root loggers
        for logger in [app.logger, logging.getLogger('gunicorn')]:
            logger.setLevel(level)
            logger.propagate = False
            logger.handlers = app_logger.handlers
        # log sqlalchemy queries to a file
        db_logging = logging.getLogger('sqlalchemy')
        db_logging.propagate = False
        db_logging.setLevel(logging.INFO)
        db_logging.handlers = get_logger('sql').handlers


def get_logger(name):
    """
    return a logger with default settings

    :return: Logger
    """
    logger = logging.getLogger(name)
    if len(logger.handlers) > 0 or hasattr(configs, 'TESTING'):
        return logger

    logger.propagate = False
    level = logging.DEBUG if configs.DEBUG else logging.INFO
    logger.setLevel(level)

    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    if configs.APP_ENV == 'production':
        handler = logging.StreamHandler()
    else:
        handler = create_file_log_handler(name)

    handler.setFormatter(formatter)
    handler.setLevel(level)
    logger.addHandler(handler)
    return logger


def create_file_log_handler(name):
    handler = TimedRotatingFileHandler(log_path + name + '.log', when='midnight', backupCount=2)
    return handler


def local_to_utc(date: str) -> datetime:
    """
    Converts a date string to a utc aware datetime object
    Use this before storing any manually set date
    :param date: str
    :return: datetime
    """
    date = datetime.strptime(date, '%Y-%m-%d %H:%M:%S')
    localized = pytz.timezone(configs.TIME_ZONE).localize(date)
    return localized.astimezone(pytz.utc)


def utc_to_local(date: datetime) -> datetime:
    """
    Converts UTC date to local datetime object
    Use it before returning date to the client or convert it on client side (recommended).
    :param date: datetime
    :return: datetime
    """
    return date.astimezone(pytz.timezone(configs.TIME_ZONE))


class EGaugeAPI:
    def __init__(self, egauge_url):
        self.realm = parse.urlparse(egauge_url)

    def get_data_egauge(self):
        return self._call_api(configs.EGAUGE_DATA_ENDPOINT)

    def get_month_range_egauge(self):
        return self._call_api(configs.EGAUGE_MONTH_RANGE_ENDPOINT)

    def _call_api(self, endpoint):
        url = '{}://{}/{}'.format(self.realm.scheme, self.realm.hostname, endpoint)
        resp = requests.get(
            url,
            auth=HTTPDigestAuth(configs.EGAUGE_USER, configs.EGAUGE_PASSWORD),
            headers={'Host': self.realm.hostname}
        )
        return xmltodict.parse(resp.content)


app_path = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
log_path = app_path + '/log/'

if not Path(log_path).is_dir():
    os.mkdir(log_path)
