import json
from flask import Blueprint, jsonify
from utils.firebase_service import get_db

# Initialize the Blueprint
dashboard_bp = Blueprint('dashboard', __name__)

def calculate_dashboard_metrics(db):
    """
    Aggregates mock data to calculate key dashboard metrics:
    Total Spent, Total Budget, Remaining, and Category Statuses.
    
    This simulates complex database queries and aggregations.
    """
    # 1. Retrieve raw data from mock collections
    expenses = db.get("expenses", {})
    categories_data = db.get("categories", {})
    
    # 2. Get the current overall budget for calculations
    # We grab the first budget document available for simplicity (budget_oct_2025)
    budgets_dict = db.get("budgets", {})
    current_budget = next(iter(budgets_dict.values())) if budgets_dict else {"total_limit": 0}
    total_budget = current_budget.get("total_limit", 0)
    
    # 3. Aggregate spending by category
    category_spending = {}
    total_spent = 0.0

    for exp_id, expense in expenses.items():
        amount = expense.get('amount', 0.0)
        category_id = expense.get('category_id', 'cat_uncategorized')
        
        # Calculate total spent
        total_spent += amount
        
        # Calculate spending per category
        category_spending[category_id] = category_spending.get(category_id, 0.0) + amount

    # 4. Compile the categorized data for the table component
    categories_list = []
    for cat_id, cat_details in categories_data.items():
        spent = category_spending.get(cat_id, 0.0)
        limit = cat_details.get('budget', 0)
        
        # Determine status
        if spent > limit:
            status = "Over Budget"
        elif spent >= limit * 0.8:
            status = "Warning"
        else:
            status = "On Track"
            
        categories_list.append({
            "id": cat_id,
            "category": cat_details['name'],
            "spent": round(spent, 2),
            "budget": limit,
            "status": status,
        })
        
    # 5. Calculate Final Metrics
    remaining = max(0, total_budget - total_spent)

    return {
        "total_spent": round(total_spent, 2),
        "total_budget": total_budget,
        "remaining": round(remaining, 2),
        "categories_summary": categories_list,
        "alerts": [
            {"type": "warning", "message": f"Total spending is {round((total_spent / total_budget) * 100, 1)}% of total budget."}
        ]
    }


@dashboard_bp.route('/', methods=['GET'])
def get_dashboard_summary():
    """
    Main endpoint to get all data needed for the dashboard summary screen.
    """
    db = get_db()
    
    if isinstance(db, dict):
        # MOCK DB: Calculate metrics from mock data
        summary_data = calculate_dashboard_metrics(db)
        print("MOCK DB: Calculated dashboard metrics.")
        return jsonify(summary_data)
    else:
        # REAL DB (Placeholder for future implementation)
        return jsonify({"message": "Real Firestore aggregation not yet implemented.", "status": "pending"}), 501
