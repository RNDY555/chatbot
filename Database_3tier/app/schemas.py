from pydantic import BaseModel
from typing import Optional

class TaskCreate(BaseModel):
    title:str
    description:str

class TaskUpdate(BaseModel):
    title:Optional[str]
    description:Optional[str]
    done:Optional[bool]

class TaskRemove(BaseModel):
    id:int
    title:str
    description:str
    done:bool

    class Config:
        orm_mode = True

