# wsgi.py
from app import create_app

# Call the factory function to create the Flask app
app = create_app()
