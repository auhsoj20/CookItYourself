import mysql.connector

conn = mysql.connector.connect(
    host="localhost", 
    port="3306",
    user="root",
    charset="utf8mb4", 
    password="")

if conn.is_connected():
    print("Connection succesfully!")
    