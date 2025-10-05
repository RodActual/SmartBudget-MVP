# Firestore CRUD

from config.firebase_config import db
from datetime import datetime

def add_expense(data):
    expense = {
        "category": data.get("category"),
        "amount": data.get("amount"),
        "description": data.get("description", ""),
        "created_at": datetime.utcnow()
    }
    doc_ref = db.collection("expenses").add(expense)
    return {"id": doc_ref[1].id, "message": "Expense added"}

def get_expenses():
    expenses = []
    docs = db.collection("expenses").stream()
    for doc in docs:
        expenses.append({**doc.to_dict(), "id": doc.id})
    return expenses
