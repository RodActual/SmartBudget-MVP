# routes/transactions.py
# Blueprint for handling expense and transaction CRUD operations.

from flask import Blueprint, jsonify, request

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/', methods=['GET'])
def get_transactions():
    """GET /api/transactions/ : Retrieves a list of all transactions."""
    # Placeholder: connect to Firebase/Firestore here to fetch data
    mock_list = [
        {"id": 101, "date": "2025-10-10", "amount": 45.00, "description": "Groceries at Kroger", "category": "Food"},
        {"id": 102, "date": "2025-10-09", "amount": 20.00, "description": "Gas Station", "category": "Gas"},
    ]
    return jsonify({"transactions": mock_list})

@transactions_bp.route('/', methods=['POST'])
def add_transaction():
    """POST /api/transactions/ : Adds a new transaction."""
    data = request.get_json()
    # Placeholder: Logic to validate data and save to Firebase/Firestore
    # The 'data' received here will look like: {"amount": 50.00, "description": "New Item", ...}
    print(f"Received new transaction data: {data}")

    # Return a success message with the new ID
    return jsonify({"status": "success", "message": "Transaction added successfully.", "id": 103}), 201

@transactions_bp.route('/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    """DELETE /api/transactions/<id> : Deletes a specific transaction."""
    # Placeholder: Logic to delete transaction from Firebase/Firestore
    return jsonify({"status": "success", "message": f"Transaction {transaction_id} deleted."})
