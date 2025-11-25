from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    class Config:
        orm_mode = True

class HabitBase(BaseModel):
    name: str
    category: Optional[str] = "General"

class HabitCreate(HabitBase):
    pass

class Habit(HabitBase):
    id: int
    owner_id: int
    completed_dates: List[str] = []
    created_at: datetime
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
