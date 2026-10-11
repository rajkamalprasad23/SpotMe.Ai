import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("FATAL ERROR: DATABASE_URL is not set. Please create a .env file and add your Supabase link.")

# Connect to the database
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    # Ensure vector extension is enabled
    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    conn.commit()

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()