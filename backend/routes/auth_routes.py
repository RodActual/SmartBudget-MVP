# Login/Signup

from flask import Blueprint, request, jsonify
from services.auth_service import signup_user, login_user

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    result = signup_user(email, password)
    return jsonify(result), 200 if "uid" in result else 400

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    result = login_user(email, password)
    return jsonify(result), 200 if "idToken" in result else 400
