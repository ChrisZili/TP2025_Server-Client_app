from server import create_app
from server.database import db
from server.services.super_admin_service import create_super_admin

app = create_app()

def init_admin():
    create_super_admin()

# Inicializácia databázy v rámci kontextu aplikácie
with app.app_context():
    try:
        print("📌 Checking and creating tables if necessary...")
        db.create_all()
        print("✅ Database initialized successfully.")
        init_admin()
    except Exception as e:
        print(f"❌ Database initialization error: {e}")


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5005)

