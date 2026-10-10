from sqlalchemy import Column, Integer, String, Index, ForeignKey
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from database import Base
import uuid

class Event(Base):
    """Table 1: Stores the events"""
    __tablename__ = "events"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, nullable=False)           
    folder_url = Column(String, nullable=False)     
    status = Column(String, default="processing")   

    photos = relationship("EventPhoto", back_populates="event", cascade="all, delete-orphan")


class EventPhoto(Base):
    """Table 2: Stores the faces and links them to an Event"""
    __tablename__ = "event_photos"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, ForeignKey("events.id"), nullable=False, index=True)
    file_path = Column(String, nullable=False) 
    face_embedding = Column(Vector(512))

    event = relationship("Event", back_populates="photos")

    __table_args__ = (
        Index(
            'hnsw_idx_cosine',
            'face_embedding',
            postgresql_using='hnsw',
            postgresql_with={'m': 16, 'ef_construction': 64},
            postgresql_ops={'face_embedding': 'vector_cosine_ops'} 
        ),
    )
