import os
import struct
import socket
from config import configs
from core import get_logger
from queue import Queue, Empty
import atexit

LENGTH_INDICATOR_SIZE = 4
MAX_MSG_LENGTH = 8192
ACTION_PUSH = 1
ACTION_PULL = 2
SERVER_ADDRESS = configs.SOCKET_ADDRESS if hasattr(configs, 'SOCKET_ADDRESS') else '/var/run/mem_queue.sock'
ACTION_QUEUE_DELIMITER = '~:~'
MESSAGE_RECEIVED = b'ok'
EMPTY_QUEUE = b'empty'

socket_client = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)


class MessageNotQueuedError(Exception):
    pass


class InvalidMessageLengthIndicator(Exception):
    pass


class InvalidMessageActionType(Exception):
    pass


class MaxMessageSizeExceededError(Exception):
    pass


def encode_message(message: bytes):
    return struct.pack('>I', len(message)) + message


def decode_message(message: bytes):
    return struct.unpack('>I', message)[0]


def terminate_worker(code=0):
    logger = get_logger('queue')
    logger.info('Terminating service')
    socket_client.close()
    exit(code)


def init_queue():
    atexit.register(terminate_worker)
    logger = get_logger('queue')
    logger.info('Starting queue service')
    try:
        os.unlink(SERVER_ADDRESS)
    except OSError:
        if os.path.exists(SERVER_ADDRESS):
            raise

    socket_client.bind(SERVER_ADDRESS)
    socket_client.listen(1)
    return logger


def run():
    logger = init_queue()
    task_queue = Queue()
    while True:
        logger.debug('waiting for a connection')
        connection, client_address = socket_client.accept()
        try:
            logger.debug('connection from %s' % client_address)
            raw_msg_len = connection.recv(LENGTH_INDICATOR_SIZE)
            if not raw_msg_len:
                raise InvalidMessageLengthIndicator('Invalid message sent. Missing length information')
            msg_len = decode_message(raw_msg_len)

            data = connection.recv(msg_len).decode('utf8')

            if data:
                action, msg = data.split(ACTION_QUEUE_DELIMITER)
                user_msg_len = len(msg)
                if len(msg) > MAX_MSG_LENGTH:
                    raise MaxMessageSizeExceededError(
                        'Message length exceeded maximum size: actual size %s' % user_msg_len
                    )
                if int(action) == ACTION_PUSH:
                    logger.info('received %s bytes of data' % user_msg_len)
                    connection.sendall(encode_message(MESSAGE_RECEIVED))
                    task_queue.put(msg.encode('utf8'))
                elif int(action) == ACTION_PULL:
                    logger.debug('received queue message request')
                    try:
                        queue_msg = task_queue.get_nowait()
                        connection.sendall(encode_message(queue_msg))
                    except Empty:
                        connection.sendall(encode_message(EMPTY_QUEUE))
                else:
                    raise InvalidMessageActionType('Invalid action type passed')
        except (InvalidMessageLengthIndicator, InvalidMessageActionType, MaxMessageSizeExceededError) as ex:
            connection.sendall(encode_message(str(ex).encode('utf8')))
            logger.exception(str(ex))
        finally:
            logger.debug('Ended connection from %s' % client_address)
            connection.close()
