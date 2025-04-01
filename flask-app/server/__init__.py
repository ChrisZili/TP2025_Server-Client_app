from flask import Flask, render_template, redirect, url_for
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from server.config import Config
from server.database import db
from server.routes import register_blueprints
from server.extensions import limiter
from dotenv import load_dotenv
from server.services.admin_service import create_admin
import os
from flask_cors import CORS
from server.logging_config import setup_logger

def create_app(config_class=Config):
    template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'client', 'templates'))
    static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'client', 'static'))

    app = Flask(__name__, template_folder = template_dir, static_folder = static_dir)
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

    setup_logger()

    app.config.from_object(config_class)
    limiter.init_app(app)
    try:
        print(f"🔗 Connecting to database: {app.config['SQLALCHEMY_DATABASE_URI']}")
        db.init_app(app)
        Migrate(app, db)

    except Exception as e:
        print(f"❌ Database connection failed: {e}")
    jwt = JWTManager(app)
    # Registrácia Blueprintov
    register_blueprints(app)

    @jwt.unauthorized_loader
    def unauthorized_response(callback):
        return redirect(url_for('auth.login_get'))
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return redirect(url_for('auth.login_get'))
    try:
        @app.errorhandler(404)
        def not_found_error(error):
            return render_template('error.html'), 404
    except Exception as e:
        print(f"❌ Error loading error page: {e}")
    return app