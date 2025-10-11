# app.py
# The main application entry point for the SmartBudget-MVP backend.

from flask import Flask, jsonify

# 1. Import Blueprints
# Blueprints are used to organize routes and code into separate modules.
from routes.dashboard import dashboard_bp
from routes.transactions import transactions_bp
from routes.auth import auth_bp

def create_app():
    # Initialize the Flask application
    app = Flask(__name__)

    # --- Configuration ---
    # Set a secret key for session management (REQUIRED for secure Flask apps)
    # In a real application, this should be loaded from environment variables (e.g., os.environ)
    app.config['SECRET_KEY'] = 'your_strong_and_secure_secret_key_for_smartbudget'

    # CORS configuration to allow the React front-end (running on a different port)
    # to communicate with the Flask API.
    @app.after_request
    def add_cors_headers(response):
        # Allow requests from the Storybook/React development server (e.g., http://localhost:3000)
        response.headers['Access-Control-Allow-Origin'] = '*' # Change this to your frontend URL in production
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        return response


    # --- Blueprint Registration ---
    # Register the Blueprints to modularize the application.
    # The 'url_prefix' ensures all routes in that blueprint start with the given path.
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(transactions_bp, url_prefix='/api/transactions')

    # --- Base Route ---
    @app.route('/')
    def index():
        """A simple route to confirm the backend is running."""
        return jsonify({
            "status": "success",
            "message": "SmartBudget-MVP API is running!",
            "version": "0.1.0"
        })

    return app

# Standard way to run the Flask application locally
if __name__ == '__main__':
    app = create_app()
    # Debug mode is helpful during development
    app.run(debug=True, port=5000)
