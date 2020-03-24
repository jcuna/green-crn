from boto3 import Session as _Session

from tests import Mock
from flask_mail import Message as _Message, Mail as _Mail

resources = Mock()
resources.buckets = {}
resources.sqs_messages = {}
resources.queries = []
resources.dynamo = {}
resources.mails = []
resources.socketio = []
resources.requests = []


class Session(_Session):

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
                if table.name in resources.dynamo:
                    if 'KeyConditionExpression' in kwargs:
                        return {
                            'Items': filter_dynamo(kwargs['KeyConditionExpression'], resources.dynamo[table.name])
                        }
                return {'Items': []}

            def scan(**kwargs):
                if table.name in resources.dynamo:
                    if 'FilterExpression' in kwargs:
                        return {
                            'Items': list(filter(lambda x: x[kwargs['FilterExpression'].name]['S'] == kwargs[
                                'FilterExpression'].value, resources.dynamo[table.name]))
                        }
                return {'Items': []}

            table.query = query
            table.scan = scan
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

        def s3list_objects_v2(Bucket, Prefix):
            parts = Prefix.split('/')
            log_type = parts[0]
            batch = parts[1]
            result = []
            if Bucket in resources.buckets and log_type in resources.buckets[Bucket] and \
                    batch in resources.buckets[Bucket][log_type]:
                for item in resources.buckets[Bucket][log_type][batch]:
                    for obj in list(item.keys()):
                        result.append(obj)
            return {
                'KeyCount': len(result),
                'Data': result
            }

        def s3put_object(Body, Bucket, Key, ContentType=None):
            parts = Key.split('/')
            log_type = parts[0]
            batch = parts[1]
            update_dict(resources.buckets, Bucket, log_type, batch)
            resources.buckets[Bucket][log_type][batch].append({Key: Body})

        def dynamo_put_item(TableName, Item):
            if TableName not in resources.dynamo:
                resources.dynamo[TableName] = []
            if 'uid' in Item:
                for i in range(len(resources.dynamo[TableName])):
                    if resources.dynamo[TableName][i]['uid']['S'] == Item['uid']['S']:
                        del resources.dynamo[TableName][i]
            resources.dynamo[TableName].append(Item)

        if client.name == 's3':
            client.list_objects_v2 = s3list_objects_v2
            client.put_object = s3put_object

        if client.name == 'dynamodb':
            client.put_item = dynamo_put_item
            client.create_table = lambda *args, **kwargs: None

        return client


def update_dict(attr, level1, level2=None, level3=None):
    if level1 not in attr:
        attr.update({level1: {}})
    if level2 is not None and level2 not in attr[level1]:
        attr[level1].update({level2: {}})
    if level3 is not None and level3 not in attr[level1][level2]:
        attr[level1][level2].update({level3: []})


def Key(name):
    obj = DynamoKey()
    obj.name = name

    def eq(value):
        obj.value = value
        return obj

    obj.eq = eq
    return obj

Attr = Key

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


class Mail(_Mail):
    def __init__(self, app):
        super().__init__(app)
        resources.mails.clear()

    def send(self, msg: _Message):
        resources.mails.append(msg)


Message = _Message


def _request():
    class MockRequest:

        def Request(*args, **kwargs):
            fly = {}
            k = 1
            for item in args:
                fly.update({k: item})
                k += 1
            fly.update(kwargs)
            resources.requests.append(fly)

        def urlencode(self, dict_obj):
            return str(dict_obj)

        def getcode(self):
            return 200

        def info(self):
            return {}

        def urlopen(self, req):
            return self

    return MockRequest()


request = _request()
parse = request


class DynamoKey(Mock):
    def __init__(self):
        self.filters = []
    def __and__(self, obj):
        self.filters.append([obj.name, obj.value])
        return self


def filter_dynamo(filter_obj, items):
    result = []
    for item in items:
        if item[filter_obj.name]['S'] == filter_obj.value and len(filter_obj.filters) == 0:
            result.append(item)
        elif item[filter_obj.name]['S'] == filter_obj.value and len(filter_obj.filters) > 0:
            found = True
            for extra_filter in filter_obj.filters:
                if item[extra_filter[0]]['S'] != extra_filter[1]:
                    found = False
                    break
            if not found:
                continue
            else:
                result.append(item)
                break
    return result
