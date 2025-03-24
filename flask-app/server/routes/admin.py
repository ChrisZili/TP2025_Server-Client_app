from flask import Blueprint, jsonify, request
from server.models.user import User
from server.services.db_service import DatabaseService

bp = Blueprint('admin', __name__, url_prefix='/api')
db_service = DatabaseService()