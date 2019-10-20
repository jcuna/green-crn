from boto3 import Session as _Session
from tests import Mock

resources = Mock()
resources.buckets = {}
resources.sqs_messages = {}
resources.queries = []


class Session(_Session):

    table_response = []

    def __init__(self, **kwargs):
        self.parent = super(Session, self)
        self.parent.__init__(**kwargs)
        for key, value in kwargs.items():
            setattr(resources, key, value)

    def resource(self, service_name, region_name=None, api_version=None,
                 use_ssl=True, verify=None, endpoint_url=None,
                 aws_access_key_id=None, aws_secret_access_key=None,
                 aws_session_token=None, config=None):
        resource = Mock()
        setattr(resources, service_name, resource)

        def queue(QueueName):
            q = Mock()
            if QueueName not in resources.sqs_messages:
                resources.sqs_messages.update({QueueName: []})

            def send_message(MessageBody, MessageGroupId):
                resources.sqs_messages[QueueName].append(QueueMessage(MessageGroupId, MessageBody, QueueName))

            def receive_messages(**kwargs):
                for item in resources.sqs_messages[QueueName]:
                    item.attributes['ApproximateReceiveCount'] += 1
                    yield item

            q.receive_messages = receive_messages
            q.send_message = send_message
            return q

        def dynamo_table(name):
            table = Mock()
            table.name = name

            def query(**kwargs):
                _query = Mock()
                table.query = _query
                for key, value in kwargs.items():
                    setattr(_query, key, value)
                return {'Items': Session.table_response}

            table.query = query
            return table

        resource.get_queue_by_name = queue
        resource.Table = dynamo_table
        return resource

    def client(self, service_name, region_name=None, api_version=None,
               use_ssl=True, verify=None, endpoint_url=None,
               aws_access_key_id=None, aws_secret_access_key=None,
               aws_session_token=None, config=None):
        client = Mock()
        client.name = service_name
        setattr(resources, service_name, client)

        def list_objects_v2(Bucket, Prefix):
            log_type = Prefix.split('/')[0]
            update_dict(Bucket, log_type)
            result = []
            for item in resources.buckets[Bucket][log_type]:
                if Prefix in list(item.keys())[0]:
                    result.append(list(item.values())[0])
            return {
                'KeyCount': len(result),
                'Data': result
            }

        client.list_objects_v2 = list_objects_v2

        def put_object(Body, Bucket, Key, ContentType=None):
            log_type = Key.split('/')[0]
            update_dict(Bucket, log_type)
            resources.buckets[Bucket][log_type].append({Key: Body})

        client.put_object = put_object
        return client


def update_dict(level1, level2):
    if level1 not in resources.buckets:
        resources.buckets.update({level1: {}})
    if level2 not in resources.buckets[level1]:
        resources.buckets[level1].update({level2: []})


def Key(name):
    obj = Mock()
    obj.name = name

    def eq(value):
        obj.value = value
    obj.eq = eq
    return obj


class QueueMessage(Mock):
    attributes = {'ApproximateReceiveCount': 0}

    def __init__(self, group, body, queue):
        self.group = group
        self.body = body
        self.queue = queue
        self.attributes['ApproximateReceiveCount'] = 0
        self.index = len(resources.sqs_messages[self.queue])

    def delete(self):
        del resources.sqs_messages[self.queue][self.index]

    def change_visibility(self, **kwargs):
        pass


class DB(Mock):
    executes = []

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

    def cursor(self):
        cursor = Mock()

        def fetchone():
            return []

        def execute(what):
            self.executes.append(what)

        cursor.execute = execute
        cursor.fetchone = fetchone
        return cursor

    def commit(self):
        resources.queries.append(self.executes.copy())
        self.executes.clear()


def connect(**kwargs):
    return DB(**kwargs)
