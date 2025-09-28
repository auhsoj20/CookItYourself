from typing import Union
import base64
import io
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

# Detectron2 imports mit verbessertem Fallback
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
    print("Detectron2 wird übersprungen. Installation mit: pip install detectron2")
except Exception as e:
    print(f"Fehler beim Import von Detectron2: {e}")

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import mysql.connector

# Pydantic Modell für das Kontaktformular
class ContactForm(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

# Pydantic Modell für Status-Update
class StatusUpdate(BaseModel):
    status: str

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


# Globale Variablen für die lokalen KI-Modelle
yolo_model = None
pytorch_model = None
blip_processor = None
blip_model = None

def initialize_models():
    """
    Initialisiere alle lokalen KI-Modelle beim Serverstart
    """
    global yolo_model, pytorch_model, blip_processor, blip_model, detectron2_model, detectron2_cfg
    
    try:
        # YOLO für Objekterkennung (YOLOv5)
        print("Lade YOLO Modell...")
        yolo_model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)
        print("YOLO Modell geladen")
    except Exception as e:
        print(f"YOLO Modell konnte nicht geladen werden: {e}")
        
    try:
        # PyTorch ResNet für Bildklassifikation
        print("Lade PyTorch ResNet Modell...")
        pytorch_model = models.resnet50(pretrained=True)
        pytorch_model.eval()
        print("PyTorch Modell geladen")
    except Exception as e:
        print(f"PyTorch Modell konnte nicht geladen werden: {e}")
        
    try:
        # BLIP für Bildbeschreibung und Objekterkennung
        print("Lade BLIP Modell...")
        blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
        blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
        print("BLIP Modell geladen")
    except Exception as e:
        print(f"BLIP Modell konnte nicht geladen werden: {e}")
        
    # Detectron2 für erweiterte Objekterkennung
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
            print("Detectron2 bleibt als nicht verfügbar markiert")
    else:
        print("Detectron2 übersprungen - nicht verfügbar")

def analyze_ingredients_yolo(image_data):
    """
    KI Option 1: YOLO für lokale Objekterkennung
    """
    try:
        if yolo_model is None:
            return ["YOLO Modell nicht verfügbar"]
            
        # Konvertiere Bytes zu PIL Image
        image = Image.open(io.BytesIO(image_data))
        
        # YOLO Inferenz
        results = yolo_model(image)
        
        # Extrahiere erkannte Objekte
        detections = results.pandas().xyxy[0]
        
        # Filtere nach Lebensmittel-relevanten Klassen
        food_classes = [
            # Früchte
            'apple', 'banana', 'orange', 'lemon', 'lime', 'grapefruit',
            'strawberry', 'blueberry', 'raspberry', 'blackberry', 'grape',
            'pineapple', 'mango', 'papaya', 'kiwi', 'peach', 'pear',
            'plum', 'cherry', 'watermelon', 'cantaloupe', 'avocado',
            'coconut', 'pomegranate', 'fig', 'date',
            
            # Gemüse
            'broccoli', 'carrot', 'celery', 'lettuce', 'spinach', 'kale',
            'cabbage', 'cauliflower', 'brussels sprouts', 'asparagus',
            'onion', 'garlic', 'ginger', 'potato', 'sweet potato',
            'tomato', 'cucumber', 'bell pepper', 'chili pepper',
            'corn', 'peas', 'green beans', 'zucchini', 'eggplant',
            'mushroom', 'radish', 'beet', 'turnip', 'parsnip',
            
            # Getreide und Körner
            'bread', 'rice', 'pasta', 'noodles', 'cereal', 'oats',
            'wheat', 'barley', 'quinoa', 'couscous',
            
            # Proteine
            'chicken', 'beef', 'pork', 'lamb', 'fish', 'salmon',
            'tuna', 'shrimp', 'lobster', 'crab', 'egg', 'tofu',
            'beans', 'lentils', 'chickpeas', 'nuts', 'almonds',
            'peanuts', 'cashews', 'walnuts',
            
            # Milchprodukte
            'milk', 'cheese', 'yogurt', 'butter', 'cream',
            'ice cream', 'sour cream',
            
            # Fertiggerichte und Snacks
            'sandwich', 'hot dog', 'pizza', 'burger', 'taco',
            'burrito', 'sushi', 'soup', 'salad', 'french fries',
            'chips', 'popcorn', 'crackers', 'pretzel',
            
            # Süßwaren und Desserts
            'donut', 'cake', 'cookie', 'muffin', 'cupcake',
            'pie', 'chocolate', 'candy', 'gummy bears', 'lollipop',
            'brownie', 'pudding', 'jelly', 'jam',
            
            # Getränke
            'bottle', 'wine glass', 'cup', 'coffee', 'tea',
            'juice', 'soda', 'water', 'beer', 'wine',
            'cocktail', 'smoothie', 'milkshake',
            
            # Küchenutensilien und Geschirr
            'fork', 'knife', 'spoon', 'bowl', 'plate', 'glass',
            'mug', 'chopsticks', 'cutting board', 'pan', 'pot',
            'spatula', 'whisk', 'ladle', 'tongs', 'grater',
            'blender', 'mixer', 'oven', 'microwave', 'toaster',
            
            # Gewürze und Condiments
            'salt', 'pepper', 'herbs', 'spices', 'vinegar',
            'oil', 'sauce', 'ketchup', 'mustard', 'mayonnaise',
            'honey', 'syrup', 'sugar',
            
            # Weitere lebensmittelbezogene Objekte
            'grocery bag', 'shopping cart', 'food container',
            'lunch box', 'thermos', 'water bottle', 'can opener',
            'bottle opener', 'corkscrew', 'kitchen scale',
            'measuring cup', 'measuring spoon'
        ]
        
        ingredients = []
        for _, detection in detections.iterrows():
            class_name = detection['name']
            confidence = detection['confidence']
            
            if class_name in food_classes and confidence > 0.5:
                # Übersetze englische Namen zu deutschen
                german_translations = {
                    'apple': 'Apfel', 'banana': 'Banane', 'sandwich': 'Sandwich',
                    'orange': 'Orange', 'broccoli': 'Brokkoli', 'carrot': 'Karotte',
                    'hot dog': 'Hot Dog', 'pizza': 'Pizza', 'donut': 'Donut',
                    'cake': 'Kuchen', 'bottle': 'Flasche', 'wine glass': 'Weinglas',
                    'cup': 'Tasse', 'bowl': 'Schüssel'
                }
                german_name = german_translations.get(class_name, class_name)
                ingredients.append(german_name)
        
        return ingredients if ingredients else ["Keine Lebensmittel erkannt"]
        
    except Exception as e:
        print(f"YOLO Fehler: {e}")
        return ["YOLO Verarbeitung fehlgeschlagen"]

def analyze_ingredients_blip(image_data):
    """
    KI Option 2: BLIP für lokale Bildbeschreibung und Zutatenerkennung
    """
    try:
        if blip_model is None or blip_processor is None:
            return ["BLIP Modell nicht verfügbar"]
            
        # Konvertiere Bytes zu PIL Image
        image = Image.open(io.BytesIO(image_data)).convert('RGB')
        
        # BLIP Prompt für Zutatenerkennung
        text = "Erkenne alle Zutaten und Lebensmittel in diesem Bild und gib nur eine kommagetrennte Liste der erkannten Elemente zurück – ohne Einleitung, Zusatztext oder Nummerierung. Verwende deutsche Bezeichnungen und entferne Duplikate."
        
        # Verarbeite das Bild
        inputs = blip_processor(image, text, return_tensors="pt")
        
        # Generiere Beschreibung
        out = blip_model.generate(**inputs, max_length=100, num_beams=5)
        description = blip_processor.decode(out[0], skip_special_tokens=True)
        
        # Zusätzlich: Einfache Bildbeschreibung ohne Text-Prompt
        inputs_simple = blip_processor(image, return_tensors="pt")
        out_simple = blip_model.generate(**inputs_simple, max_length=50, num_beams=5)
        simple_description = blip_processor.decode(out_simple[0], skip_special_tokens=True)
        
        # Extrahiere Zutaten aus der Beschreibung
        ingredients = extract_ingredients_from_text(description + " " + simple_description)
        
        return ingredients if ingredients else [f"Bildbeschreibung: {simple_description}"]
        
    except Exception as e:
        print(f"BLIP Fehler: {e}")
        return ["BLIP Verarbeitung fehlgeschlagen"]

def analyze_ingredients_opencv(image_data):
    """
    KI Option 3: OpenCV + einfache Bildverarbeitung für Farb- und Formerkennung
    """
    try:
        # Konvertiere Bytes zu OpenCV Image
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Konvertiere zu HSV für bessere Farberkennung
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        ingredients = []
        
        # Definiere Farbbereiche für verschiedene Zutaten
        color_ranges = {
            'Tomaten': ([0, 50, 50], [10, 255, 255]),      # Rot
            'Karotten': ([10, 50, 50], [25, 255, 255]),    # Orange
            'Salat': ([40, 40, 40], [80, 255, 255]),       # Grün
            'Zwiebeln': ([20, 30, 30], [40, 255, 255]),    # Gelb/Braun
            'Auberginen': ([120, 50, 50], [140, 255, 255]) # Lila
        }
        
        for ingredient, (lower, upper) in color_ranges.items():
            lower_bound = np.array(lower)
            upper_bound = np.array(upper)
            
            # Erstelle Maske für Farbbereich
            mask = cv2.inRange(hsv, lower_bound, upper_bound)
            
            # Zähle Pixel im Farbbereich
            pixel_count = cv2.countNonZero(mask)
            
            # Wenn genügend Pixel gefunden, füge Zutat hinzu
            if pixel_count > 1000:  # Schwellenwert anpassbar
                ingredients.append(f"{ingredient}")
        
        return ingredients if ingredients else ["Keine charakteristischen Farben erkannt"]
        
    except Exception as e:
        print(f"OpenCV Fehler: {e}")
        return ["OpenCV Verarbeitung fehlgeschlagen"]

def analyze_ingredients_detectron2(image_data):
    """
    KI Option 4: Detectron2 für erweiterte Objekterkennung und Instanzsegmentierung
    """
    try:
        # Prüfe ob Detectron2 verfügbar ist
        if not DETECTRON2_AVAILABLE:
            return ["Detectron2 nicht installiert. Installation: pip install detectron2"]
            
        if detectron2_model is None:
            return ["Detectron2 Modell nicht geladen"]
        
        # Konvertiere Bytes zu numpy array
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Detectron2 Inferenz
        outputs = detectron2_model(image)
        
        # Extrahiere Vorhersagen
        instances = outputs["instances"]
        
        # COCO Klassen für Lebensmittel
        coco_food_classes = {
            47: 'Tasse', 48: 'Gabel', 49: 'Messer', 50: 'Löffel',
            51: 'Schüssel', 52: 'Banane', 53: 'Apfel', 54: 'Sandwich',
            55: 'Orange', 56: 'Brokkoli', 57: 'Karotte', 58: 'Hot Dog',
            59: 'Pizza', 60: 'Donut', 61: 'Kuchen', 44: 'Flasche',
            46: 'Weinglas'
        }
        
        ingredients = []
        confidence_threshold = 0.6
        
        for i in range(len(instances)):
            class_id = instances.pred_classes[i].item()
            confidence = instances.scores[i].item()
            
            if confidence > confidence_threshold:
                # Prüfe ob es sich um ein Lebensmittel handelt
                if class_id in coco_food_classes:
                    ingredients.append(f"{coco_food_classes[class_id]} ({confidence:.2f})")
        
        return ingredients if ingredients else ["Keine Lebensmittel oder Küchenutensilien erkannt"]
        
    except Exception as e:
        print(f"Detectron2 Fehler: {e}")
        return [f"Detectron2 Verarbeitung fehlgeschlagen: {str(e)}"]

def extract_ingredients_from_text(text):
    """
    Hilfsfunktion: Extrahiere Zutaten aus Textbeschreibung
    """
    # Einfache Keyword-basierte Extraktion
    ingredient_keywords = [
        'tomato', 'tomate', 'zwiebel', 'onion', 'karotte', 'carrot',
        'paprika', 'pepper', 'salat', 'lettuce', 'gurke', 'cucumber',
        'brot', 'bread', 'käse', 'cheese', 'fleisch', 'meat',
        'huhn', 'chicken', 'fisch', 'fish', 'ei', 'egg',
        'milch', 'milk', 'butter', 'öl', 'oil', 'salz', 'salt',
        'zucker', 'sugar', 'pasta', 'nudeln', 'reis', 'rice'
    ]
    
    text_lower = text.lower()
    found_ingredients = []
    
    for keyword in ingredient_keywords:
        if keyword in text_lower:
            # Kapitalisiere ersten Buchstaben
            found_ingredients.append(keyword.capitalize())
    
    return list(set(found_ingredients))  # Entferne Duplikate

# Initialisiere Modelle beim Serverstart
@app.on_event("startup")
async def startup_event():
    initialize_models()

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

@app.post("/analyze_ingredients")
async def analyze_ingredients(
    file: UploadFile = File(...),
    ai_type: str = Form(...)
):
    """
    Endpoint für Zutatenerkennung mit verschiedenen lokalen KI-Modellen
    """
    try:
        # Lese das hochgeladene Bild
        image_data = await file.read()
        
        # Wähle KI-Modell basierend auf Parameter
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
        
        return {
            "ai_type": ai_type,
            "ingredients": ingredients,
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler bei der Bildanalyse: {str(e)}")

@app.get("/available_ai_models")
def get_available_ai_models():
    """
    Gibt verfügbare KI-Modelle zurück
    """
    models_status = {
        "yolo": yolo_model is not None,
        "blip": blip_model is not None and blip_processor is not None,
        "opencv": True,  # OpenCV ist normalerweise immer verfügbar
        "detectron2": DETECTRON2_AVAILABLE and detectron2_model is not None
    }
    
    return {
        "models": models_status,
        "descriptions": {
            "yolo": "YOLO v5 - Objekterkennung für Lebensmittel",
            "blip": "BLIP - Bildbeschreibung und Zutatenerkennung",
            "opencv": "OpenCV - Farb- und Formerkennung",
            "detectron2": "Detectron2 - Erweiterte Objekterkennung und Instanzsegmentierung"
        }
    }

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

def save_contact_to_db(contact_data: ContactForm):
    """
    Speichert die Kontaktanfrage in der Datenbank
    """
    try:
        cursor = db.cursor()
        
        # SQL-Query zum Einfügen der Kontaktdaten
        query = """
        INSERT INTO contact_requests (name, email, subject, message, created_at, status)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        values = (
            contact_data.name,
            contact_data.email,
            contact_data.subject,
            contact_data.message,
            datetime.now(),
            'neu'  # Status für neue Anfragen
        )
        
        cursor.execute(query, values)
        db.commit()
        cursor.close()
        
        return True
        
    except Exception as e:
        print(f"Fehler beim Speichern in der Datenbank: {str(e)}")
        db.rollback()  # Rollback bei Fehlern
        return False

@app.post("/contact")
def submit_contact_form(contact_data: ContactForm):
    """
    Endpoint für das Kontaktformular - speichert in Datenbank
    """
    try:
        # In Datenbank speichern
        saved = save_contact_to_db(contact_data)
        
        if not saved:
            raise HTTPException(status_code=500, detail="Fehler beim Speichern der Kontaktanfrage")
        
        return {
            "status": "success",
            "message": "Kontaktanfrage erfolgreich gespeichert. Wir melden uns bald bei Ihnen!"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Verarbeiten der Anfrage: {str(e)}")

@app.get("/contact-requests")
def get_contact_requests():
    """
    Endpoint um alle Kontaktanfragen abzurufen (für Admin-Bereich)
    """
    try:
        cursor = db.cursor()
        cursor.execute("""
            SELECT id, name, email, subject, message, created_at, status 
            FROM contact_requests 
            ORDER BY created_at DESC
        """)
        
        # Spaltennamen für bessere Lesbarkeit
        columns = ['id', 'name', 'email', 'subject', 'message', 'created_at', 'status']
        result = []
        
        for row in cursor.fetchall():
            row_dict = {}
            for i, value in enumerate(row):
                # Datetime-Objekte zu String konvertieren für JSON-Serialisierung
                if isinstance(value, datetime):
                    row_dict[columns[i]] = value.strftime("%d.%m.%Y %H:%M:%S")
                else:
                    row_dict[columns[i]] = value
            result.append(row_dict)
        
        cursor.close()
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Abrufen der Kontaktanfragen: {str(e)}")

@app.put("/contact-requests/{request_id}/status")
def update_contact_request_status(request_id: int, status_data: StatusUpdate):
    """
    Endpoint um den Status einer Kontaktanfrage zu ändern
    """
    try:
        # Überprüfung der Datenbankverbindung
        if not db.is_connected():
            db.reconnect()
            
        cursor = db.cursor()
        
        # Gültige Status prüfen
        valid_statuses = ['neu', 'in_bearbeitung', 'abgeschlossen']
        if status_data.status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Ungültiger Status. Erlaubt: {valid_statuses}")
        
        cursor.execute(
            "UPDATE contact_requests SET status = %s WHERE id = %s",
            (status_data.status, request_id)
        )
        
        if cursor.rowcount == 0:
            cursor.close()
            raise HTTPException(status_code=404, detail="Kontaktanfrage nicht gefunden")
        
        db.commit()
        cursor.close()
        
        return {
            "status": "success",
            "message": f"Status der Anfrage {request_id} wurde zu '{status_data.status}' geändert"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        try:
            db.rollback()
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Fehler beim Aktualisieren: {str(e)}")
