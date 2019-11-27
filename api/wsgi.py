from flask_socketio import SocketIO
from app import init_app

app = init_app()
sio = SocketIO(app)
