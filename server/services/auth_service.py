import logging
from server.database import db
from server.models.user import User
from flask_jwt_extended import create_access_token
from datetime import timedelta

logger = logging.getLogger(__name__)


class AuthService:
    def login_user(self, data):
        """Prihlásenie používateľa a vygenerovanie JWT tokenu."""
        logger.info("Spustená metóda login_user")
        try:
            email = data.get('email')
            password = data.get('password')

            if not email or not password:
                logger.error("Prihlásenie zlyhalo: email alebo heslo nie sú poskytnuté")
                return {'error': 'Email and password are required'}, 400

            # Vyhľadanie používateľa podľa emailu
            user = User.query.filter_by(email=email).first()
            if not user:
                logger.warning("Používateľ s emailom %s nebol nájdený", email)
                return {'error': 'Invalid email or password'}, 401

            logger.debug("Používateľ s emailom %s bol nájdený", email)
            if user.check_password(password):
                access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(hours=1))
                logger.info("Prihlásenie úspešné pre používateľa s id %s", user.id)
                return {
                    "access_token": access_token,
                    "message": "Login successful"
                }, 200

            logger.error("Neplatné prihlasovacie údaje pre email %s", email)
            return {'error': 'Invalid email or password'}, 401

        except Exception as e:
            logger.exception("Výnimka v login_user: %s", e)
            return {'error': str(e)}, 500

    def logout(self):
        logger.info("Spustená metóda logout")
        try:
            # Pri JWT autentifikácii obvykle stačí odstrániť token (ak sa používajú HTTP-only cookies)
            return {'message': 'Logout successful'}, 200
        except Exception as e:
            logger.exception("Výnimka v logout: %s", e)
            return {'error': str(e)}, 500
