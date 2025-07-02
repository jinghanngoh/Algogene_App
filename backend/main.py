from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, validator
from jose import JWTError, jwt
from datetime import datetime, timedelta
import requests
import uuid
import os
import json
import time
from typing import Optional, List, Dict

# FastAPI app
app = FastAPI()

# Configuration
BASE_URL = os.getenv("BASE_URL", "https://algogene.com")
# BASE_URL = os.getenv("BASE_URL", "https://blindly-beloved-muskox.ngrok-free.app")
API_KEY = os.getenv("ALGOGENE_API_KEY", "13c80d4bd1094d07ceb974baa684cf8ccdd18f4aea56a7c46cc91abf0cc883ff")
USER = os.getenv("ALGOGENE_USER", "AGBOT1")
SECRET_KEY = os.getenv("SECRET_KEY", os.urandom(32).hex()) # WHATS THIS FOR
ALGORITHM = "HS256" # WHATS THIS FOR
ACCESS_TOKEN_EXPIRE_DAYS = 14

# SQLite database setup
DATABASE_URL = "sqlite:///./algogene_app.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database models (WHAT IS THIS FOR?)
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, index=True)
    algogene_cid = Column(String, nullable=True)  # ALGOGENE client ID
    session_id = Column(String, nullable=True)  # ALGOGENE session ID

class Cache(Base):
    __tablename__ = "cache"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value = Column(Text)  # Store JSON string
    created_at = Column(Integer)  # Unix timestamp

Base.metadata.create_all(bind=engine) #WHAT IS THIS FOR

# Pydantic models
class Token(BaseModel):
    access_token: str
    token_type: str

class PortfolioParams(BaseModel):
    StartDate: str
    EndDate: str
    arrSymbol: List[str]
    objective: int = 0
    target_return: float = 0.15
    risk_tolerance: float = 0.3
    allowShortSell: bool = False
    risk_free_rate: float = 0.01
    basecur: str = "USD"
    total_portfolio_value: float = 1000000
    group_cond: Optional[Dict] = None

    @validator("objective")
    def validate_objective(cls, v):
        if v not in [0, 1, 2, 3, 4]:
            raise ValueError("Objective must be 0-4")
        return v

# Dependency to get Database session 
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# JWT token creation
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Verify JWT Token (Checking the wristband)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(User).filter(User.email == email).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")