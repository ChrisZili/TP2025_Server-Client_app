from flask import Blueprint
from server.services.user_service import UserService

bp = Blueprint('user', __name__, url_prefix='/user')
db_service = UserService()