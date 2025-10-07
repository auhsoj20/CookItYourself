from typing import Union, List, Optional
import base64
import io
import os
import shutil
from pathlib import Path
import json
import numpy as np
from PIL import Image
import cv2
import torch
import torchvision.transforms as transforms
from torchvision import models
import tensorflow as tf
from transformers import pipeline, BlipProcessor, BlipForConditionalGeneration
from pydantic import BaseModel, EmailStr
from datetime import datetime
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector

# ========================================
# DETECTRON2 IMPORTS
# ========================================

DETECTRON2_AVAILABLE = False
detectron2_model = None
detectron2_cfg = None

try:
    from detectron2 import model_zoo
    from detectron2.engine import DefaultPredictor
    from detectron2.config import get_cfg
    from detectron2.utils.visualizer import Visualizer
    from detectron2.data import MetadataCatalog
    from detectron2.utils.logger import setup_logger
    setup_logger()
    DETECTRON2_AVAILABLE = True
    print("Detectron2 erfolgreich importiert")
except ImportError as e:
    print(f"Detectron2 nicht verfügbar: {e}")
except Exception as e:
    print(f"Fehler beim Import von Detectron2: {e}")

# ========================================
# PYDANTIC MODELLE
# ========================================

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class StatusUpdate(BaseModel):
    status: str

class RecipeStep(BaseModel):
    step_number: int
    description: str

class RecipeCreate(BaseModel):
    recipe_name: str
    user_id: Optional[int] = None
    steps: List[RecipeStep]

# ========================================
# DATENBANK
# ========================================

db = mysql.connector.connect(
    host="192.168.10.60", 
    port="3306",
    user="BE-Serviceuser",
    charset="utf8mb4",
    database="cookityourself", 
    password="!123456789A",
    ssl_disabled=True  # SSL deaktivieren
)
    
# ========================================
# FASTAPI APP
# ========================================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========================================
# UPLOAD KONFIGURATION
# ========================================

UPLOAD_DIR = Path("uploads/recipe_images")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_FILE_SIZE = 10 * 1024 * 1024
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

# ========================================
# KI-MODELL VARIABLEN
# ========================================

yolo_model = None
pytorch_model = None
blip_processor = None
blip_model = None

# ========================================
# KI-MODELL INITIALISIERUNG
# ========================================

def initialize_models():
    global yolo_model, pytorch_model, blip_processor, blip_model, detectron2_model, detectron2_cfg
    
    try:
        print("Lade YOLO Modell...")
        yolo_model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)
        print("YOLO Modell geladen")
    except Exception as e:
        print(f"YOLO Modell konnte nicht geladen werden: {e}")
        
    try:
        print("Lade PyTorch ResNet Modell...")
        pytorch_model = models.resnet50(pretrained=True)
        pytorch_model.eval()
        print("PyTorch Modell geladen")
    except Exception as e:
        print(f"PyTorch Modell konnte nicht geladen werden: {e}")
        
    try:
        print("Lade BLIP Modell...")
        blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
        blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
        print("BLIP Modell geladen")
    except Exception as e:
        print(f"BLIP Modell konnte nicht geladen werden: {e}")
        
    if DETECTRON2_AVAILABLE:
        try:
            print("Lade Detectron2 Modell...")
            detectron2_cfg = get_cfg()
            detectron2_cfg.merge_from_file(model_zoo.get_config_file("COCO-Detection/faster_rcnn_R_50_FPN_3x.yaml"))
            detectron2_cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = 0.5
            detectron2_cfg.MODEL.WEIGHTS = model_zoo.get_checkpoint_url("COCO-Detection/faster_rcnn_R_50_FPN_3x.yaml")
            detectron2_cfg.MODEL.DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
            detectron2_model = DefaultPredictor(detectron2_cfg)
            print("Detectron2 Modell erfolgreich geladen")
        except Exception as e:
            print(f"Fehler beim Laden von Detectron2: {e}")

# ========================================
# KI-ANALYSE FUNKTIONEN
# ========================================

def analyze_ingredients_yolo(image_data):
    try:
        if yolo_model is None:
            return ["YOLO Modell nicht verfügbar"]
        image = Image.open(io.BytesIO(image_data))
        results = yolo_model(image)
        detections = results.pandas().xyxy[0]
        
        food_classes = ['apple', 'banana', 'orange', 'broccoli', 'carrot', 'sandwich', 'hot dog', 'pizza', 'donut', 'cake', 'bottle', 'wine glass', 'cup', 'bowl']
        
        ingredients = []
        for _, detection in detections.iterrows():
            class_name = detection['name']
            confidence = detection['confidence']
            if class_name in food_classes and confidence > 0.5:
                german_translations = {
                    'apple': 'Apfel', 'banana': 'Banane', 'sandwich': 'Sandwich',
                    'orange': 'Orange', 'broccoli': 'Brokkoli', 'carrot': 'Karotte',
                    'hot dog': 'Hot Dog', 'pizza': 'Pizza', 'donut': 'Donut',
                    'cake': 'Kuchen', 'bottle': 'Flasche', 'wine glass': 'Weinglas',
                    'cup': 'Tasse', 'bowl': 'Schüssel'
                }
                ingredients.append(german_translations.get(class_name, class_name))
        return ingredients if ingredients else ["Keine Lebensmittel erkannt"]
    except Exception as e:
        return ["YOLO Verarbeitung fehlgeschlagen"]

def analyze_ingredients_blip(image_data):
    try:
        if blip_model is None or blip_processor is None:
            return ["BLIP Modell nicht verfügbar"]
        image = Image.open(io.BytesIO(image_data)).convert('RGB')
        inputs = blip_processor(image, return_tensors="pt")
        out = blip_model.generate(**inputs, max_length=50, num_beams=5)
        description = blip_processor.decode(out[0], skip_special_tokens=True)
        ingredients = extract_ingredients_from_text(description)
        return ingredients if ingredients else [f"Bildbeschreibung: {description}"]
    except Exception as e:
        return ["BLIP Verarbeitung fehlgeschlagen"]

def analyze_ingredients_opencv(image_data):
    try:
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        ingredients = []
        color_ranges = {
            'Tomaten': ([0, 50, 50], [10, 255, 255]),
            'Karotten': ([10, 50, 50], [25, 255, 255]),
            'Salat': ([40, 40, 40], [80, 255, 255])
        }
        for ingredient, (lower, upper) in color_ranges.items():
            mask = cv2.inRange(hsv, np.array(lower), np.array(upper))
            if cv2.countNonZero(mask) > 1000:
                ingredients.append(ingredient)
        return ingredients if ingredients else ["Keine charakteristischen Farben erkannt"]
    except Exception as e:
        return ["OpenCV Verarbeitung fehlgeschlagen"]

def analyze_ingredients_detectron2(image_data):
    try:
        if not DETECTRON2_AVAILABLE or detectron2_model is None:
            return ["Detectron2 nicht verfügbar"]
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        outputs = detectron2_model(image)
        instances = outputs["instances"]
        coco_food_classes = {
            52: 'Banane', 53: 'Apfel', 54: 'Sandwich', 55: 'Orange', 
            56: 'Brokkoli', 57: 'Karotte', 59: 'Pizza', 61: 'Kuchen'
        }
        ingredients = []
        for i in range(len(instances)):
            class_id = instances.pred_classes[i].item()
            confidence = instances.scores[i].item()
            if confidence > 0.6 and class_id in coco_food_classes:
                ingredients.append(f"{coco_food_classes[class_id]}")
        return ingredients if ingredients else ["Keine Lebensmittel erkannt"]
    except Exception as e:
        return ["Detectron2 Verarbeitung fehlgeschlagen"]

def extract_ingredients_from_text(text):
    keywords = ['tomato', 'tomate', 'zwiebel', 'onion', 'karotte', 'carrot', 'paprika', 'pepper', 'salat', 'lettuce']
    found = []
    text_lower = text.lower()
    for keyword in keywords:
        if keyword in text_lower:
            found.append(keyword.capitalize())
    return list(set(found))

# ========================================
# HILFSFUNKTIONEN BILD-UPLOAD
# ========================================

def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lower()

def validate_image(file: UploadFile) -> bool:
    ext = get_file_extension(file.filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Ungültiges Dateiformat")
    return True

def save_image(file: UploadFile, recipe_id: int, step_id: Optional[int] = None, order: int = 0) -> str:
    # TODO SPÄTER: Diese Funktion für Bild-Speicherung verwenden
    try:
        validate_image(file)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        ext = get_file_extension(file.filename)
        filename = f"recipe_{recipe_id}_step_{step_id}_img_{order}_{timestamp}{ext}" if step_id else f"recipe_{recipe_id}_main_{order}_{timestamp}{ext}"
        file_path = UPLOAD_DIR / filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return str(Path("uploads/recipe_images") / filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern: {str(e)}")

# ========================================
# STARTUP
# ========================================

@app.on_event("startup")
async def startup_event():
    initialize_models()

# ========================================
# ALTE ENDPOINTS
# ========================================

@app.get("/")
def read_root():
    cursor = db.cursor()
    cursor.execute("SELECT * FROM usertable")
    result = cursor.fetchall()
    cursor.close()
    return result

@app.get("/test")
def read_test():
    cursor = db.cursor()
    cursor.execute("SELECT * FROM usertable WHERE id = 1")
    result = cursor.fetchall()
    cursor.close()
    return result

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    cursor = db.cursor()
    cursor.close()
    return {"item_id": item_id / 10, "q": q}

@app.get("/recipe_header/{recipe_id}")
def read_recipe_header_by_id(recipe_id: int):
    try:
        if not db.is_connected():
            db.reconnect()
        cursor = db.cursor()
        cursor.execute("SELECT * FROM recipe_header WHERE recipe_id = %s", (recipe_id,))
        result = cursor.fetchall()
        cursor.close()
        return result if result else []
    except Exception as e:
        print(f"ERROR in recipe_header/{recipe_id}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/recipe_header/")
def read_all_recipe_headers():
    try:
        conn = get_db_connection()  # Verwende get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM recipe_header")
        result = cursor.fetchall()
        cursor.close()
        return result
    except Exception as e:
        print(f"Fehler: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/recipe_ingredients/{recipe_id}")
def read_recipe_ingredients_by_id(recipe_id: int):
    try:
        if not db.is_connected():
            db.reconnect()
        cursor = db.cursor()
        cursor.execute("SELECT * FROM recipe_ingredients WHERE recipe_id = %s", (recipe_id,))
        result = cursor.fetchall()
        cursor.close()
        return result if result else []
    except Exception as e:
        print(f"ERROR in recipe_ingredients/{recipe_id}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/recipe_ingredients/")
def read_all_recipe_ingredients():
    cursor = db.cursor()
    cursor.execute("SELECT * FROM recipe_ingredients")
    result = cursor.fetchall()
    cursor.close()
    return result

@app.get("/recipe_cookingsteps/{recipe_id}")
def read_recipe_cookingsteps_by_id(recipe_id: int):
    try:
        if not db.is_connected():
            db.reconnect()
        cursor = db.cursor()
        cursor.execute(
            "SELECT * FROM recipe_cookingsteps WHERE recipe_id = %s ORDER BY CAST(step AS UNSIGNED) ASC", 
            (recipe_id,)
        )
        result = cursor.fetchall()
        cursor.close()
        return result if result else []
    except Exception as e:
        print(f"ERROR in recipe_cookingsteps/{recipe_id}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/recipe_cookingsteps/")
def read_all_recipe_cookingsteps():
    cursor = db.cursor()
    cursor.execute("SELECT * FROM recipe_cookingsteps ORDER BY CAST(step AS UNSIGNED) ASC")
    result = cursor.fetchall()
    cursor.close()
    return result

# ========================================
# KI ENDPOINTS
# ========================================

@app.post("/analyze_ingredients")
async def analyze_ingredients(file: UploadFile = File(...), ai_type: str = Form(...)):
    try:
        image_data = await file.read()
        if ai_type == "yolo":
            ingredients = analyze_ingredients_yolo(image_data)
        elif ai_type == "blip":
            ingredients = analyze_ingredients_blip(image_data)
        elif ai_type == "opencv":
            ingredients = analyze_ingredients_opencv(image_data)
        elif ai_type == "detectron2":
            ingredients = analyze_ingredients_detectron2(image_data)
        else:
            raise HTTPException(status_code=400, detail="Unbekannter AI-Typ")
        return {"ai_type": ai_type, "ingredients": ingredients, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler: {str(e)}")

@app.get("/available_ai_models")
def get_available_ai_models():
    return {
        "models": {
            "yolo": yolo_model is not None,
            "blip": blip_model is not None and blip_processor is not None,
            "opencv": True,
            "detectron2": DETECTRON2_AVAILABLE and detectron2_model is not None
        },
        "descriptions": {
            "yolo": "YOLO v5 - Objekterkennung",
            "blip": "BLIP - Bildbeschreibung",
            "opencv": "OpenCV - Farberkennung",
            "detectron2": "Detectron2 - Erweiterte Objekterkennung"
        }
    }

# ========================================
# KONTAKT ENDPOINTS
# ========================================

def save_contact_to_db(contact_data: ContactForm):
    try:
        cursor = db.cursor()
        query = "INSERT INTO contact_requests (name, email, subject, message, created_at, status) VALUES (%s, %s, %s, %s, %s, %s)"
        values = (contact_data.name, contact_data.email, contact_data.subject, contact_data.message, datetime.now(), 'neu')
        cursor.execute(query, values)
        db.commit()
        cursor.close()
        return True
    except Exception as e:
        db.rollback()
        return False

@app.post("/contact")
def submit_contact_form(contact_data: ContactForm):
    try:
        if not save_contact_to_db(contact_data):
            raise HTTPException(status_code=500, detail="Fehler beim Speichern")
        return {"status": "success", "message": "Kontaktanfrage gespeichert"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/contact-requests")
def get_contact_requests():
    try:
        cursor = db.cursor()
        cursor.execute("SELECT id, name, email, subject, message, created_at, status FROM contact_requests ORDER BY created_at DESC")
        columns = ['id', 'name', 'email', 'subject', 'message', 'created_at', 'status']
        result = []
        for row in cursor.fetchall():
            row_dict = {}
            for i, value in enumerate(row):
                row_dict[columns[i]] = value.strftime("%d.%m.%Y %H:%M:%S") if isinstance(value, datetime) else value
            result.append(row_dict)
        cursor.close()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/contact-requests/{request_id}/status")
def update_contact_request_status(request_id: int, status_data: StatusUpdate):
    try:
        if not db.is_connected():
            db.reconnect()
        cursor = db.cursor()
        valid_statuses = ['neu', 'in_bearbeitung', 'abgeschlossen']
        if status_data.status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Ungültiger Status")
        cursor.execute("UPDATE contact_requests SET status = %s WHERE id = %s", (status_data.status, request_id))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Anfrage nicht gefunden")
        db.commit()
        cursor.close()
        return {"status": "success", "message": f"Status geändert"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ========================================
# NEUE REZEPT ENDPOINTS
# ========================================

@app.post("/recipes")
async def create_recipe(
    recipe_name: str = Form(...), 
    user_id: Optional[int] = Form(None), 
    steps_data: str = Form(...)
):
    """Erstellt neues Rezept in recipe_header und recipe_cookingsteps"""
    try:
        steps = json.loads(steps_data)
        cursor = db.cursor()
        
        # Nächste recipe_id ermitteln
        cursor.execute("SELECT MAX(recipe_id) FROM recipe_header")
        max_id = cursor.fetchone()[0]
        next_recipe_id = (max_id or 0) + 1
        
        # INSERT in recipe_header
        cursor.execute(
            """INSERT INTO recipe_header 
               (recipe_id, title, create_date, change_date, title_image, description) 
               VALUES (%s, %s, %s, %s, %s, %s)""", 
            (
                next_recipe_id,
                recipe_name,
                datetime.now(),
                datetime.now(),
                '',
                ''
            )
        )
        recipe_id = next_recipe_id
        
        # INSERT in recipe_cookingsteps - MIT 'step' statt 'step_id'
        for step in steps:
            cursor.execute(
                """INSERT INTO recipe_cookingsteps 
                   (recipe_id, step, description) 
                   VALUES (%s, %s, %s)""",
                (recipe_id, step['step_number'], step['description'])
            )
        
        db.commit()
        cursor.close()
        return {
            "status": "success", 
            "message": "Rezept erstellt", 
            "recipe_id": recipe_id
        }
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Ungültiges JSON")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/recipes/{recipe_id}")
def get_recipe_full(recipe_id: int):
    """Lädt vollständiges Rezept (Bilder später)"""
    try:
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM recipes WHERE recipe_id = %s", (recipe_id,))
        recipe = cursor.fetchone()
        if not recipe:
            raise HTTPException(status_code=404, detail="Rezept nicht gefunden")
        if recipe.get('created_at'):
            recipe['created_at'] = recipe['created_at'].strftime("%d.%m.%Y %H:%M:%S")
        if recipe.get('updated_at'):
            recipe['updated_at'] = recipe['updated_at'].strftime("%d.%m.%Y %H:%M:%S")
        cursor.execute("SELECT step_id, step_number, description FROM recipe_steps WHERE recipe_id = %s ORDER BY step_number", (recipe_id,))
        steps = cursor.fetchall()
        
        # TODO SPÄTER: Bilder laden
        for step in steps:
            step['images'] = []
        main_images = []
        
        cursor.close()
        return {"recipe": recipe, "main_images": main_images, "steps": steps, "note": "Bilder später"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/recipes")
def get_all_recipes():
    """Lädt alle Rezepte"""
    try:
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT recipe_id, recipe_name, user_id, created_at, updated_at FROM recipes ORDER BY created_at DESC")
        recipes = cursor.fetchall()
        for recipe in recipes:
            if recipe.get('created_at'):
                recipe['created_at'] = recipe['created_at'].strftime("%d.%m.%Y %H:%M:%S")
            if recipe.get('updated_at'):
                recipe['updated_at'] = recipe['updated_at'].strftime("%d.%m.%Y %H:%M:%S")
        cursor.close()
        return {"recipes": recipes, "count": len(recipes)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/recipes/{recipe_id}")
async def update_recipe(recipe_id: int, recipe_name: Optional[str] = Form(None), steps_data: Optional[str] = Form(None)):
    """Aktualisiert Rezept"""
    try:
        cursor = db.cursor()
        cursor.execute("SELECT recipe_id FROM recipes WHERE recipe_id = %s", (recipe_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Rezept nicht gefunden")
        if recipe_name:
            cursor.execute("UPDATE recipes SET recipe_name = %s, updated_at = %s WHERE recipe_id = %s", 
                          (recipe_name, datetime.now(), recipe_id))
        if steps_data:
            steps = json.loads(steps_data)
            cursor.execute("DELETE FROM recipe_steps WHERE recipe_id = %s", (recipe_id,))
            for step in steps:
                cursor.execute("INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES (%s, %s, %s)",
                              (recipe_id, step['step_number'], step['description']))
        db.commit()
        cursor.close()
        return {"status": "success", "message": "Rezept aktualisiert", "recipe_id": recipe_id}
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Ungültiges JSON")
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/recipes/{recipe_id}")
def delete_recipe(recipe_id: int):
    """Löscht Rezept"""
    try:
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT recipe_id FROM recipes WHERE recipe_id = %s", (recipe_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Rezept nicht gefunden")
        
        # TODO SPÄTER: Bild-Dateien vom Server löschen
        # cursor.execute("SELECT image_path FROM recipe_images WHERE recipe_id = %s", (recipe_id,))
        # for img in cursor.fetchall():
        #     Path(img['image_path']).unlink(missing_ok=True)
        
        cursor.execute("DELETE FROM recipes WHERE recipe_id = %s", (recipe_id,))
        db.commit()
        cursor.close()
        return {"status": "success", "message": f"Rezept {recipe_id} gelöscht"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

####################################################################################

# Nach den bestehenden Pydantic-Modellen
class RecognizedIngredientsData(BaseModel):
    recipe_id: Optional[int] = None
    ingredients: List[str]
    ai_model_used: str
    image_path: Optional[str] = None

# Speichert erkannte Zutaten ins Tracking
@app.post("/save_recognized_ingredients")
async def save_recognized_ingredients(data: RecognizedIngredientsData):
    try:
        cursor = db.cursor()
        
        for ingredient in data.ingredients:
            query = """
            INSERT INTO ai_recognized_ingredients 
            (recipe_id, ingredient_name, ai_model, image_path, recognized_at) 
            VALUES (%s, %s, %s, %s, %s)
            """
            values = (
                data.recipe_id,
                ingredient,
                data.ai_model_used,
                data.image_path,
                datetime.now()
            )
            cursor.execute(query, values)
        
        db.commit()
        cursor.close()
        return {
            "status": "success", 
            "message": f"{len(data.ingredients)} Zutaten gespeichert",
            "ingredients": data.ingredients
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler: {str(e)}")

# Lädt KI-Erkennungen für ein Rezept
@app.get("/ai_recognized_ingredients/{recipe_id}")
def get_ai_recognized_ingredients(recipe_id: int):
    try:
        cursor = db.cursor(dictionary=True)
        query = """
        SELECT ingredient_name, ai_model, recognized_at 
        FROM ai_recognized_ingredients 
        WHERE recipe_id = %s 
        ORDER BY recognized_at DESC
        """
        cursor.execute(query, (recipe_id,))
        results = cursor.fetchall()
        
        for result in results:
            if result.get('recognized_at'):
                result['recognized_at'] = result['recognized_at'].strftime("%d.%m.%Y %H:%M:%S")
        
        cursor.close()
        return {"ingredients": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Fügt erkannte Zutaten direkt zu recipe_ingredients hinzu
@app.post("/map_ingredients_to_recipe")
async def map_ingredients_to_recipe(
    recipe_id: int = Form(...),
    ingredient_mappings: str = Form(...)
):
    """
    Fügt Zutaten zu recipe_ingredients hinzu
    Format: [{"recognized": "Apfel", "mapped": "Äpfel", "amount": "2", "unit": "Stück"}]
    """
    try:
        mappings = json.loads(ingredient_mappings)
        cursor = db.cursor()
        
        for mapping in mappings:
            # Prüfe ob Zutat bereits existiert
            cursor.execute(
                "SELECT ingredient_id FROM recipe_ingredients WHERE recipe_id = %s AND ingredient = %s",
                (recipe_id, mapping['mapped'])
            )
            
            if cursor.fetchone():
                continue  # Skip wenn bereits vorhanden
            
            query = """
            INSERT INTO recipe_ingredients (recipe_id, ingredient, amount, unit)
            VALUES (%s, %s, %s, %s)
            """
            cursor.execute(query, (
                recipe_id,
                mapping['mapped'],
                mapping.get('amount', ''),
                mapping.get('unit', '')
            ))
        
        db.commit()
        cursor.close()
        return {"status": "success", "message": f"{len(mappings)} Zutaten hinzugefügt"}
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Ungültiges JSON")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/search_recipes")
def search_recipes(query: str = ""):
    """Sucht Rezepte nach Namen oder gibt zufällige zurück"""
    try:
        cursor = db.cursor()
        if query.strip():
            # Suche nach Titel
            cursor.execute(
                "SELECT * FROM recipe_header WHERE title LIKE %s ORDER BY title", 
                (f"%{query}%",)
            )
        else:
            # Zufällige Rezepte
            cursor.execute(
                "SELECT * FROM recipe_header ORDER BY RAND() LIMIT 3"
            )
        result = cursor.fetchall()
        cursor.close()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========================================
# DATENBANK mit AUTO-RECONNECT
# ========================================

def get_db_connection():
    """Erstellt neue DB-Verbindung oder reconnect"""
    try:
        if not db.is_connected():
            db.reconnect(attempts=3, delay=2)
        return db
    except Exception as e:
        print(f"Fehler bei DB-Reconnect: {e}")
        return mysql.connector.connect(
            host="192.168.10.60", 
            port="3306",
            user="BE-Serviceuser",
            charset="utf8mb4",
            database="cookityourself", 
            password="!123456789A",
            autocommit=False
        )

db = mysql.connector.connect(
    host="192.168.10.60", 
    port="3306",
    user="BE-Serviceuser",
    charset="utf8mb4",
    database="cookityourself", 
    password="!123456789A",
    pool_name="mypool",
    pool_size=5
)    