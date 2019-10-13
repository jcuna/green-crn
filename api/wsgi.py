from app import init_app
from flask_socketio import SocketIO

app = init_app()
sio = SocketIO(app)
