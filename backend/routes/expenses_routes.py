# Expense Tracking Endpoints

from flask import Blueprint, request, jsonify
from services.expense_service import add_expense, get_expenses

expense_bp = Blueprint("expenses", __name__)

@expense_bp.route("/", methods=["POST"])
def create_expense():
    data = request.json
    result = add_expense(data)
    return jsonify(result), 201

@expense_bp.route("/", methods=["GET"])
def list_expenses():
    expenses = get_expenses()
    return jsonify(expenses), 200
