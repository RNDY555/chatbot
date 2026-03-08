from pydantic import BaseModel
from typing import Optional, List

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

class ChunkCreate(BaseModel):
    content: str
    embedding: List[float]

class ChunkOut(BaseModel):
    id: int
    content: str
    embedding: List[float]

    class Config:
        orm_mode = True