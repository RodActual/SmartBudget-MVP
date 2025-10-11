# config/firebase_config.py
# Placeholder for Firebase configuration and environment variables.
# In a real application, these should be set securely in your hosting environment (e.g., Vercel, server environment variables).

import os

class FirebaseConfig:
    """
    Configuration class to securely load Firebase credentials from environment variables.
    These values are placeholders and should be replaced with actual project keys.
    """
    
    # Core Firebase Project Credentials
    # Note: Using os.getenv() allows you to run the Flask app and set variables 
    # using 'export FIREBASE_API_KEY="AIzaSy..." ' in your terminal.
    API_KEY = os.getenv("FIREBASE_API_KEY", "MOCK_API_KEY_123")
    AUTH_DOMAIN = os.getenv("FIREBASE_AUTH_DOMAIN", "smartbudget-mvp-mock.firebaseapp.com")
    PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "smartbudget-mvp-101")
    STORAGE_BUCKET = os.getenv("FIREBASE_STORAGE_BUCKET", "smartbudget-mvp-101.appspot.com")
    MESSAGING_SENDER_ID = os.getenv("FIREBASE_MESSAGING_SENDER_ID", "1234567890")
    APP_ID = os.getenv("FIREBASE_APP_ID", "1:1234567890:web:abcdef123456")

    # Firestore Database URL (often used for real-time listener setup)
    DATABASE_URL = os.getenv("FIREBASE_DATABASE_URL", f"https://{PROJECT_ID}.firebaseio.com")

    # Service Account Path (used for secure server-side admin operations, but often 
    # handled automatically by the environment on platforms like Firebase Cloud Functions)
    SERVICE_ACCOUNT_PATH = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", None)

    @classmethod
    def get_config_dict(cls):
        """Returns the configuration as a dictionary for easy use in Firebase initialization."""
        return {
            "apiKey": cls.API_KEY,
            "authDomain": cls.AUTH_DOMAIN,
            "projectId": cls.PROJECT_ID,
            "storageBucket": cls.STORAGE_BUCKET,
            "messagingSenderId": cls.MESSAGING_SENDER_ID,
            "appId": cls.APP_ID,
            "databaseURL": cls.DATABASE_URL
        }

# Example usage check (will run if this file is executed directly)
if __name__ == '__main__':
    print("--- Firebase Configuration Status ---")
    config = FirebaseConfig.get_config_dict()
    for key, value in config.items():
        # Displaying mock values, but this confirms the loading mechanism works.
        print(f"{key.ljust(15)}: {value}")
    print("-------------------------------------")
