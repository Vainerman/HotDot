from flask_socketio import emit, join_room
from . import redis_client, buffer_op


def register_socketio_handlers(socketio):
    @socketio.on('join')
    def on_join(data):
        session_id = data['session_id']
        join_room(session_id)
        emit('joined', {'session_id': session_id})

    @socketio.on('init_state')
    def on_init(data):
        session_id = data['session_id']
        # broadcast to others in room
        emit('init_state', data, room=session_id, include_self=False)
        redis_client.publish(f'session:{session_id}', data)

    @socketio.on('draw_op')
    def on_draw_op(data):
        session_id = data['session_id']
        op_index = data.get('op_index', 0)
        buffer_op(session_id, op_index, data)
        emit('draw_op', data, room=session_id, include_self=False)
        redis_client.publish(f'session:{session_id}', data)
