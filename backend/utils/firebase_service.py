import os
import json
import logging
from typing import Union, Dict, Any
from firebase_admin import credentials, initialize_app, firestore
from google.cloud.firestore import Client
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

MockDB = Dict[str, Dict[str, Any]]
Database = Union[Client, MockDB]

_db: Database = None
_initialized: bool = False

MOCK_DB: MockDB = {
    "users": {
        "user_id_123": {"email": "test@example.com", "name": "Mock User", "created_at": "2025-10-01"}
    },
    "expenses": {
        "exp_001": {"user_id": "user_id_123", "amount": 45.50, "category_id": "cat_food", "description": "Groceries", "date": "2025-10-10"},
        "exp_002": {"user_id": "user_id_123", "amount": 15.00, "category_id": "cat_transport", "description": "Bus fare", "date": "2025-10-10"},
    },
    "categories": {
        "cat_food": {"name": "Food", "budget": 150},
        "cat_transport": {"name": "Transportation", "budget": 50},
        "cat_entertainment": {"name": "Entertainment", "budget": 75},
    },
    "budgets": {
        "budget_oct_2025": {"user_id": "user_id_123", "month": "2025-10", "total_limit": 400, "current_spent": 250}
    }
}

def _test_firestore_connection(client: Client) -> bool:
    try:
        test_ref = client.collection('_test').document('_connection')
        test_ref.set({'status': 'connected'})
        test_ref.delete()
        return True
    except Exception as e:
        logger.error(f"Firestore connection test failed: {e}")
        return False

def initialize_firebase_app() -> Database:
    global _db, _initialized
    if _initialized:
        return _db

    service_account_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT")
    
    if not service_account_json:
        logger.warning("⚠️ FIREBASE_SERVICE_ACCOUNT not set. Using MOCK DB.")
        _db = MOCK_DB
        _initialized = True
        return _db

    try:
        service_account_info = json.loads(service_account_json)
        cred = credentials.Certificate(service_account_info)
        initialize_app(cred)
        _db = firestore.client()

        if _test_firestore_connection(_db):
            logger.info("✅ Connected to REAL Firestore Database")
        else:
            raise ConnectionError("Firestore test failed")
        
        _initialized = True
        return _db

    except Exception as e:
        logger.error(f"Firebase initialization failed: {e}")
        logger.warning("Falling back to MOCK DATABASE mode")
        _db = MOCK_DB
        _initialized = True
        return _db

def get_db() -> Database:
    if not _initialized:
        initialize_firebase_app()
    return _db

def is_mock_db() -> bool:
    return isinstance(get_db(), dict)

def reset_db() -> None:
    global _db, _initialized
    _db = None
    _initialized = False

# Initialize at module load
initialize_firebase_app()
