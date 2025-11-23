import sys
import os

# Add the parent directory (backend) to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from utils.firebase_service import get_db, is_mock_db

def seed_database():
    """
    Seeds the Firestore database with initial categories and sample data.
    """
    db = get_db()
    
    if is_mock_db():
        print("⚠️  Running in MOCK mode. Database will not be seeded.")
        print("Please configure Firebase credentials to seed real database.")
        return
    
    print("🌱 Starting database seeding...")
    
    # Seed categories
    categories = {
        "cat_food": {"name": "Food & Dining", "budget": 300, "icon": "🍔"},
        "cat_transport": {"name": "Transportation", "budget": 150, "icon": "🚗"},
        "cat_entertainment": {"name": "Entertainment", "budget": 100, "icon": "🎬"},
        "cat_utilities": {"name": "Utilities", "budget": 200, "icon": "💡"},
        "cat_shopping": {"name": "Shopping", "budget": 250, "icon": "🛍️"},
        "cat_healthcare": {"name": "Healthcare", "budget": 150, "icon": "🏥"},
        "cat_other": {"name": "Other", "budget": 100, "icon": "📦"},
    }
    
    print("\n📁 Seeding categories...")
    for cat_id, cat_data in categories.items():
        try:
            db.collection('categories').document(cat_id).set(cat_data)
            print(f"  ✅ Created category: {cat_data['name']}")
        except Exception as e:
            print(f"  ❌ Failed to create {cat_data['name']}: {e}")
    
    # Seed sample user
    print("\n👤 Seeding sample user...")
    sample_user = {
        "user_id_123": {
            "email": "demo@smartbudget.com",
            "name": "Demo User",
            "created_at": "2025-11-01",
        }
    }
    
    for user_id, user_data in sample_user.items():
        try:
            db.collection('users').document(user_id).set(user_data)
            print(f"  ✅ Created user: {user_data['email']}")
        except Exception as e:
            print(f"  ❌ Failed to create user: {e}")
    
    # Seed sample expenses
    print("\n💰 Seeding sample expenses...")
    sample_expenses = [
        {
            "user_id": "user_id_123",
            "amount": 45.50,
            "category_id": "cat_food",
            "description": "Grocery shopping",
            "date": "2025-11-15",
        },
        {
            "user_id": "user_id_123",
            "amount": 25.00,
            "category_id": "cat_transport",
            "description": "Gas station",
            "date": "2025-11-16",
        },
        {
            "user_id": "user_id_123",
            "amount": 60.00,
            "category_id": "cat_entertainment",
            "description": "Movie tickets and dinner",
            "date": "2025-11-17",
        },
    ]
    
    for expense in sample_expenses:
        try:
            db.collection('expenses').add(expense)
            print(f"  ✅ Created expense: {expense['description']} (${expense['amount']})")
        except Exception as e:
            print(f"  ❌ Failed to create expense: {e}")
    
    # Seed sample budget
    print("\n📊 Seeding sample budget...")
    sample_budget = {
        "user_id": "user_id_123",
        "month": "2025-11",
        "total_limit": 1150,
        "current_spent": 130.50,
    }
    
    try:
        db.collection('budgets').document('budget_nov_2025').set(sample_budget)
        print(f"  ✅ Created budget for November 2025")
    except Exception as e:
        print(f"  ❌ Failed to create budget: {e}")
    
    print("\n🎉 Database seeding completed successfully!")
    print("You can now start using SmartBudget with sample data.")

if __name__ == '__main__':
    seed_database()