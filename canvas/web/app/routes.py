from flask import Blueprint, request, jsonify
from . import db, CanvasOp

bp = Blueprint('routes', __name__)

@bp.route('/sessions/<session_id>/ops', methods=['GET'])
def get_ops(session_id):
    ops = CanvasOp.query.filter_by(session_id=session_id).order_by(CanvasOp.op_index).all()
    return jsonify([op.op_data for op in ops])

@bp.route('/sessions', methods=['POST'])
def create_session():
    data = request.get_json() or {}
    session_id = data.get('session_id')
    if not session_id:
        return jsonify({'error': 'session_id required'}), 400
    # in a real app we would check existence / create
    return jsonify({'session_id': session_id})
