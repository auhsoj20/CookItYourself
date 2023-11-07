# CookItYourself
Software zum Austausch von Essensrezepten


1. Frontend -> React
2. Backend -> Python with MySQL Database


1. Zu installierende Software

    a. NodeJS

    - https://nodejs.org/en/download/current
    - Windows Installler (.msi)

    b. React-Scripts

    - https://www.npmjs.com/package/react-scripts

    oder

    - Befehl "npm install -g react-scripts"

    c. Python

     - https://www.python.org/downloads/

    d. MySQLConnector Python

    - pip install mysql-connector-python
     - https://pypi.org/project/mysql-connector-python/


Allgemeine Bedienung des Projekts

Projekt starten

1.	CMD/Terminal von Windows/Linux öffnen
2.	Projektpfad für das BackEnd ausfindig machen
    a.	Dieser sieht in einem Beispiel wie folgt aus: "C:\Users\TEST\Documents\CookItYourself\BackEnd-Python\app"
3.	Über das CMD/Terminal Fenster zu dem Verzeichnis wechseln
    a.	cd C:\Users\TEST\Documents\CookItYourself\BackEnd-Python\app
4.	CMD/Terminal Eingabe um das BackEnd zu starten
    a.	python -m uvicorn main:app –reload
5.	Wenn möglich eine zweite Eingabeaufforderung (CMD/Terminal) öffnen
6.	Projektpfad für das FrontEnd ausfindig machen
    a.	Dieser sieht in einem Beispiel wie folgt aus: C:\Users\TEST\Documents\CookItYourself\FrontEnd-React
7.	Über das zweite CMD/Terminal Fenster zu dem Verzeichnis wechseln 
    a.	cd C:\Users\TEST\Documents\CookItYourself\FrontEnd-React
8.	Projekt starten mit folgender Eingabe im CMD/Terminal
    a.	npm start
9.	Projekt sollte nun erfolgreich gestartet werden & im Browser erreichbar sein

Projekt stoppen 

1.	Vorherige Eingabeaufforderungen aus „Projekt starten“ öffnen
2.	Tastenkombination ausführen: STRG + C
3.	Das Projekt sollte nun vollständig gestoppt sein
