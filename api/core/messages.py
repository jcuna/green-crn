import sqlalchemy
from flask_socketio import emit

from core import get_logger
from dal import db
from dal.user import UserMessage


def send_message(user_id, subject, body):
    try:
        message = UserMessage(user_id=user_id, subject=subject, message=body)
        db.session.add(message)
        db.session.commit()
        db.session.refresh(message)
        emit(
            'USER_WS_MESSAGE',
            {'data': dict(message)},
            namespace='/messages/%s' %user_id,
            broadcast=True
        )
    except sqlalchemy.exc.SQLAlchemyError as e:
        logger = get_logger('app')
        logger.exception('Could not send message')
        return False
    return True
