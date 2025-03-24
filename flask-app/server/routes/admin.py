from flask import Blueprint, jsonify, request
from server.models.user import User
from server.services.admin_service import AdminData

bp = Blueprint('admin', __name__, url_prefix='/api')
db_service = AdminData()