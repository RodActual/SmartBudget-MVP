from uuid import uuid4
from flask import Blueprint, jsonify, request
from utils.firebase_service import get_db, is_mock_db

expenses_bp = Blueprint('expenses', __name__)

def convert_mock_to_list(collection_dict):
    """Converts mock dictionary to list format."""
    data_list = []
    for doc_id, data in collection_dict.items():
        data_list.append({"id": doc_id, **data})
    return data_list

@expenses_bp.route('/', methods=['GET'])
def get_expenses():
    """
    Retrieves all expenses from Firestore or mock DB.
    """
    db = get_db()

    if is_mock_db():
        # MOCK DB
        expenses_data = db.get("expenses", {})
        expenses_list = convert_mock_to_list(expenses_data)
        print(f"MOCK DB: Returning {len(expenses_list)} expenses.")
        return jsonify(expenses_list)
    else:
        # REAL FIRESTORE
        try:
            expenses_ref = db.collection('expenses')
            docs = expenses_ref.stream()
            
            expenses_list = []
            for doc in docs:
                expense_data = doc.to_dict()
                expense_data['id'] = doc.id
                expenses_list.append(expense_data)
            
            print(f"FIRESTORE: Returning {len(expenses_list)} expenses.")
            return jsonify(expenses_list)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@expenses_bp.route('/', methods=['POST'])
def add_expense():
    """
    Adds a new expense to Firestore or mock DB.
    """
    db = get_db()
    
    try:
        data = request.get_json()
    except Exception:
        return jsonify({"error": "Invalid JSON payload"}), 400

    if not data or 'amount' not in data or 'description' not in data:
        return jsonify({"error": "Missing required fields (amount, description)"}), 400
    
    new_expense_id = str(uuid4())
    new_expense_doc = {
        "user_id": data.get("user_id", "user_id_123"),
        "amount": float(data['amount']),
        "category_id": data.get("category_id", "cat_other"),
        "description": data['description'],
        "date": data.get("date", "2025-10-11"),
    }

    if is_mock_db():
        # MOCK DB
        db['expenses'][new_expense_id] = new_expense_doc
        print(f"MOCK DB: Created expense {new_expense_id}")
        return jsonify({"id": new_expense_id, **new_expense_doc}), 201
    else:
        # REAL FIRESTORE
        try:
            db.collection('expenses').document(new_expense_id).set(new_expense_doc)
            print(f"FIRESTORE: Created expense {new_expense_id}")
            return jsonify({"id": new_expense_id, **new_expense_doc}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@expenses_bp.route('/<expense_id>', methods=['PUT'])
def update_expense(expense_id):
    """
    Updates an existing expense by ID.
    """
    db = get_db()
    
    try:
        data = request.get_json()
    except Exception:
        return jsonify({"error": "Invalid JSON payload"}), 400

    # Build update data
    update_data = {}
    if 'amount' in data:
        update_data['amount'] = float(data['amount'])
    if 'description' in data:
        update_data['description'] = data['description']
    if 'category_id' in data:
        update_data['category_id'] = data['category_id']
    if 'date' in data:
        update_data['date'] = data['date']

    if not update_data:
        return jsonify({"error": "No fields to update"}), 400

    if is_mock_db():
        # MOCK DB
        if expense_id in db.get('expenses', {}):
            db['expenses'][expense_id].update(update_data)
            updated = {"id": expense_id, **db['expenses'][expense_id]}
            print(f"MOCK DB: Updated expense {expense_id}")
            return jsonify(updated), 200
        return jsonify({"error": "Expense not found"}), 404
    else:
        # REAL FIRESTORE
        try:
            doc_ref = db.collection('expenses').document(expense_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return jsonify({"error": "Expense not found"}), 404
            
            doc_ref.update(update_data)
            updated_doc = doc_ref.get().to_dict()
            updated_doc['id'] = expense_id
            
            print(f"FIRESTORE: Updated expense {expense_id}")
            return jsonify(updated_doc), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@expenses_bp.route('/<expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    """
    Deletes an expense by ID.
    """
    db = get_db()

    if is_mock_db():
        # MOCK DB
        if expense_id in db.get('expenses', {}):
            del db['expenses'][expense_id]
            print(f"MOCK DB: Deleted expense {expense_id}")
            return jsonify({"message": "Expense deleted", "id": expense_id}), 200
        return jsonify({"error": "Expense not found"}), 404
    else:
        # REAL FIRESTORE
        try:
            db.collection('expenses').document(expense_id).delete()
            print(f"FIRESTORE: Deleted expense {expense_id}")
            return jsonify({"message": "Expense deleted", "id": expense_id}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500