import os
from flask import Flask
from flask_migrate import Migrate, upgrade, migrate, init
from server.config import Config
from server.database import db

# Inicializácia Flask aplikácie
app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
migrate_obj = Migrate(app, db)  # OPRAVA: Premenované, aby sa nevolalo ako funkcia

# Automatická migrácia
with app.app_context():
    if not os.path.exists("migrations"):
        print("🔧 Initializing migrations...")
        init()  # ✅ Správne zavolanie init()

    print("📌 Generating migration...")
    migrate("Forced migration update")  # ✅ Vynútenie migrácie

    print("🚀 Applying migration...")
    upgrade()  # ✅ Aplikovanie migrácie

    print("✅ Migration completed successfully!")
