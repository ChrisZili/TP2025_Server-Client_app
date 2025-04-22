from server.routes.account import bp as account_bp
from server.routes.admin import bp as admin_bp
from server.routes.auth import bp as auth_bp
from server.routes.doctor import bp as doctor_bp
from server.routes.hospital import bp as hospital_bp
from server.routes.technician import bp as technician_bp
from server.routes.user import bp as user_bp
from server.routes.register import bp as register_bp
from server.routes.fotky import bp as fotky_blueprint

#from server.routes.api import bp as api_bp

def register_blueprints(app):
    app.register_blueprint(account_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(doctor_bp)
    app.register_blueprint(hospital_bp)
    app.register_blueprint(technician_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(register_bp)
    app.register_blueprint(fotky_blueprint)

    #app.register_blueprint(api_bp)

