import logging
# Notice how we navigate up one directory to find database.py and models.py
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from models import EventPhoto

logger = logging.getLogger(__name__)

def save_embedding_to_db(event_id: str, file_path: str, face_vector: list):
    """
    Saves a new photo and its extracted face embedding to PostgreSQL,
    linked to a specific event.
    """
    db = SessionLocal()
    try:
        new_photo = EventPhoto(
            event_id=event_id,
            file_path=file_path,
            face_embedding=face_vector 
        )
        db.add(new_photo)
        db.commit()
        logger.info(f"Successfully saved embedding for file ID: {file_path}")
    except Exception as e:
        db.rollback()
        logger.error(f"Error saving to database: {e}")
    finally:
        db.close()