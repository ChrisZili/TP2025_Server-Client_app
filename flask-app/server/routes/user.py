from flask import Blueprint, jsonify, request
from server.models.user import User
from server.services.user_service import UserService

bp = Blueprint('user', __name__, url_prefix='/user')
db_service = UserService()