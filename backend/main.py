import re
import logging
import numpy as np
import cv2

from fastapi import FastAPI, BackgroundTasks, File, UploadFile, Form, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl, field_validator

# Local modules
from services import embedding_generate
from services import save_to_database
from services import download
from services import retrive
from services.auth import (
    register_new_organizer,
    verify_organizer_login,
    create_access_token,
    get_current_admin
)
from database import SessionLocal, engine
from models import Event, EventPhoto, Base

# ---------------------------------------------------------
# 1. SETUP & CONFIGURATION
# ---------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Create the database tables if they don't exist yet (including organizers table)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SpotMe.Ai Backend", description="Multi-Event API for Face Recognition")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# 2. DATA VALIDATION MODELS (Schemas)
# ---------------------------------------------------------
class AdminLoginRequest(BaseModel):
    username: str
    password: str

class EventCreateRequest(BaseModel):
    """
    Expected structure when the Admin creates a new event.
    """
    event_name: str
    folder_url: HttpUrl

    @field_validator('folder_url')
    @classmethod
    def validate_drive_url(cls, value: HttpUrl) -> HttpUrl:
        url_str = str(value)
        if value.host != "drive.google.com":
            raise ValueError("The URL must belong to drive.google.com")
        if "/folders/" not in url_str and "id=" not in url_str:
            raise ValueError("The URL does not appear to be a Google Drive folder link")
            
        match = re.search(r'[-\w]{25,}', url_str)
        if not match:
            raise ValueError("Could not find a valid Google Drive ID in the URL")
        return value

# ---------------------------------------------------------
# 3. BACKGROUND TASKS (Pipeline)
# ---------------------------------------------------------
def process_images_in_background(event_id: str, folder_url: str):
    logger.info(f"Starting background job for Event {event_id} (URL: {folder_url})")
    
    try:
        for file_id, image_matrix in download.image_stream_from_drive(folder_url, batch_size=50, max_workers=8):
            logger.info(f"Processing image: {file_id}")
            face_embeddings = embedding_generate.extract_embeddings(image_matrix)
            
            for embedding in face_embeddings:
                save_to_database.save_embedding_to_db(event_id, file_id, embedding)
                
        db = SessionLocal()
        event = db.query(Event).filter(Event.id == event_id).first()
        if event:
            event.status = "ready"
            db.commit()
            logger.info(f"Event {event_id} is now READY.")
        db.close()
        
    except Exception as e:
        logger.error(f"FATAL ERROR IN BACKGROUND TASK: {e}", exc_info=True)

# ---------------------------------------------------------
# 4. ADMIN & AUTHENTICATION ROUTES
# ---------------------------------------------------------
@app.post("/admin/register")
async def admin_register(request: AdminLoginRequest):
    """Registers a new organizer into PostgreSQL and returns signed JWT."""
    clean_username = register_new_organizer(request.username, request.password)
    token = create_access_token(clean_username)
    return {
        "status": "success",
        "access_token": token,
        "token_type": "bearer",
        "username": clean_username,
        "message": f"Organizer account '{clean_username}' registered successfully."
    }

@app.post("/admin/login")
async def admin_login(request: AdminLoginRequest):
    """Verifies organizer credentials against DB and returns a signed JWT access token."""
    if not verify_organizer_login(request.username, request.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid organizer username or password"
        )
    token = create_access_token(request.username)
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": request.username
    }

@app.get("/admin/verify")
async def verify_admin(current_admin: str = Depends(get_current_admin)):
    """Validates existing session token."""
    return {"status": "authenticated", "username": current_admin}

@app.get("/admin/all-events")
async def get_admin_all_events(current_admin: str = Depends(get_current_admin)):
    """Protected: Returns all events including processing states and photo counts."""
    db = SessionLocal()
    events = db.query(Event).order_by(Event.name).all()
    response = []
    for e in events:
        photo_count = db.query(EventPhoto).filter(EventPhoto.event_id == e.id).count()
        response.append({
            "id": e.id,
            "name": e.name,
            "status": e.status,
            "folder_url": e.folder_url,
            "photo_count": photo_count
        })
    db.close()
    return response

@app.post("/admin/events")
async def create_event(
    request: EventCreateRequest,
    background_tasks: BackgroundTasks,
    current_admin: str = Depends(get_current_admin)
):
    """Protected route: Requires valid JWT Bearer token."""
    url_str = str(request.folder_url)
    db = SessionLocal()
    new_event = Event(name=request.event_name, folder_url=url_str, status="processing")
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    event_id = new_event.id
    db.close()
    
    background_tasks.add_task(process_images_in_background, event_id, url_str)
    
    return {
        "status": "success",
        "event_id": event_id,
        "message": f"Event '{request.event_name}' created! Processing started in the background."
    }

# ---------------------------------------------------------
# 5. USER ROUTES
# ---------------------------------------------------------
@app.get("/events")
async def get_available_events():
    db = SessionLocal()
    events = db.query(Event).filter(Event.status == "ready").all()
    response = []
    for e in events:
        photo_count = db.query(EventPhoto).filter(EventPhoto.event_id == e.id).count()
        response.append({
            "id": e.id,
            "name": e.name,
            "photo_count": photo_count
        })
    db.close()
    return response

@app.get("/events/{event_id}")
async def get_event_by_id(event_id: str):
    db = SessionLocal()
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        db.close()
        raise HTTPException(status_code=404, detail="Event not found")
    photo_count = db.query(EventPhoto).filter(EventPhoto.event_id == event.id).count()
    response = {
        "id": event.id,
        "name": event.name,
        "status": event.status,
        "photo_count": photo_count
    }
    db.close()
    return response

@app.post("/find-matches")
async def find_matches(event_id: str = Form(...), selfie: UploadFile = File(...)):
    image_bytes = await selfie.read()
    image_array = np.frombuffer(image_bytes, dtype=np.uint8)
    image_matrix = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    embeddings = embedding_generate.extract_embeddings(image_matrix)
    
    if not embeddings:
        return JSONResponse(status_code=422, content={"detail": "No face detected in selfie."})

    query_embedding = embeddings[0]
    raw_matches = retrive.retrieve_similar_images_with_scores(event_id, query_embedding)

    formatted_matches = []
    for file_id, score in raw_matches:
        similarity_percentage = max(0.0, round((1.0 - score) * 100, 1))

        formatted_matches.append({
            "photo_id": file_id,
            "drive_url": f"https://drive.google.com/thumbnail?id={file_id}&sz=w800",
            "download_url": f"https://drive.google.com/uc?export=download&id={file_id}",
            "match_confidence": similarity_percentage
        })

    return {
        "match_summary": {
            "total_matches": len(formatted_matches)
        },
        "matches": formatted_matches
    }