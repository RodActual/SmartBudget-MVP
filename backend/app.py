from flask import Flask, jsonify
from flask_cors import CORS 

from routes.dashboard import dashboard_bp
from routes.expenses_routes import expenses_bp
from routes.auth_routes import auth_bp

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'your_strong_and_secure_secret_key_for_smartbudget'

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

import os

if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)

