import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    DB_HOST = os.getenv('TIDB_HOST')
    DB_PORT = int(os.getenv('TIDB_PORT'))
    DB_USER = os.getenv('TIDB_USER')
    DB_PASSWORD = os.getenv('TIDB_PASSWORD')
    DB_NAME = os.getenv('TIDB_NAME')
    
    MYSQL_CONFIG = {
        'host': DB_HOST,
        'port': DB_PORT,
        'user': DB_USER,
        'password': DB_PASSWORD,
        'database': DB_NAME,
        'ssl_ca': os.getenv('TIDB_CA_PATH', None)
    }
    
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET')
    
    RESEND_API_KEY = os.getenv('RESEND_API_KEY')