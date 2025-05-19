import logging
import sys

def setup_logger():
    logger = logging.getLogger()  # root logger
    logger.setLevel(logging.INFO)

    # Handler pre konzolu
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # Handler pre súbor (voliteľné)
    file_handler = logging.FileHandler('app.log')
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

# Voliteľne, ak chcete, aby sa konfigurácia spustila pri importe:
