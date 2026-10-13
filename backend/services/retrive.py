import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from models import EventPhoto

def retrieve_similar_images_with_scores(
    event_id: str,
    image_embedding: list[float],
    threshold: float = 0.6,
    max_candidates: int = 500,
) -> list[tuple[str, float]]:
    """
    Takes an event_id and a 1D face embedding.
    Returns deduplicated (unique) matching file paths ordered by best match first (lowest cosine distance).
    """
    with SessionLocal() as session:
        dist = EventPhoto.face_embedding.cosine_distance(image_embedding)
        
        # 1. Fetch matching rows ordered from best match to lowest match
        rows = (
            session.query(EventPhoto.file_path, dist.label("score"))
            .filter(
                EventPhoto.event_id == event_id,
                dist < threshold
            )
            .order_by(dist)
            .limit(max_candidates)
            .all()
        )

        # 2. Deduplicate by file_path so each photo is returned only once
        seen_file_ids = set()
        unique_matches = []
        for file_path, score in rows:
            if file_path not in seen_file_ids:
                seen_file_ids.add(file_path)
                unique_matches.append((file_path, float(score)))

    return unique_matches
