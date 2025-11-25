from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List
import models, schemas, auth
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="HabitTracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/token", response_model=schemas.Token)
async def login(form_data: auth.OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user: raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token = auth.create_access_token(data={"sub": user.email}, expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if auth.get_user_by_email(db, email=user.email): raise HTTPException(status_code=400, detail="Email already registered")
    return auth.create_user(db=db, user=user)

@app.get("/users/me/", response_model=schemas.User)
async def read_users_me(current: schemas.User = Depends(auth.get_current_user)): return current

@app.get("/habits/", response_model=List[schemas.Habit])
def read_habits(skip: int=0, limit: int=100, db: Session = Depends(get_db), current: schemas.User = Depends(auth.get_current_user)):
    return db.query(models.Habit).filter(models.Habit.owner_id == current.id).offset(skip).limit(limit).all()

@app.post("/habits/", response_model=schemas.Habit)
def create_habit(habit: schemas.HabitCreate, db: Session = Depends(get_db), current: schemas.User = Depends(auth.get_current_user)):
    db_habit = models.Habit(**habit.dict(), owner_id=current.id)
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit

@app.put("/habits/{habit_id}/toggle", response_model=schemas.Habit)
def toggle_habit(habit_id: int, date: str, db: Session = Depends(get_db), current: schemas.User = Depends(auth.get_current_user)):
    habit = db.query(models.Habit).filter(models.Habit.id == habit_id, models.Habit.owner_id == current.id).first()
    if not habit: raise HTTPException(status_code=404, detail="Habit not found")
    dates = list(habit.completed_dates)
    if date in dates: dates.remove(date)
    else: dates.append(date)
    habit.completed_dates = dates
    db.commit()
    db.refresh(habit)
    return habit

@app.delete("/habits/{habit_id}")
def delete_habit(habit_id: int, db: Session = Depends(get_db), current: schemas.User = Depends(auth.get_current_user)):
    habit = db.query(models.Habit).filter(models.Habit.id == habit_id, models.Habit.owner_id == current.id).first()
    if not habit: raise HTTPException(status_code=404, detail="Habit not found")
    db.delete(habit)
    db.commit()
    return {"status": "deleted"}
