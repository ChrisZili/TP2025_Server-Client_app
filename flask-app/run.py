from server import create_app
from server.database import db
from server.services.super_admin_service import create_super_admin

app = create_app()

def init_admin():
    create_super_admin()
def init_process_types():
    from server.services.methods_service import create_default_methods
    create_default_methods()
# Inicializácia databázy v rámci kontextu aplikácie

if __name__ == '__main__':
    with app.app_context():
        try:
            print("📌 Checking and creating tables if necessary...")
            db.create_all()
            init_admin()
            init_process_types()
            print("✅ Database initialized successfully.")
        except Exception as e:
            print(f"❌ Database initialization error: {e}")


    app.run(debug=True, host='0.0.0.0', port=5002)