from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
import redis
import json
import os
from threading import Thread, Event
import time

socketio = SocketIO(async_mode='eventlet', cors_allowed_origins="*")
db = SQLAlchemy()

redis_client = None

ops_buffer = {}
flush_event = Event()


def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    socketio.init_app(app, message_queue=os.environ.get('REDIS_URL'))

    global redis_client
    redis_client = redis.Redis.from_url(os.environ.get('REDIS_URL'))

    from .routes import bp as routes_bp
    app.register_blueprint(routes_bp)

    from .sockets import register_socketio_handlers
    register_socketio_handlers(socketio)

    Thread(target=_flusher, daemon=True).start()

    return app


def buffer_op(session_id, op_index, op_data):
    ops_buffer.setdefault(session_id, []).append((op_index, op_data))
    flush_event.set()


def _flusher():
    while True:
        flush_event.wait(timeout=5)
        flush_event.clear()
        for session_id, ops in list(ops_buffer.items()):
            if not ops:
                continue
            with create_app().app_context():
                for idx, data in ops:
                    op = CanvasOp(session_id=session_id, op_index=idx, op_data=data)
                    db.session.add(op)
                db.session.commit()
            ops_buffer[session_id] = []
        time.sleep(0.1)


class CanvasOp(db.Model):
    __tablename__ = 'canvas_ops'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String, nullable=False)
    op_index = db.Column(db.Integer, nullable=False)
    op_data = db.Column(db.JSON, nullable=False)


if __name__ == '__main__':
    app = create_app()
    socketio.run(app, host='0.0.0.0', port=5000)
