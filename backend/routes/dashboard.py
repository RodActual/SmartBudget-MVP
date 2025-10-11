# routes/dashboard.py
# Blueprint for handling dashboard data retrieval (metrics, charts, alerts).

from flask import Blueprint, jsonify

# Create a Blueprint instance
dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/', methods=['GET'])
def get_dashboard_summary():
    """
    GET /api/dashboard/
    Retrieves the main dashboard summary data (metrics, table, trends).
    This data will eventually come from the Firebase/Firestore database.
    """
    # Placeholder for data structure needed by the front-end UI
    mock_data = {
        "metrics": {
            "total_spent": 250.00,
            "budget_total": 400.00,
            "remaining": 150.00
        },
        "categories": [
            {"name": "Food", "spent": 120, "budget": 150, "status": "ok"},
            {"name": "Gas", "spent": 80, "budget": 100, "status": "ok"},
            {"name": "Shopping", "spent": 90, "budget": 80, "status": "over"},
        ],
        "alerts": [
            {"id": 1, "message": "Shopping: Over budget", "type": "error"},
            {"id": 2, "message": "Food: 80% of budget used", "type": "warning"},
        ],
        "spending_trend": [
            # Mock data points for a line graph
            {"week": 1, "amount": 150},
            {"week": 2, "amount": 180},
            {"week": 3, "amount": 120},
        ]
    }
    return jsonify(mock_data)

@dashboard_bp.route('/metrics', methods=['GET'])
def get_metrics():
    """
    GET /api/dashboard/metrics
    A dedicated endpoint for just the top three metric cards.
    """
    mock_metrics = {
        "total_spent": 250.00,
        "budget_total": 400.00,
        "remaining": 150.00
    }
    return jsonify(mock_metrics)
