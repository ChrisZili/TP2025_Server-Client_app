import logging
from server.database import db
from server.models.messages_data import MessageData
from server.models.user import User

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)  # make sure DEBUG logs are shown

class MessageService:
    @staticmethod
    def send_message(data):
        logger.info("Starting message saving process")

        try:
            sender_id = data.get('sender_id')
            recipient_input = data.get('recipient_name_or_id')
            content = data.get('content')

            if not all([sender_id, recipient_input, content]):
                logger.error("Missing required fields")
                return {'error': 'Missing required fields'}, 400

            # Try resolving recipient
            recipient_user = None
            if recipient_input.isdigit():
                recipient_user = User.query.get(int(recipient_input))
            else:
                #recipient_user = User.query.filter_by(username=recipient_input).first()
                recipient_user = User.query.filter_by(email=recipient_input).first()

            if not recipient_user:
                logger.warning("Recipient not found: %s", recipient_input)
                return {'error': 'Príjemca neexistuje'}, 404

            # Create and store message
            message = MessageData(
                sender_id=sender_id,
                recipient_id=recipient_user.id,
                content=content
            )

            db.session.add(message)
            db.session.commit()

            logger.info("Message from %s to %s saved successfully", sender_id, recipient_user.id)
            return {'message': 'Správa bola úspešne odoslaná.'}, 201

        except Exception as e:
            db.session.rollback()
            logger.exception("Exception while sending message")
            return {'error': 'Nepodarilo sa odoslať správu.'}, 500
