import mysql.connector
conn = mysql.connector.connect(host="localhost", user="root", password="test")

if conn.is_connected():
    print("Connection succesfully!")
    