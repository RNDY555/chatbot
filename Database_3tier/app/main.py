from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session
from .db import get_db, Base, engine
from .models import Task
from .schemas import TaskCreate, TaskRemove, TaskUpdate



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


