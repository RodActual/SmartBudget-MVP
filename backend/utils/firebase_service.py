# backend/utils/firebase_service.py

import os
import logging
from firebase_admin import credentials, initialize_app, firestore
from google.cloud.firestore_v1.client import Client as FirestoreClient

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variable to hold the initialized Firestore DB instance
# This will hold either the real Firestore client or the mock dictionary
db = None

# --- Mock Database Structure ---
# This structure simulates Firestore collections and documents when keys are not set.
MOCK_DB = {
    # Users collection
    "users": {
        "user_id_123": {
            "email": "test@example.com",
            "name": "Mock User",
            "created_at": "2025-10-01",
        }
    },
    # Expenses collection
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
    # Categories collection
    "categories": {
        "cat_food": {"name": "Food", "budget": 150},
        "cat_transport": {"name": "Transportation", "budget": 50},
        "cat_entertainment": {"name": "Entertainment", "budget": 75},
    },
    # Budgets collection (can link to categories or be monthly totals)
    "budgets": {
        "budget_oct_2025": {
            "user_id": "user_id_123",
            "month": "2025-10",
            "total_limit": 400,
            "current_spent": 250,
        }
    }
}

# --- Initialization Functions ---

def initialize_firebase_app():
    """
    Initializes the Firebase Admin SDK.
    Switches to mock mode if real keys are missing or initialization fails.
    """
    global db

    try:
        # Check if the required API key is present in environment variables
        if not os.environ.get('FIREBASE_API_KEY'):
            raise ValueError("FIREBASE_API_KEY is missing. Switching to MOCK DB.")

        # For production/real service accounts, load credentials
        # NOTE: For security, use service accounts (JSON file path) in production
        # For mock, we use a simple try/except structure
        
        # NOTE: Firebase Admin SDK requires credentials JSON, not just the API key.
        # We assume project ID is set for structure. We'll proceed with minimal check.
        
        project_id = os.environ.get('FIREBASE_PROJECT_ID')
        if not project_id:
             raise ValueError("FIREBASE_PROJECT_ID is missing. Switching to MOCK DB.")
             
        # Attempt to initialize the app (This part often requires a Service Account JSON path,
        # which is why it usually fails in a mock setup.)
        
        # If successfully initialized elsewhere (e.g., in a cloud environment), skip initialization
        try:
            # Try to load credentials from a generic path (might fail if run locally without path set)
            cred = credentials.Certificate("./path/to/serviceAccountKey.json") # Placeholder path
            initialize_app(cred, {'projectId': project_id})
            logger.info("Firebase App initialized successfully.")
        except ValueError:
            # If the app is already initialized, just continue
            pass
        except Exception:
            # Catch file/credential loading errors and switch to mock
            raise ValueError("Failed to load Firebase credentials. Switching to MOCK DB.")


        # Get the Firestore client
        db = firestore.client()
        logger.info("Firestore Client (REAL DB) is ready.")

    except ValueError as e:
        logger.warning(f"Warning: {e}")
        db = MOCK_DB
        logger.warning("Running in MOCK DATABASE mode. Data will NOT persist.")
    except Exception as e:
        logger.error(f"FATAL ERROR during Firebase initialization: {e}")
        db = MOCK_DB
        logger.warning("Running in MOCK DATABASE mode. Data will NOT persist.")

def get_db():
    """
    Returns the initialized Firestore DB instance (real client or mock dict).
    Initializes the app if it hasn't been done yet.
    """
    global db
    if db is None:
        initialize_firebase_app()
    return db

# Initialize the app upon script load
initialize_firebase_app()

