from server.routes.auth import bp as auth_bp
from server.routes.api import bp as api_bp
from server.routes.hospital import bp as hospital_bp
from server.routes.doctor import bp as doctor_bp

def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(hospital_bp)
    app.register_blueprint(doctor_bp)
    app.register_blueprint(api_bp)

