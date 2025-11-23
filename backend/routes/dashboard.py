import json
from flask import Blueprint, jsonify
from utils.firebase_service import get_db, is_mock_db

dashboard_bp = Blueprint('dashboard', __name__)

def calculate_dashboard_metrics(db):
    """
    Aggregates data to calculate key dashboard metrics for MOCK DB.
    """
    expenses = db.get("expenses", {})
    categories_data = db.get("categories", {})
    budgets_dict = db.get("budgets", {})
    current_budget = next(iter(budgets_dict.values())) if budgets_dict else {"total_limit": 0}
    total_budget = current_budget.get("total_limit", 0)
    
    category_spending = {}
    total_spent = 0.0

    for exp_id, expense in expenses.items():
        amount = expense.get('amount', 0.0)
        category_id = expense.get('category_id', 'cat_uncategorized')
        total_spent += amount
        category_spending[category_id] = category_spending.get(category_id, 0.0) + amount

    categories_list = []
    for cat_id, cat_details in categories_data.items():
        spent = category_spending.get(cat_id, 0.0)
        limit = cat_details.get('budget', 0)
        
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
        
    remaining = max(0, total_budget - total_spent)

    return {
        "total_spent": round(total_spent, 2),
        "total_budget": total_budget,
        "remaining": round(remaining, 2),
        "categories_summary": categories_list,
        "alerts": [
            {"type": "warning", "message": f"Total spending is {round((total_spent / total_budget) * 100, 1)}% of total budget."}
        ] if total_budget > 0 else []
    }

def calculate_dashboard_metrics_firestore(db):
    """
    Aggregates data from Firestore to calculate dashboard metrics.
    """
    try:
        # Get all expenses
        expenses_ref = db.collection('expenses')
        expenses_docs = expenses_ref.stream()
        
        total_spent = 0.0
        category_spending = {}
        
        for doc in expenses_docs:
            expense = doc.to_dict()
            amount = expense.get('amount', 0.0)
            category_id = expense.get('category_id', 'cat_uncategorized')
            
            total_spent += amount
            category_spending[category_id] = category_spending.get(category_id, 0.0) + amount
        
        # Get categories
        categories_ref = db.collection('categories')
        categories_docs = categories_ref.stream()
        
        categories_list = []
        total_budget = 0.0
        
        for doc in categories_docs:
            cat_data = doc.to_dict()
            cat_id = doc.id
            spent = category_spending.get(cat_id, 0.0)
            limit = cat_data.get('budget', 0)
            total_budget += limit
            
            if spent > limit:
                status = "Over Budget"
            elif spent >= limit * 0.8:
                status = "Warning"
            else:
                status = "On Track"
                
            categories_list.append({
                "id": cat_id,
                "category": cat_data.get('name', 'Unknown'),
                "spent": round(spent, 2),
                "budget": limit,
                "status": status,
            })
        
        remaining = max(0, total_budget - total_spent)
        
        return {
            "total_spent": round(total_spent, 2),
            "total_budget": round(total_budget, 2),
            "remaining": round(remaining, 2),
            "categories_summary": categories_list,
            "alerts": [
                {"type": "warning", "message": f"Total spending is {round((total_spent / total_budget) * 100, 1)}% of total budget."}
            ] if total_budget > 0 else []
        }
        
    except Exception as e:
        print(f"Error calculating dashboard metrics from Firestore: {e}")
        # Return empty data on error
        return {
            "total_spent": 0.0,
            "total_budget": 0.0,
            "remaining": 0.0,
            "categories_summary": [],
            "alerts": []
        }


@dashboard_bp.route('/', methods=['GET'])
def get_dashboard_summary():
    """
    Main endpoint to get all data needed for the dashboard summary screen.
    """
    db = get_db()
    
    if is_mock_db():
        # MOCK DB
        summary_data = calculate_dashboard_metrics(db)
        print("MOCK DB: Calculated dashboard metrics.")
        return jsonify(summary_data)
    else:
        # REAL FIRESTORE
        try:
            summary_data = calculate_dashboard_metrics_firestore(db)
            print("FIRESTORE: Calculated dashboard metrics.")
            return jsonify(summary_data)
        except Exception as e:
            print(f"Error getting dashboard summary: {e}")
            return jsonify({"error": str(e)}), 500