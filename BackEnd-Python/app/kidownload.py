# Python-Skript zum Vorab-Download der Modelle
import torch
from transformers import BlipProcessor, BlipForConditionalGeneration

# YOLO v5 herunterladen
yolo_model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)

# BLIP Modell herunterladen
blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

print("Alle Modelle erfolgreich heruntergeladen!")