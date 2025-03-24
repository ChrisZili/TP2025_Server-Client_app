from flask import Blueprint, jsonify, request
from server.models.user import User
from server.services.technician_service import TechnicianData

bp = Blueprint('technician', __name__, url_prefix='/technician')
technician_service = TechnicianData()
