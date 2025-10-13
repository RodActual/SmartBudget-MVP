import json
from uuid import uuid4
from flask import Blueprint, jsonify, request
from utils.firebase_service import get_db

# Initialize the Blueprint
expenses_bp = Blueprint('expenses', __name__)

# --- Helper Functions ---

def convert_mock_to_list(collection_dict):
    """Converts the dictionary-based mock 'collection' into a list of items with their IDs."""
    data_list = []
    for doc_id, data in collection_dict.items():
        # Add the document ID (key in the dictionary) as 'id' field
        data_list.append({"id": doc_id, **data})
    return data_list

# --- Routes ---

@expenses_bp.route('/', methods=['GET'])
def get_expenses():
    """
    Retrieves all expenses from the database (mock or real).
    """
    db = get_db()

    if isinstance(db, dict):
        # MOCK DB: Retrieve data from the 'expenses' key
        expenses_data = db.get("expenses", {})
        expenses_list = convert_mock_to_list(expenses_data)
        
        # Log to show the data being returned
        print(f"MOCK DB: Returning {len(expenses_list)} expenses.")
        
        return jsonify(expenses_list)
    else:
        # REAL DB (Placeholder for future implementation)
        # In a real Firestore app, you'd use db.collection('expenses').stream()
        return jsonify({"message": "Real Firestore read not yet implemented.", "status": "pending"}), 501


@expenses_bp.route('/', methods=['POST'])
def add_expense():
    """
    Accepts a new expense via JSON, validates it, and adds it to the database.
    """
    db = get_db()
    
    try:
        data = request.get_json()
    except Exception:
        return jsonify({"error": "Invalid JSON payload"}), 400

    if not data or 'amount' not in data or 'description' not in data:
        return jsonify({"error": "Missing required fields (amount, description)"}), 400
    
    # 1. Generate a unique ID for the new document/record
    new_expense_id = str(uuid4())

    # 2. Structure the new expense document
    new_expense_doc = {
        "user_id": data.get("user_id", "user_id_123"), # Default to mock user
        "amount": float(data['amount']),
        "category_id": data.get("category_id", "cat_other"),
        "description": data['description'],
        "date": data.get("date", "2025-10-11"),
    }

    if isinstance(db, dict):
        # MOCK DB: Insert the new document into the 'expenses' collection
        db['expenses'][new_expense_id] = new_expense_doc
        
        # Log the creation
        print(f"MOCK DB: Created new expense with ID: {new_expense_id}")

        # Return the created item including its ID
        return jsonify({"id": new_expense_id, **new_expense_doc}), 201

    else:
        # REAL DB (Placeholder for future implementation)
        # In a real Firestore app, you'd use db.collection('expenses').document(new_expense_id).set(new_expense_doc)
        return jsonify({"message": "Real Firestore write not yet implemented.", "status": "pending"}), 501
