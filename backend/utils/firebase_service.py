import os
import logging
from typing import Union, Dict, Any
from firebase_admin import credentials, initialize_app, firestore
from google.cloud.firestore import Client
from dotenv import load_dotenv

# Load environment variables once at module level
load_dotenv()

# Setup logging with more specific configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Type alias for better code clarity
MockDB = Dict[str, Dict[str, Any]]
Database = Union[Client, MockDB]

# Global variable to hold the Firestore DB instance
_db: Database = None
_initialized: bool = False

# --- Mock Database Structure (fallback) ---
MOCK_DB: MockDB = {
    "users": {
        "user_id_123": {
            "email": "test@example.com",
            "name": "Mock User",
            "created_at": "2025-10-01",
        }
    },
    "expenses": {
        "exp_001": {
            "user_id": "user_id_123",
            "amount": 45.50,
            "category_id": "cat_food",
            "description": "Groceries at local store",
            "date": "2025-10-10",
        },
        "exp_002": {
            "user_id": "user_id_123",
            "amount": 15.00,
            "category_id": "cat_transport",
            "description": "Bus fare",
            "date": "2025-10-10",
        },
    },
    "categories": {
        "cat_food": {"name": "Food", "budget": 150},
        "cat_transport": {"name": "Transportation", "budget": 50},
        "cat_entertainment": {"name": "Entertainment", "budget": 75},
    },
    "budgets": {
        "budget_oct_2025": {
            "user_id": "user_id_123",
            "month": "2025-10",
            "total_limit": 400,
            "current_spent": 250,
        }
    }
}


def _test_firestore_connection(client: Client) -> bool:
    """
    Test Firestore connection by writing and deleting a test document.
    Returns True if successful, False otherwise.
    """
    try:
        test_ref = client.collection('_test').document('_connection')
        test_ref.set({'status': 'connected', 'timestamp': firestore.SERVER_TIMESTAMP})
        test_ref.delete()
        return True
    except Exception as e:
        logger.error(f"Firestore connection test failed: {e}")
        return False


def initialize_firebase_app() -> Database:
    """
    Initializes the Firebase Admin SDK with real credentials.
    Falls back to mock mode if credentials are missing or invalid.
    
    Returns:
        Database: Either a Firestore client or mock database dict
    """
    global _db, _initialized
    
    # Prevent re-initialization
    if _initialized:
        logger.debug("Firebase already initialized, returning existing instance")
        return _db

    service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH')
    
    # Early return for missing credentials
    if not service_account_path:
        logger.warning("⚠️ FIREBASE_SERVICE_ACCOUNT_PATH not set. Using MOCK DB.")
        _db = MOCK_DB
        _initialized = True
        return _db
    
    if not os.path.exists(service_account_path):
        logger.warning(f"⚠️ Service account file not found at {service_account_path}. Using MOCK DB.")
        _db = MOCK_DB
        _initialized = True
        return _db

    try:
        # Initialize Firebase Admin SDK
        cred = credentials.Certificate(service_account_path)
        initialize_app(cred)
        logger.info("✅ Firebase App initialized successfully")
        
        # Get Firestore client
        _db = firestore.client()
        
        # Test connection
        if _test_firestore_connection(_db):
            logger.info("✅ Connected to REAL Firestore Database")
            _initialized = True
            return _db
        else:
            raise ConnectionError("Firestore connection test failed")
            
    except ValueError:
        # App already initialized - this is fine
        logger.info("Firebase App already initialized, using existing instance")
        _db = firestore.client()
        _initialized = True
        return _db
        
    except Exception as e:
        logger.error(f"Firebase initialization failed: {e}")
        logger.warning("Falling back to MOCK DATABASE mode")
        _db = MOCK_DB
        _initialized = True
        return _db


def get_db() -> Database:
    """
    Returns the initialized Firestore DB instance (real or mock).
    Lazily initializes if not already done.
    
    Returns:
        Database: Either a Firestore client or mock database dict
    """
    if not _initialized:
        initialize_firebase_app()
    return _db


def is_mock_db() -> bool:
    """
    Check if using mock database.
    
    Returns:
        bool: True if using mock database, False if using real Firestore
    """
    db = get_db()
    return isinstance(db, dict)


def reset_db() -> None:
    """
    Reset the database connection (useful for testing).
    """
    global _db, _initialized
    _db = None
    _initialized = False


# Initialize on module load
initialize_firebase_app()
