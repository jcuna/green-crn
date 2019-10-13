from random import choice
import pytest


def test_empty_queue(queue_process):
    from core.mem_queue import receive_msg

    assert queue_process.name == 'mem_queue_worker'
    assert receive_msg() is None, 'No messages should be in queue'


def test_send_msg_to_queue(queue_process):
    from core.mem_queue import send_msg

    assert queue_process.name == 'mem_queue_worker'
    assert send_msg('hey bro') is True


def test_receive_msg_from_queue(queue_process):
    from core.mem_queue import receive_msg

    assert queue_process.name == 'mem_queue_worker'

    msg = receive_msg()
    assert msg == 'hey bro'

    assert receive_msg() is None, 'Queue back to empty'


def test_send_multiple_msgs_to_queue(queue_process):
    from core.mem_queue import send_msg

    assert queue_process.name == 'mem_queue_worker'
    assert send_msg('this is message one') is True
    assert send_msg('this is message two') is True


def test_receive_multiple_msgs_from_queue(queue_process):
    from core.mem_queue import receive_msg

    assert queue_process.name == 'mem_queue_worker'
    assert receive_msg() == 'this is message one'
    assert receive_msg() == 'this is message two'
    assert receive_msg() is None, 'Queue back to empty'


def test_send_invalid_large_msg(queue_process):
    from core.mem_queue import send_msg
    from core.queue_worker import MessageNotQueuedError

    assert queue_process.name == 'mem_queue_worker'

    chars = 'A a B b C c D d E e F f G g H h I i J j K k L M m N n O o P p Q q R r S s T t U u V v W w X x Y y Z z' \
        .split()
    msg = ''
    for i in range(1, 8200): msg += choice(chars)
    with pytest.raises(MessageNotQueuedError) as ex:
        send_msg(msg)
    assert 'maximum size' in str(ex.value)


def test_send_max_length_msg(queue_process):
    from core.mem_queue import send_msg

    assert queue_process.name == 'mem_queue_worker'

    chars = 'A a B b C c D d E e F f G g H h I i J j K k L M m N n O o P p Q q R r S s T t U u V v W w X x Y y Z z' \
        .split()
    msg = ''
    for i in range(1, 8192): msg += choice(chars)
    assert send_msg(msg) == True
