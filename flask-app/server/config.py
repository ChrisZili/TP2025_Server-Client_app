import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'myjwtsecret'
    LOGIN_RATE_LIMIT = "3 per 10 minutes"

    # Konfigurácia pre JWT v cookies:
    JWT_TOKEN_LOCATION = ['cookies']        # Token sa bude hľadať v cookies
    JWT_COOKIE_SECURE = False               # Nastav na True v produkcii (použitie HTTPS)
    JWT_ACCESS_COOKIE_PATH = '/'            # Cesta, kde je cookie platná
    JWT_COOKIE_CSRF_PROTECT = False         # V produkcii odporúčam povoliť CSRF ochranu, tu pre testovanie False
