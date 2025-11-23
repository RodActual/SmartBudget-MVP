from flask import Blueprint, jsonify, request
from firebase_admin import auth
from utils.firebase_service import get_db, is_mock_db
import time

auth_bp = Blueprint('auth', __name__)

def generate_mock_auth_response(user_id, username):
    """Mock token generation for fallback."""
    return {
        "user_id": user_id,
        "username": username,
        "token": f"mock_jwt_token_{user_id}_{int(time.time())}",
        "expires_in": 3600
    }

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user with Firebase Authentication.
    """
    db = get_db()
    data = request.get_json()

    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "Missing email or password"}), 400

    email = data['email']
    password = data['password']
    username = data.get('username', email.split('@')[0])

    if is_mock_db():
        # MOCK MODE
        import uuid
        new_user_id = str(uuid.uuid4())
        new_user_doc = {
            "email": email,
            "username": username,
            "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "password_hash": "mock_hashed_password"
        }
        db.get('users', {})[new_user_id] = new_user_doc
        print(f"MOCK DB: Registered user {username}")
        return jsonify(generate_mock_auth_response(new_user_id, username)), 201
    else:
        # REAL FIREBASE
        try:
            # Create user in Firebase Auth
            user = auth.create_user(
                email=email,
                password=password,
                display_name=username
            )
            
            # Store additional user data in Firestore
            user_doc = {
                "email": email,
                "username": username,
                "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "uid": user.uid
            }
            db.collection('users').document(user.uid).set(user_doc)
            
            print(f"FIRESTORE: Created user {username} with UID {user.uid}")
            
            return jsonify({
                "user_id": user.uid,
                "username": username,
                "email": email,
                "message": "User created successfully"
            }), 201
            
        except auth.EmailAlreadyExistsError:
            return jsonify({"error": "Email already exists"}), 400
        except Exception as e:
            print(f"Error creating user: {e}")
            return jsonify({"error": str(e)}), 500

@auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
    """
    Verify a Firebase ID token sent from the frontend.
    """
    data = request.get_json()
    
    if not data or 'token' not in data:
        return jsonify({"error": "Missing token"}), 400
    
    token = data['token']
    
    if is_mock_db():
        # MOCK MODE - simple validation
        if token.startswith('mock_jwt_token_'):
            return jsonify({"valid": True, "user_id": "user_id_123"}), 200
        return jsonify({"valid": False, "error": "Invalid token"}), 401
    else:
        # REAL FIREBASE
        try:
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token['uid']
            
            return jsonify({
                "valid": True,
                "user_id": uid,
                "email": decoded_token.get('email')
            }), 200
            
        except Exception as e:
            return jsonify({"valid": False, "error": str(e)}), 401

@auth_bp.route('/user/<user_id>', methods=['GET'])
def get_user(user_id):
    """
    Get user profile information.
    """
    db = get_db()
    
    if is_mock_db():
        user_data = db.get('users', {}).get(user_id)
        if user_data:
            return jsonify(user_data), 200
        return jsonify({"error": "User not found"}), 404
    else:
        try:
            user_doc = db.collection('users').document(user_id).get()
            if user_doc.exists:
                return jsonify({"id": user_id, **user_doc.to_dict()}), 200
            return jsonify({"error": "User not found"}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500