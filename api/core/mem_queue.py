import sys
import socket
from core.queue_worker import \
    SERVER_ADDRESS, ACTION_QUEUE_DELIMITER, ACTION_PUSH, ACTION_PULL, \
    LENGTH_INDICATOR_SIZE, encode_message, decode_message, EMPTY_QUEUE, MESSAGE_RECEIVED, MessageNotQueuedError


def send_msg(message: str):
    """
    we want this to return ASAP
    we trust that it went mostly OK
    :param message: str
    :return bool:
    """

    socket_client = request_reply(ACTION_PUSH, message)
    resp = True
    msg_len = decode_message(socket_client.recv(LENGTH_INDICATOR_SIZE))
    # Read the message data
    if msg_len:
        msg = socket_client.recv(msg_len)
        if msg != MESSAGE_RECEIVED:
            raise MessageNotQueuedError(msg)

    socket_client.close()
    return resp


def receive_msg():
    """
    Retrieves a message from queue and will return None if queue is empty
    :return message: str|None
    """
    socket_client = request_reply(ACTION_PULL, '')

    resp = None
    msg_len = decode_message(socket_client.recv(LENGTH_INDICATOR_SIZE))
    # Read the message data
    if msg_len:
        msg = socket_client.recv(msg_len)
        if msg != EMPTY_QUEUE:
            resp = msg.decode('utf8')

    socket_client.close()
    return resp


def request_reply(action, msg):
    try:
        encoded = (str(action) + ACTION_QUEUE_DELIMITER + msg).encode('utf-8')
        socket_client = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        socket_client.settimeout(1)
        socket_client.connect(SERVER_ADDRESS)

        socket_client.sendall(encode_message(encoded))
        return socket_client

    except socket.error as err:
        print('message not sent', sys.stderr)
        raise err
