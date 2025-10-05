# Handles Firebase auth

from firebase_admin import auth

def signup_user(email, password):
    try:
        user = auth.create_user(email=email, password=password)
        return {"uid": user.uid, "message": "User created successfully"}
    except Exception as e:
        return {"error": str(e)}

def login_user(email, password):
    # Note: Firebase Admin SDK does not handle client login tokens.
    # Typically you'd use Firebase Authentication client SDK on frontend.
    return {"message": "Login should be handled client-side", "email": email}
