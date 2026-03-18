from sqlalchemy import Column, Integer, String, Boolean, Text
from pgvector.sqlalchemy import Vector
from .db import Base

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200),nullable=False)
    description = Column(String(200), nullable=False)
    done = Column(Boolean, nullable=False, default=False)

class Chunk(Base):
    __tablename__ = "chunks"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    embedding = Column(Vector(3), nullable=False)