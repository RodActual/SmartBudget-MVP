# routes/auth_routes.py
# Blueprint for handling mock user authentication endpoints.

from flask import Blueprint, jsonify, request

# Create a Blueprint instance
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register_user():
    """
    POST /api/auth/register
    Mocks user registration.
    (In the final MVP, this would interact with Firebase/Firestore user creation.)
    """
    # The client sends user data (e.g., username, password) in the request body
    data = request.get_json()
    print(f"MOCK REGISTER: Received data for new user: {data}")

    # Return a success message and a mock user ID
    return jsonify({
        "status": "success",
        "message": "Registration successful (Mock response).",
        "user_id": "mock-user-456"
    }), 201 # 201 Created

@auth_bp.route('/login', methods=['POST'])
def login_user():
    """
    POST /api/auth/login
    Mocks user login and token issuance.
    """
    data = request.get_json()
    print(f"MOCK LOGIN: Received login attempt for: {data.get('email')}")

    # For mock purposes, assume login is successful and issue a fake token/user ID
    return jsonify({
        "status": "success",
        "message": "Login successful (Mock response).",
        "user_id": "mock-user-456",
        # In a real app, this token would be used to authorize future API requests
        "token": "MOCK_JWT_SMARTBUDGET_TOKEN_1234567890"
    }), 200 # 200 OK
