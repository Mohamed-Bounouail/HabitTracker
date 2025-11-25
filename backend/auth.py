from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import os
import models, schemas
from database import get_db

SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain, hashed): return pwd_context.verify(plain, hashed)
def get_password_hash(password): return pwd_context.hash(password)
def get_user_by_email(db, email): return db.query(models.User).filter(models.User.email == email).first()

def create_user(db, user):
    hashed = get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db, email, password):
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password): return False
    return user

def create_access_token(data, expires_delta=None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None: raise credentials_exception
    except JWTError: raise credentials_exception
    user = get_user_by_email(db, email=email)
    if user is None: raise credentials_exception
    return user
