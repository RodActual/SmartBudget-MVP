from flask import Flask, jsonify
from flask_cors import CORS  # <- import this

from routes.dashboard import dashboard_bp
from routes.expenses_routes import expenses_bp
from routes.auth_routes import auth_bp

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'your_strong_and_secure_secret_key_for_smartbudget'

    # Enable CORS for all routes
    CORS(app, origins=["https://smartbudget-mvp.vercel.app"])

    # --- Blueprint Registration ---
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(expenses_bp, url_prefix='/api/expenses')

    # --- Base Route ---
    @app.route('/')
    def index():
        return jsonify({
            "status": "success",
            "message": "SmartBudget-MVP API is running!",
            "version": "0.1.0"
        })

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
