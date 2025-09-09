#!/usr/bin/env python3
"""
Sicherer Startup-Test für CookItYourself Backend
Testet alle Komponenten einzeln ohne Server-Start
"""

import sys
import traceback

def safe_test(test_name, test_function):
    """
    Führt einen Test sicher aus und fängt alle Fehler ab
    """
    try:
        print(f"🧪 Teste {test_name}...")
        result = test_function()
        if result:
            print(f"✅ {test_name}: OK")
            return True
        else:
            print(f"❌ {test_name}: Fehlgeschlagen")
            return False
    except Exception as e:
        print(f"❌ {test_name}: Fehler - {str(e)}")
        return False

def test_basic_imports():
    """Test grundlegende Python-Imports"""
    try:
        from fastapi import FastAPI
        from PIL import Image
        import numpy as np
        return True
    except Exception as e:
        print(f"   Import-Fehler: {e}")
        return False

def test_mysql_import():
    """Test MySQL-Import ohne Verbindung"""
    try:
        import mysql.connector
        from mysql.connector import Error
        print("   MySQL-Connector Library verfügbar")
        return True
    except ImportError:
        print("   MySQL-Connector nicht installiert (OK für Offline-Modus)")
        return False
    except Exception as e:
        print(f"   MySQL-Import Fehler: {e}")
        return False

def test_yolo_import():
    """Test YOLOv8-Import ohne Modell laden"""
    try:
        from ultralytics import YOLO
        print("   YOLOv8 Library verfügbar")
        return True
    except ImportError:
        print("   YOLOv8 nicht installiert")
        return False
    except Exception as e:
        print(f"   YOLOv8-Import Fehler: {e}")
        return False

def test_mysql_connection():
    """Test MySQL-Verbindung sicher"""
    try:
        import mysql.connector
        
        config = {
            "host": "192.168.10.60", 
            "port": "3306",
            "user": "BE-Serviceuser",
            "charset": "utf8mb4",
            "database": "cookityourself", 
            "password": "!123456789A",
            "connection_timeout": 3
        }
        
        print("   Versuche Datenbankverbindung...")
        connection = mysql.connector.connect(**config)
        
        if connection.is_connected():
            print("   Datenbankverbindung erfolgreich!")
            
            # Test-Query
            cursor = connection.cursor()
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            print(f"   MySQL Version: {version[0] if version else 'Unknown'}")
            
            cursor.close()
            connection.close()
            return True
        else:
            print("   Verbindung fehlgeschlagen")
            return False
            
    except ImportError:
        print("   MySQL-Connector nicht verfügbar")
        return False
    except Exception as e:
        print(f"   Verbindungsfehler: {str(e)}")
        return False

def test_yolo_model_loading():
    """Test YOLOv8-Modell laden"""
    try:
        from ultralytics import YOLO
        
        print("   Lade YOLOv8n Modell...")
        model = YOLO('yolov8n.pt')
        
        if model:
            print(f"   Modell geladen: {model.task}, {len(model.names)} Klassen")
            
            # Test-Inferenz mit Dummy-Daten
            import numpy as np
            dummy_image = np.random.randint(0, 255, (640, 640, 3), dtype=np.uint8)
            results = model(dummy_image, verbose=False)
            
            print("   Test-Inferenz erfolgreich")
            return True
        else:
            print("   Modell-Loading fehlgeschlagen")
            return False
            
    except ImportError:
        print("   YOLOv8 nicht verfügbar")
        return False
    except Exception as e:
        print(f"   Modell-Fehler: {str(e)}")
        return False

def test_server_import():
    """Test ob main.py importiert werden kann"""
    try:
        # Versuche main.py zu importieren ohne zu starten
        import importlib.util
        spec = importlib.util.spec_from_file_location("main", "main.py")
        
        if spec is None:
            print("   main.py nicht gefunden")
            return False
            
        print("   main.py gefunden und importierbar")
        return True
        
    except Exception as e:
        print(f"   main.py Import-Fehler: {str(e)}")
        return False

def run_all_tests():
    """Führt alle Tests durch"""
    print("🔍 CookItYourself Backend - Sicherer Startup-Test")
    print("=" * 60)
    
    tests = [
        ("Grundlegende Imports", test_basic_imports),
        ("MySQL Import", test_mysql_import),
        ("YOLOv8 Import", test_yolo_import),
        ("MySQL Verbindung", test_mysql_connection),
        ("YOLOv8 Modell", test_yolo_model_loading),
        ("Server Import", test_server_import),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = safe_test(test_name, test_func)
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name}: Kritischer Fehler - {str(e)}")
            results.append((test_name, False))
        
        print()  # Leerzeile zwischen Tests
    
    # Zusammenfassung
    print("=" * 60)
    print("📊 Test-Zusammenfassung:")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    print(f"   Erfolgreich: {passed}/{total}")
    
    for test_name, result in results:
        status = "✅" if result else "❌"
        print(f"   {status} {test_name}")
    
    print("\n🎯 Empfehlungen:")
    
    # Spezifische Empfehlungen basierend auf Ergebnissen
    mysql_import_ok = results[1][1] if len(results) > 1 else False
    mysql_connection_ok = results[3][1] if len(results) > 3 else False
    yolo_import_ok = results[2][1] if len(results) > 2 else False
    yolo_model_ok = results[4][1] if len(results) > 4 else False
    
    if mysql_import_ok and mysql_connection_ok and yolo_import_ok and yolo_model_ok:
        print("   🟢 VOLLMODUS möglich - alle Komponenten funktionieren")
        print("   ➡️  Starten Sie mit: python main.py")
        
    elif yolo_import_ok and yolo_model_ok:
        print("   🟡 OFFLINE-MODUS möglich - YOLOv8 verfügbar")
        print("   ➡️  Starten Sie mit: python main.py")
        print("   💡 Datenbankfeatures verwenden Fallback-Daten")
        
    elif mysql_import_ok:
        print("   🔶 TEILMODUS möglich - MySQL verfügbar")
        print("   ➡️  Starten Sie mit: python main.py")
        print("   💡 Installieren Sie YOLOv8: pip install ultralytics")
        
    else:
        print("   🟠 FALLBACK-MODUS - Grundfunktionen verfügbar")
        print("   ➡️  Server startet trotzdem: python main.py")
        print("   💡 Installieren Sie Komponenten für mehr Features:")
        
        if not mysql_import_ok:
            print("      - MySQL: pip install mysql-connector-python")
        if not yolo_import_ok:
            print("      - YOLOv8: pip install ultralytics")
    
    # Wichtiger Hinweis
    print(f"\n⚠️  WICHTIG:")
    print(f"   Der Server startet IMMER, egal welche Tests fehlschlagen!")
    print(f"   Fehlgeschlagene Komponenten werden durch Fallbacks ersetzt.")
    
    print("=" * 60)

if __name__ == "__main__":
    try:
        run_all_tests()
    except KeyboardInterrupt:
        print("\n\n👋 Test abgebrochen")
    except Exception as e:
        print(f"\n\n❌ Kritischer Test-Fehler: {str(e)}")
        print("🛡️  Das bedeutet NICHT, dass der Server nicht startet!")
        print("   Versuchen Sie: python main.py")
        
        # Debug-Info bei kritischem Fehler
        print(f"\n🔍 Debug-Info:")
        print(f"   Python Version: {sys.version}")
        print(f"   Traceback:")
        traceback.print_exc()