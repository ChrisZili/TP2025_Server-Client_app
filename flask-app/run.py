from server import create_app
from server.database import db

app = create_app()

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
