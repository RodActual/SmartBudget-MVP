# routes/auth_routes.py
import uuid
import time
from flask import Blueprint, jsonify, request
from utils.firebase_service import get_db

# Initialize the Blueprint
auth_bp = Blueprint('auth', __name__)

# --- Mock Token Generation ---
def generate_mock_auth_response(user_id, username):
    """Generates a consistent mock JWT-like response."""
    return {
        "user_id": user_id,
        "username": username,
        "token": f"mock_jwt_token_{user_id}_{int(time.time())}", # Unique mock token
        "expires_in": 3600 # 1 hour
    }

# --- Routes ---

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Mocks user registration. Creates a new user entry in the mock database.
    """
    db = get_db()
    data = request.get_json()

    # Simple validation
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "Missing email or password"}), 400

    new_user_id = str(uuid.uuid4())
    username = data['email'].split('@')[0]
    
    # 1. Add new user to mock database
    new_user_doc = {
        "email": data['email'],
        "username": username,
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        # NOTE: Passwords should NEVER be stored in plain text. This is a mock example.
        "password_hash": "mock_hashed_password"
    }

    if isinstance(db, dict):
        db.get('users', {})[new_user_id] = new_user_doc
        print(f"MOCK DB: Registered new user: {username}")
    
    # 2. Return a successful mock token response
    return jsonify(generate_mock_auth_response(new_user_id, username)), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Mocks user login. Finds a user and returns a mock token.
    """
    db = get_db()
    data = request.get_json()

    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "Missing email or password"}), 400

    target_email = data['email']
    
    # 1. Mock User Lookup
    if isinstance(db, dict):
        users = db.get('users', {})
        # Search mock users by email (Note: inefficient for real DB, but fine for mock)
        for user_id, user_data in users.items():
            if user_data.get('email') == target_email:
                print(f"MOCK DB: Successfully logged in user: {target_email}")
                # 2. Return mock token
                return jsonify(generate_mock_auth_response(user_id, user_data['username'])), 200
        
        # If user not found in mock DB
        return jsonify({"error": "Invalid credentials or user not found."}), 401
    else:
        # REAL DB (Placeholder for future implementation)
        return jsonify({"message": "Real Firestore authentication not yet implemented.", "status": "pending"}), 501
