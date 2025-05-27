from flask import Flask, render_template, redirect, url_for, send_from_directory
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from server.config import Config
from server.database import db
from server.routes import register_blueprints
from server.extensions import limiter
import os
from flask_cors import CORS
from server.logging_config import setup_logger
from flask_compress import Compress

def create_app(config_class=Config):
    template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'client', 'templates'))
    static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'client', 'static'))

    app = Flask(__name__, template_folder = template_dir, static_folder = static_dir)
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
    Compress(app)
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

    @app.after_request
    def add_security_headers(response):
        response.headers['Content-Security-Policy'] = (
            "default-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "  # Allow inline styles
            "script-src 'self'; "
            "font-src 'self'; "
            "img-src 'self' data:; "
            "frame-ancestors 'none';"
        )
        response.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
        response.headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        return response

    @jwt.unauthorized_loader
    def unauthorized_response(callback):
        return redirect(url_for('auth.login_get'))
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return redirect(url_for('auth.login_get'))
    try:
        @app.errorhandler(400)
        def bad_request_error(error):
            return render_template('error_400.html'), 400

        @app.errorhandler(404)
        def not_found_error(error):
            return render_template('error_404.html'), 404

        @app.errorhandler(500)
        def internal_server_error(error):
            return render_template('error_500.html'), 500

    except Exception as e:
        print(f"❌ Error loading error page: {e}")

    #route for accessing images sent as part of a message
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        uploads_dir = os.path.join(os.path.dirname(app.root_path), 'uploads')
        full_path = os.path.join(uploads_dir, filename)
        print(f"Serving file: {filename}")
        print(f"Full file path: {full_path}")
        if not os.path.isfile(full_path):
            print("[ERROR] File not found!")
            return "File not found", 404
        return send_from_directory(uploads_dir, filename)

    return app