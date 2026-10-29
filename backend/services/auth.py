import os
import hmac
import hashlib
import jwt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from dotenv import load_dotenv

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import SessionLocal
from models import Organizer

load_dotenv()

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET_KEY", "spotme-ai-jwt-secret-key-secure-college-2026")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Master admin fallback credentials (from .env)
MASTER_ADMIN_USER = os.getenv("ADMIN_USERNAME", "admin")
MASTER_ADMIN_PASS = os.getenv("ADMIN_PASSWORD", "spotme2026")

security = HTTPBearer()

def hash_password(password: str, salt: str = "spotme_salt_key") -> str:
    """Cryptographically secure PBKDF2-HMAC-SHA256 password hashing."""
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return key.hex()

def verify_password(plain_password: str, stored_hash: str) -> bool:
    """Constant-time verification of password against stored hash."""
    hashed_attempt = hash_password(plain_password)
    return hmac.compare_digest(hashed_attempt, stored_hash)

def register_new_organizer(username: str, password: str) -> str:
    """Registers a new organizer into the database."""
    clean_username = username.strip().lower()
    if len(clean_username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters long.")
    if len(password.strip()) < 5:
        raise HTTPException(status_code=400, detail="Password must be at least 5 characters long.")

    with SessionLocal() as db:
        # Check if username already exists
        existing = db.query(Organizer).filter(Organizer.username == clean_username).first()
        if existing or clean_username == MASTER_ADMIN_USER.lower():
            raise HTTPException(status_code=400, detail="This username is already taken. Please choose another.")

        hashed = hash_password(password.strip())
        new_organizer = Organizer(
            username=clean_username,
            hashed_password=hashed
        )
        db.add(new_organizer)
        db.commit()

    return clean_username

def verify_organizer_login(username: str, password: str) -> bool:
    """Verifies credentials against the PostgreSQL database or master admin fallback."""
    clean_username = username.strip().lower()
    
    # Check master admin fallback
    if clean_username == MASTER_ADMIN_USER.lower():
        if hmac.compare_digest(password.strip(), MASTER_ADMIN_PASS):
            return True

    # Check registered organizers in PostgreSQL
    with SessionLocal() as db:
        organizer = db.query(Organizer).filter(Organizer.username == clean_username).first()
        if organizer and verify_password(password.strip(), organizer.hashed_password):
            return True

    return False

def create_access_token(username: str) -> str:
    """Creates a signed JWT token."""
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {
        "sub": username.lower(),
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    FastAPI Dependency:
    Validates the Bearer token against registered organizers or master admin.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate organizer session",
            headers={"WWW-Authenticate": "Bearer"},
        )
