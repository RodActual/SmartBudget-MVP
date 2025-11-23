import os
import logging
from firebase_admin import credentials, initialize_app, firestore
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variable to hold the Firestore DB instance
db = None

# --- Mock Database Structure (fallback) ---
MOCK_DB = {
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

def initialize_firebase_app():
    """
    Initializes the Firebase Admin SDK with real credentials.
    Falls back to mock mode if credentials are missing.
    """
    global db

    try:
        # Check for service account path
        service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH')
        
        if not service_account_path or not os.path.exists(service_account_path):
            raise ValueError("Service account file not found. Using MOCK DB.")

        # Initialize Firebase Admin SDK
        cred = credentials.Certificate(service_account_path)
        
        # Check if app is already initialized
        try:
            initialize_app(cred)
            logger.info("Firebase App initialized successfully.")
        except ValueError as e:
            # App already initialized
            logger.info("Firebase App already initialized.")

        # Get Firestore client
        db = firestore.client()
        logger.info("✅ Connected to REAL Firestore Database")
        
        # Test connection
        db.collection('_test').document('_connection').set({'status': 'connected'})
        db.collection('_test').document('_connection').delete()
        logger.info("✅ Firestore connection test successful")

    except Exception as e:
        logger.warning(f"⚠️ Firebase initialization failed: {e}")
        logger.warning("🔄 Falling back to MOCK DATABASE mode")
        db = MOCK_DB

def get_db():
    """
    Returns the initialized Firestore DB instance (real or mock).
    """
    global db
    if db is None:
        initialize_firebase_app()
    return db

def is_mock_db():
    """
    Helper function to check if using mock database.
    """
    return isinstance(db, dict)

# Initialize on module load
initialize_firebase_app()