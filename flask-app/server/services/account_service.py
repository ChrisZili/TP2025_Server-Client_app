import logging
from server import db
from server.models.user import User

logger = logging.getLogger(__name__)


class AccountService:
    @staticmethod
    def get_account_info(user_id):
        logger.info("Získavanie informácií o účte pre user_id: %s", user_id)

        # Kontrola, či bolo poskytnuté user_id
        if not user_id:
            logger.error("Nebolo poskytnuté user_id.")
            return {'error': 'Missing user identifier'}, 400

        # Pokus o konverziu user_id na int
        try:
            user_id_int = int(user_id)
        except (ValueError, TypeError) as e:
            logger.exception("Nesprávny formát user_id %s: %s", user_id, e)
            return {'error': 'Invalid user identifier'}, 400

        # Načítanie používateľa z databázy
        try:
            user = db.session.get(User, user_id_int)
        except Exception as e:
            logger.exception("Chyba pri získavaní používateľa s id %s: %s", user_id_int, e)
            return {'error': 'Internal error'}, 500

        if not user:
            logger.error("Používateľ s id %s nebol nájdený", user_id_int)
            return {'error': 'User not found'}, 404

        # Získanie informácií o používateľovi
        try:
            response = user.get_info()
            # Overenie, že výsledok je vo vhodnom formáte
            if not isinstance(response, dict):
                logger.error("Neplatný formát údajov získaných z user.get_info() pre user_id %s", user_id_int)
                return {'error': 'Invalid user info format'}, 500
        except Exception as e:
            logger.exception("Chyba pri získavaní údajov o používateľovi s id %s: %s", user_id_int, e)
            return {'error': 'Error retrieving user info'}, 500

        logger.info("Údaje účtu boli úspešne získané pre používateľa %s", user_id_int)
        return response, 200
