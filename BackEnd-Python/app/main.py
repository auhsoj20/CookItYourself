from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import mysql.connector

db = mysql.connector.connect(
    host="192.168.10.60", 
    port="3306",
    user="root",
    charset="utf8mb4",
    database="cookityourself", 
    password="root_password")
    
app = FastAPI()

# Erlaube CORS für alle Ursprünge (*)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Hier können Sie die erlaubten Ursprünge festlegen
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    cursor = db.cursor()
    cursor.execute("SELECT * FROM usertable")
    result = cursor.fetchall()
    cursor.close()
    return result

@app.get("/test")
def read_root():
    cursor = db.cursor()
    cursor.execute("SELECT * FROM usertable WHERE id = 1")
    result = cursor.fetchall()
    cursor.close()
    return result


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    cursor = db.cursor()
    cursor.close()
    item_id = item_id / 10
    return {"item_id": item_id, "q": q}