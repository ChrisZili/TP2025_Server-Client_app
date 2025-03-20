from flask import Flask
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from server.config import Config
from server.database import db
from server.routes import register_blueprints
from server.extensions import limiter
from dotenv import load_dotenv
from server.services.admin_service import create_admin

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    limiter.init_app(app)
    try:
        print(f"🔗 Connecting to database: {app.config['SQLALCHEMY_DATABASE_URI']}")
        db.init_app(app)
        Migrate(app, db)

    except Exception as e:
        print(f"❌ Database connection failed: {e}")
    JWTManager(app)

    # Registrácia Blueprintov
    register_blueprints(app)

    @app.before_first_request
    def init_admin():
        create_admin()

    return app