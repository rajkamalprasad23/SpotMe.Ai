from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy_utils import database_exists, create_database

DATABASE_URL = "postgresql://postgres:gaira%40123@localhost:5432/images"

if not database_exists(DATABASE_URL):
    create_database(DATABASE_URL)  

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    conn.commit()

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()