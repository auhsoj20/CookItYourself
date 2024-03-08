from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import mysql.connector

db = mysql.connector.connect(
    host="192.168.10.60", 
    port="3306",
    user="BE-Serviceuser",
    charset="utf8mb4",
    database="cookityourself", 
    password="!123456789A")
    
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
    cursor.execute("SELECT * FROM usertable WHERE id = " + "1")
    result = cursor.fetchall()
    cursor.close()
    test = ("SELECT * FROM usertable WHERE id = " + "1")
    print(test)
    return result


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    cursor = db.cursor()
    cursor.close()
    item_id = item_id / 10
    return {"item_id": item_id, "q": q}


@app.get("/recipe_header/{recipe_id}")
def read_item(recipe_id: int):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM recipe_header WHERE recipe_id = " + str(recipe_id))
    result = cursor.fetchall()
    cursor.close()
    return result

@app.get("/recipe_header/")
def read_root():
    cursor = db.cursor()
    cursor.execute("SELECT * FROM recipe_header")
    result = cursor.fetchall()
    cursor.close()
    return result

@app.get("/recipe_ingredients/{recipe_id}")
def read_item(recipe_id: int):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM recipe_ingredients WHERE recipe_id = " + str(recipe_id))
    result = cursor.fetchall()
    cursor.close()
    return result

@app.get("/recipe_ingredients/")
def read_root():
    cursor = db.cursor()
    cursor.execute("SELECT * FROM recipe_ingredients")
    result = cursor.fetchall()
    cursor.close()
    return result

@app.get("/recipe_cookingsteps/{recipe_id}")
def read_item(recipe_id: int):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM recipe_cookingsteps WHERE recipe_id = " + str(recipe_id))
    result = cursor.fetchall()
    cursor.close()
    return result

@app.get("/recipe_cookingsteps/")
def read_root():
    cursor = db.cursor()
    cursor.execute("SELECT * FROM recipe_cookingsteps")
    result = cursor.fetchall()
    cursor.close()
    return result
