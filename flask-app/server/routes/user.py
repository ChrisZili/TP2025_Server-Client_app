from flask import Blueprint, jsonify, request
from server.models.user import User
from server.services.db_service import DatabaseService

bp = Blueprint('user', __name__, url_prefix='/technician')
db_service = DatabaseService()