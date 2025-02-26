from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from server.config import Config

db = SQLAlchemy()

def create_app():
    app = Flask(__name__,
                static_folder='../client/static',
                template_folder='../client/templates')
    
    app.config.from_object(Config)
    
    db.init_app(app)
    
    from server.routes import api
    app.register_blueprint(api.bp)
    
    return app 