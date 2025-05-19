import logging
from flask import Blueprint, render_template, flash, request

bp = Blueprint('fotky', __name__, url_prefix='/fotky')

logger = logging.getLogger(__name__)

@bp.route('/', methods=['GET', 'POST'], endpoint='fotky')
def fotky():
    logger.info("Accessing the Fotky page")
    if request.method == 'POST':
        flash('Form submitted successfully!', 'success')
    
    user_data = {
        "Methods": "Segmentacia, Klasifikacia, Detekcia, Aloha"
    }
    method_names = [method.strip() for method in user_data['Methods'].split(',')]
    return render_template("fotky.html", method_names=method_names)