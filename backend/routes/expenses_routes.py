# routes/expenses_routes.py
# Blueprint for handling expense and transaction CRUD operations.

from flask import Blueprint, jsonify, request

# Create a Blueprint instance
expenses_bp = Blueprint('expenses', __name__)

# Mock list to simulate an in-memory database for tracking IDs
mock_expenses_data = [
    {"id": 101, "date": "2025-10-10", "amount": 45.00, "description": "Groceries at Kroger", "category": "Food"},
    {"id": 102, "date": "2025-10-09", "amount": 20.00, "description": "Gas Station", "category": "Gas"},
    {"id": 103, "date": "2025-10-08", "amount": 150.00, "description": "Dinner with friends", "category": "Entertainment"},
    {"id": 104, "date": "2025-10-07", "amount": 95.00, "description": "New shirt", "category": "Shopping"},
]
next_id = 105

@expenses_bp.route('/', methods=['GET'])
def get_expenses():
    """
    GET /api/expenses
    Retrieves a list of all sample expenses.
    (In the MVP, this data would come from Firebase/Firestore.)
    """
    # Return the mock data list as JSON
    return jsonify({"expenses": mock_expenses_data})

@expenses_bp.route('/', methods=['POST'])
def add_expense():
    """
    POST /api/expenses
    Accepts new expense data (JSON), assigns an ID, logs the item, and returns it.
    """
    global next_id
    
    # 1. Get JSON data from the request body
    try:
        data = request.get_json()
    except Exception as e:
        # Handle case where request body is not valid JSON
        return jsonify({"error": "Invalid JSON format."}), 400

    if not data:
        return jsonify({"error": "No data provided in the request."}), 400

    # 2. Assign a mock ID and add a timestamp for simulation
    new_expense = data.copy()
    new_expense['id'] = next_id
    new_expense['timestamp'] = '2025-10-11T16:27:00Z' # Mock current time
    
    # 3. Log the received and created item to the console
    print("\n--- RECEIVED NEW EXPENSE ---")
    print(f"Data received from client: {data}")
    print(f"Created expense object: {new_expense}")
    print("----------------------------\n")

    # 4. Add the new expense to the mock list (in-memory)
    mock_expenses_data.append(new_expense)
    next_id += 1

    # 5. Return the created item with a 201 Created status
    return jsonify({"status": "success", "expense": new_expense}), 201
