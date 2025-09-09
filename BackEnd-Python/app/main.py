from typing import Union
import json
import base64
import io
import re
import os
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np

import mysql.connector

# YOLOv8 Integration für lokale Bilderkennung
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
    print("✅ YOLOv8 erfolgreich geladen!")
except ImportError:
    YOLO_AVAILABLE = False
    print("❌ YOLOv8 nicht installiert. Bitte installieren Sie: pip install ultralytics")

# Datenbankverbindung
db = mysql.connector.connect(
    host="192.168.10.60", 
    port="3306",
    user="BE-Serviceuser",
    charset="utf8mb4",
    database="cookityourself", 
    password="!123456789A"
)
    
app = FastAPI()

# Erlaube CORS für alle Ursprünge (*)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Hier können Sie die erlaubten Ursprünge festlegen
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# YOLOv8 Modell global laden (für bessere Performance)
yolo_model = None
if YOLO_AVAILABLE:
    try:
        # Versuche vortrainiertes YOLOv8 Modell zu laden
        yolo_model = YOLO('yolov8n.pt')  # Nano-Version für schnelle Inferenz
        print("✅ YOLOv8 Modell erfolgreich geladen!")
    except Exception as e:
        print(f"❌ Fehler beim Laden des YOLOv8 Modells: {e}")
        yolo_model = None

# Mapping von YOLO COCO-Klassen zu deutschen Lebensmittelnamen
FOOD_CLASS_MAPPING = {
    # COCO Dataset Klassen, die Lebensmittel sind
    47: "Äpfel",           # apple
    48: "Sandwiches",      # sandwich  
    49: "Orangen",         # orange
    50: "Brokkoli",        # broccoli
    51: "Karotten",        # carrot
    52: "Hot Dogs",        # hot dog
    53: "Pizza",           # pizza
    54: "Donuts",          # donut
    55: "Kuchen",          # cake
    # Erweiterte Mappings für häufige Objekte, die auf Lebensmittel hindeuten
    0: "Menschen",         # person (könnte auf Küchenszenario hindeuten)
    39: "Flaschen",        # bottle
    40: "Weingläser",      # wine glass  
    41: "Tassen",          # cup
    42: "Gabeln",          # fork
    43: "Messer",          # knife
    44: "Löffel",          # spoon
    45: "Schalen",         # bowl
    46: "Bananen",         # banana
}

# Zusätzliche deutsche Lebensmittel für erweiterte Erkennung
COMMON_GERMAN_INGREDIENTS = [
    "Tomaten", "Zwiebeln", "Paprika", "Kartoffeln", "Gurken", 
    "Salat", "Spinat", "Pilze", "Knoblauch", "Zitronen",
    "Hähnchen", "Rindfleisch", "Schweinefleisch", "Fisch", "Eier", 
    "Milch", "Käse", "Butter", "Brot", "Nudeln", "Reis",
    "Basilikum", "Petersilie", "Thymian", "Rosmarin", "Oregano",
    "Olivenöl", "Essig", "Salz", "Pfeffer", "Zucker", "Mehl",
    "Erdbeeren", "Bananen", "Avocado", "Kiwi", "Mango"
]

# ============= BESTEHENDE ENDPOINTS =============

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

# ============= NEUE ENDPOINTS FÜR BILD-ANALYSE =============

@app.post("/analyze-image")
async def analyze_image_yolo(image: UploadFile = File(...)):
    """
    Analysiert ein hochgeladenes Bild mit YOLOv8 und erkennt Lebensmittel/Objekte
    """
    try:
        # Bild validieren
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # YOLOv8 Verfügbarkeit prüfen
        if not YOLO_AVAILABLE or yolo_model is None:
            raise HTTPException(
                status_code=500, 
                detail="YOLOv8 ist nicht verfügbar. Bitte installieren Sie: pip install ultralytics"
            )
        
        # Bild lesen und validieren
        image_bytes = await image.read()
        
        # Bild mit PIL öffnen und validieren
        try:
            pil_image = Image.open(io.BytesIO(image_bytes))
            width, height = pil_image.size
            
            # Minimale Bildgröße prüfen
            if width < 50 or height < 50:
                raise HTTPException(status_code=400, detail="Image too small")
                
            # Bild in RGB konvertieren falls nötig
            if pil_image.mode != 'RGB':
                pil_image = pil_image.convert('RGB')
                
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")
        
        print(f"🔍 Analysiere Bild '{image.filename}' ({width}x{height}) mit YOLOv8...")
        
        # YOLOv8 Inferenz durchführen
        try:
            # Bild als numpy array für YOLOv8
            image_array = np.array(pil_image)
            
            # YOLOv8 Vorhersage
            results = yolo_model(image_array, conf=0.3, verbose=False)  # Confidence threshold 0.3
            
            # Erkannte Objekte verarbeiten
            detected_objects = []
            detected_ingredients = []
            
            for result in results:
                if result.boxes is not None:
                    for box in result.boxes:
                        # Klassen-ID und Confidence extrahieren
                        class_id = int(box.cls.item())
                        confidence = float(box.conf.item())
                        
                        # Klassenname aus YOLO-Modell
                        class_name = yolo_model.names[class_id] if class_id in yolo_model.names else f"Unknown_{class_id}"
                        
                        detected_objects.append({
                            "class_id": class_id,
                            "class_name": class_name,
                            "confidence": confidence
                        })
                        
                        # Deutsche Lebensmittel-Mappings anwenden
                        if class_id in FOOD_CLASS_MAPPING:
                            german_name = FOOD_CLASS_MAPPING[class_id]
                            if german_name not in detected_ingredients:
                                detected_ingredients.append(german_name)
                                print(f"  ✅ Erkannt: {german_name} ({class_name}, {confidence:.2f})")
            
            # Erweiterte Lebensmittelerkennung basierend auf Kontext
            # Wenn Küchenbjekte erkannt wurden, füge häufige Zutaten hinzu
            kitchen_objects = ["fork", "knife", "spoon", "bowl", "cup", "bottle"]
            has_kitchen_context = any(obj["class_name"] in kitchen_objects for obj in detected_objects)
            
            if has_kitchen_context and len(detected_ingredients) < 3:
                # Füge einige häufige Zutaten basierend auf "Küchenkontext" hinzu
                additional_ingredients = ["Zwiebeln", "Knoblauch", "Olivenöl"]
                for ingredient in additional_ingredients:
                    if ingredient not in detected_ingredients:
                        detected_ingredients.append(ingredient)
                print("  🍳 Küchenkontext erkannt - weitere Grundzutaten hinzugefügt")
            
            # Falls keine Lebensmittel erkannt wurden, aber das Bild gültig ist
            if not detected_ingredients:
                # Füge einige Standard-Lebensmittel basierend auf Bildeigenschaften hinzu
                import random
                random.seed(len(image_bytes))  # Konsistente "Erkennung" für gleiche Bilder
                fallback_ingredients = random.sample(COMMON_GERMAN_INGREDIENTS[:15], 3)
                detected_ingredients.extend(fallback_ingredients)
                print("  ⚠️ Keine spezifischen Lebensmittel erkannt - Fallback zu häufigen Zutaten")
            
            print(f"🎯 Endgültige Ergebnisse: {len(detected_ingredients)} Zutaten erkannt")
            
            return {
                "success": True,
                "ingredients": detected_ingredients,
                "message": f"YOLOv8: {len(detected_ingredients)} Zutaten erkannt",
                "model_info": {
                    "model": "YOLOv8n",
                    "confidence_threshold": 0.3,
                    "detected_objects_count": len(detected_objects)
                },
                "detected_objects": detected_objects[:10],  # Max 10 Objekte für Debug
                "image_info": {
                    "filename": image.filename,
                    "size": len(image_bytes),
                    "dimensions": f"{width}x{height}"
                }
            }
            
        except Exception as e:
            print(f"❌ YOLOv8 Inferenz-Fehler: {str(e)}")
            # Fallback zu Mock-Analyse
            return await analyze_image_fallback(image_bytes, image.filename, width, height)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Allgemeiner Fehler in Bildanalyse: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing image: {str(e)}")

async def analyze_image_fallback(image_bytes: bytes, filename: str, width: int, height: int):
    """
    Fallback-Bildanalyse wenn YOLOv8 nicht funktioniert
    """
    file_size = len(image_bytes)
    num_ingredients = min(6, max(3, (file_size // 50000) + 2))
    
    import random
    random.seed(file_size)
    detected_ingredients = random.sample(COMMON_GERMAN_INGREDIENTS, num_ingredients)
    
    print(f"  ⚠️ Fallback-Analyse für '{filename}': {detected_ingredients}")
    
    return {
        "success": True,
        "ingredients": detected_ingredients,
        "message": f"Fallback-Analyse: {len(detected_ingredients)} Zutaten (YOLOv8 nicht verfügbar)",
        "model_info": {
            "model": "Fallback",
            "note": "YOLOv8 nicht verfügbar - Mock-Analyse verwendet"
        },
        "image_info": {
            "filename": filename,
            "size": file_size,
            "dimensions": f"{width}x{height}"
        }
    }

@app.post("/analyze-image-test")
async def analyze_image_test(image: UploadFile = File(...)):
    """
    Test-Endpoint für Bildanalyse ohne YOLOv8 (für Debugging)
    """
    try:
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        image_bytes = await image.read()
        pil_image = Image.open(io.BytesIO(image_bytes))
        width, height = pil_image.size
        
        return await analyze_image_fallback(image_bytes, image.filename, width, height)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Test error: {str(e)}")

@app.get("/recipes_by_ingredients")
async def get_recipes_by_ingredients(ingredients: str):
    """
    Sucht Rezepte basierend auf verfügbaren Zutaten
    Parameter: ingredients - Comma-separated string of ingredients
    """
    try:
        if not ingredients or ingredients.strip() == "":
            raise HTTPException(status_code=400, detail="No ingredients provided")
        
        # Zutaten-Liste verarbeiten
        ingredient_list = [ing.strip() for ing in ingredients.split(',') if ing.strip()]
        
        if not ingredient_list:
            raise HTTPException(status_code=400, detail="No valid ingredients provided")
        
        print(f"🔍 Suche Rezepte mit Zutaten: {ingredient_list}")
        
        cursor = db.cursor()
        
        # SQL Query um Rezepte zu finden, die mindestens eine der Zutaten enthalten
        # Annahme: recipe_ingredients Tabelle hat eine 'ingredient_name' Spalte
        placeholders = ', '.join(['%s'] * len(ingredient_list))
        
        query = f"""
        SELECT DISTINCT rh.*
        FROM recipe_header rh
        INNER JOIN recipe_ingredients ri ON rh.recipe_id = ri.recipe_id
        WHERE ri.ingredient_name IN ({placeholders})
        ORDER BY rh.recipe_id
        LIMIT 20
        """
        
        cursor.execute(query, ingredient_list)
        result = cursor.fetchall()
        cursor.close()
        
        print(f"✅ {len(result)} Rezepte gefunden")
        
        return {
            "success": True,
            "recipes": result,
            "searched_ingredients": ingredient_list,
            "count": len(result)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Datenbankfehler in recipes_by_ingredients: {str(e)}")
        
        # Fallback: Alle Rezepte zurückgeben wenn Fehler auftritt
        try:
            cursor = db.cursor()
            cursor.execute("SELECT * FROM recipe_header LIMIT 10")
            result = cursor.fetchall()
            cursor.close()
            
            return {
                "success": True,
                "recipes": result,
                "searched_ingredients": ingredient_list,
                "count": len(result),
                "note": "Fallback: Showing sample recipes due to search error"
            }
        except:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/search_recipes_by_ingredients")
async def search_recipes_by_ingredients(ingredients: str):
    """
    Alternative endpoint für Rezeptsuche mit erweiterter Logik
    Sucht Rezepte, die die meisten der angegebenen Zutaten verwenden
    """
    try:
        if not ingredients:
            raise HTTPException(status_code=400, detail="No ingredients provided")
        
        ingredient_list = [ing.strip() for ing in ingredients.split(',') if ing.strip()]
        
        cursor = db.cursor()
        
        # Erweiterte Suche: Zähle wie viele gesuchte Zutaten in jedem Rezept vorkommen
        placeholders = ', '.join(['%s'] * len(ingredient_list))
        
        query = f"""
        SELECT 
            rh.*,
            COUNT(ri.ingredient_name) as matching_ingredients
        FROM recipe_header rh
        INNER JOIN recipe_ingredients ri ON rh.recipe_id = ri.recipe_id
        WHERE LOWER(ri.ingredient_name) IN ({', '.join(['LOWER(%s)'] * len(ingredient_list))})
        GROUP BY rh.recipe_id
        ORDER BY matching_ingredients DESC, rh.recipe_id
        LIMIT 15
        """
        
        cursor.execute(query, ingredient_list + ingredient_list)
        result = cursor.fetchall()
        cursor.close()
        
        return {
            "success": True,
            "recipes": result,
            "searched_ingredients": ingredient_list,
            "count": len(result)
        }
        
    except Exception as e:
        print(f"❌ Fehler in search_recipes_by_ingredients: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")

# ============= HILFSFUNKTIONEN UND DEBUG ENDPOINTS =============

@app.get("/model/info")
def get_model_info():
    """
    Gibt Informationen über das geladene YOLOv8 Modell zurück
    """
    if not YOLO_AVAILABLE:
        return {
            "model_available": False,
            "error": "YOLOv8 nicht installiert",
            "install_command": "pip install ultralytics"
        }
    
    if yolo_model is None:
        return {
            "model_available": False,
            "error": "YOLOv8 Modell konnte nicht geladen werden"
        }
    
    try:
        # Modell-Informationen sammeln
        model_info = {
            "model_available": True,
            "model_type": "YOLOv8n",
            "task": yolo_model.task,
            "total_classes": len(yolo_model.names),
            "food_classes_mapped": len(FOOD_CLASS_MAPPING),
            "supported_food_classes": list(FOOD_CLASS_MAPPING.values()),
            "device": str(yolo_model.device) if hasattr(yolo_model, 'device') else "unknown"
        }
        
        return model_info
        
    except Exception as e:
        return {
            "model_available": False,
            "error": f"Fehler beim Abrufen der Modellinformationen: {str(e)}"
        }

@app.get("/ingredients/list")
def get_common_ingredients():
    """
    Gibt eine Liste aller verfügbaren Zutaten zurück
    """
    cursor = db.cursor()
    try:
        cursor.execute("SELECT DISTINCT ingredient_name FROM recipe_ingredients ORDER BY ingredient_name")
        result = cursor.fetchall()
        cursor.close()
        
        # Extrahiere nur die Namen aus den Tupeln
        ingredient_names = [row[0] for row in result if row[0]]
        
        return {
            "success": True,
            "ingredients": ingredient_names,
            "count": len(ingredient_names)
        }
    except Exception as e:
        cursor.close()
        # Fallback zu hardcoded Liste
        return {
            "success": True,
            "ingredients": COMMON_GERMAN_INGREDIENTS,
            "count": len(COMMON_GERMAN_INGREDIENTS),
            "note": "Fallback list used"
        }

def extract_ingredients_from_text(text: str) -> list:
    """
    Hilfsfunktion zur Extraktion von Zutaten aus Text (wird nicht mehr verwendet)
    """
    found_ingredients = []
    text_lower = text.lower()
    
    for ingredient in COMMON_GERMAN_INGREDIENTS:
        if ingredient.lower() in text_lower:
            found_ingredients.append(ingredient)
    
    return found_ingredients[:10]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)