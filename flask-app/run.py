from flask import Flask
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from server.config import Config
from server.database import db
from server.routes.auth import bp as auth_bp
from server.routes.api import bp as api_bp
import os

app = Flask(__name__)
app.config.from_object(Config)

# Kontrola pripojenia k databáze
try:
    print(f"🔗 Connecting to database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    db.init_app(app)
    migrate = Migrate(app, db)
except Exception as e:
    print(f"❌ Database connection failed: {e}")

jwt = JWTManager(app)

# Registrácia Blueprintov
app.register_blueprint(auth_bp)
app.register_blueprint(api_bp)

# Inicializácia databázy v rámci kontextu aplikácie
with app.app_context():
    try:
        print("📌 Checking and creating tables if necessary...")
        db.create_all()
        print("✅ Database initialized successfully.")
    except Exception as e:
        print(f"❌ Database initialization error: {e}")

if __name__ == '__main__':
    print("🚀 Starting Flask server on http://127.0.0.1:5000")
    app.run(debug=True)
