#Entry Point

from flask import Flask
from flask_cors import CORS
from routes.auth_routes import auth_bp
from routes.expense_routes import expense_bp

app = Flask(__name__)
CORS(app)  # Allow React frontend requests

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(expense_bp, url_prefix="/expenses")

if __name__ == "__main__":
    app.run(debug=True, port=5000)
