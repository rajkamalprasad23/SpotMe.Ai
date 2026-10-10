import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from models import EventPhoto

def retrieve_similar_images(event_id: str, image_embedding: list[float]) -> list[str]:
    """
    Takes an event_id and a 1D face embedding, and returns a list of matching file paths for that event.
    """
    threshold = 0.6 
    
    with SessionLocal() as session:
        results = session.query(EventPhoto).filter(
            EventPhoto.event_id == event_id,
            EventPhoto.face_embedding.cosine_distance(image_embedding) < threshold
        ).order_by(
            EventPhoto.face_embedding.cosine_distance(image_embedding)
        ).all()
        
    return [row.file_path for row in results]

def retrieve_similar_images_with_scores(
    event_id: str,
    image_embedding: list[float],
    threshold: float = 0.6,
    limit: int = 50,
) -> list[tuple[str, float]]:
    """
    Takes an event_id and a 1D face embedding, and returns matches with their confidence scores.
    """
    with SessionLocal() as session:
        dist = EventPhoto.face_embedding.cosine_distance(image_embedding)
        rows = (
            session.query(EventPhoto, dist.label("score"))
            .filter(
                EventPhoto.event_id == event_id,
                dist < threshold
            )
            .order_by(dist)
            .limit(limit)
            .all()
        )
    return [(row.EventPhoto.file_path, row.score) for row in rows]
