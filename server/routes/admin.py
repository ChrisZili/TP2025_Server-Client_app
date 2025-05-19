from flask import Blueprint
from server.services.admin_service import AdminService

bp = Blueprint('admin', __name__, url_prefix='/api')
db_service = AdminService()