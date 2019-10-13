from subprocess import PIPE, STDOUT, Popen
from flask import Flask
from flask_mail import Mail
from email.mime.text import MIMEText
import sys
import hashlib
import uuid
from datetime import datetime
from random import random
import os
from importlib.machinery import SourceFileLoader


configs = SourceFileLoader('settings', os.environ.get('APP_SETTINGS_PATH')).load_module()


def debug():
    """
    turns on pycharm debugger on runtime
    :return:
    """
    import pydevd
    pydevd.settrace('host.docker.internal', port=9001, stdoutToServer=False, stderrToServer=False)


def get_mail(app_instance: Flask):

    # needed so it can parse config
    smtp_mail = Mail(app_instance)

    if app_instance.debug:
        sendmail = Sendmail(app_instance)
        return sendmail.sendmail

    return smtp_mail.send


class Sendmail:

    app = None

    def __init__(self, app: Flask):
        self.app = app

    def sendmail(self, message):

        sm = Popen([self.app.config['MAIL_MAILER'], self.app.config['MAIL_MAILER_FLAGS']],
                   stdin=PIPE, stdout=PIPE, stderr=STDOUT)
        sm.stdin.write(self.get_message(message))
        sm.communicate()

        return sm.returncode

    @staticmethod
    def get_message(message):

        if message.html:
            msg = MIMEText(message.html, 'html', message.charset)
        elif message.body:
            msg = MIMEText(message.body, 'plain', message.charset)

        msg['Subject'] = message.subject
        msg['To'] = ', '.join(message.recipients)
        msg['From'] = message.sender
        if message.cc:
            if hasattr(message.cc, '__iter__'):
                msg['Cc'] = ', '.join(message.cc)
            else:
                msg['Cc'] = message.cc
        if message.bcc:
            if hasattr(message.bcc, '__iter__'):
                msg['Bcc'] = ', '.join(message.bcc)
            else:
                msg['Bcc'] = message.bcc
        if message.reply_to:
            msg['Reply-To'] = message.reply_to

        msg_str = msg.as_string()
        if sys.version_info >= (3, 0) and isinstance(msg_str, str):
            return msg_str.encode(message.charset or 'utf-8')
        else:
            return msg_str


def random_token(more_entropy=random() * random()):
    s = str(datetime.utcnow().timestamp()) + str(uuid.uuid4().hex[:32] + str(more_entropy))
    return hashlib.sha256(s.encode('utf8')).hexdigest()
