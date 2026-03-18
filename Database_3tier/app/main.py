from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session
from .db import get_db, Base, engine
from .models import Task, Chunk
from .schemas import TaskCreate, TaskRemove, TaskUpdate, ChunkCreate, ChunkOut, ChunkSearch

app = FastAPI()

Base.metadata.create_all(bind=engine)

@app.post("/tasks")
def create_task(title:str,description:str, db: Session = Depends(get_db)):
    t = Task(title = title, description = description, done=False)
    db.add(t)
    db.commit()
    db.refresh(t)
    return {"id": t.id, "title": t.title, "description": t.description, "done": t.done}


@app.get("/tasks")
def list_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Task).order_by(Task.id.asc()).all()
    return [{"id": t.id, "title": t.title, "description": t.description, "done": t.done} for t in tasks]

@app.patch("/tasks/{task_id}", response_model=TaskRemove)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
    t = db.query(Task).filter(Task.id == task_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    if payload.title is not None:
        if(payload.title != "string"):
            t.title = payload.title
    if payload.done is not None:
            t.done = payload.done
    if payload.description is not None:
        if (payload.done != "string"):
            t.description = payload.description

    db.commit()
    db.refresh(t)
    return t

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    t = db.query(Task).filter(Task.id == task_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(t)
    db.commit()
    return {"deleted":True, "id": task_id}


@app.post("/chunks", response_model=ChunkOut)
def create_chunk(payload: ChunkCreate, db: Session = Depends(get_db)):
    if len(payload.embedding != 3):
        raise HTTPException(status_code=400, detail="Embedding must have exactly 3 numbers")
    c = Chunk(content = payload.content, embedding = payload.embedding)
    db.add(c)
    db.commit()
    db.refresh(c)
    return c

@app.post("/chunks/search", response_model=list[ChunkOut])
def search_chunks(payload: ChunkSearch, db: Session = Depends(get_db)):
    if len(payload.query_embedding != 3):
        raise HTTPException(status_code=400, detail="Embedding must have exactly 3 numbers")
    c = (db.query(Chunk).order_by(Chunk.embedding.l2_distance(payload.query_embedding)).limit(5).all()) # change l2_distance to cosine
    return c


@app.get("/chunks", response_model=list[ChunkOut])
def list_chunks(db: Session = Depends((get_db))):
    chunks = db.query(Chunk).order_by(Chunk.id.asc()).all()
    return chunks