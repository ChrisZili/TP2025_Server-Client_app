from server.routes.account import bp as account_bp
from server.routes.admins import bp as admins_bp
from server.routes.auth import bp as auth_bp
from server.routes.doctors import bp as doctors_bp
from server.routes.hospital import bp as hospitals_bp
from server.routes.technicians import bp as technicians_bp
from server.routes.patients import bp as patients_bp
from server.routes.user import bp as user_bp
from server.routes.register import bp as register_bp
from server.routes.photos import bp as photos_bp
from server.routes.methods import bp as methods_bp

def register_blueprints(app):
    app.register_blueprint(account_bp)
    app.register_blueprint(admins_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(doctors_bp)
    app.register_blueprint(hospitals_bp)
    app.register_blueprint(register_bp)
    app.register_blueprint(technicians_bp)
    app.register_blueprint(patients_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(photos_bp)
    app.register_blueprint(methods_bp)


