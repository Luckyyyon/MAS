import sqlite3
import hashlib
import pickle
import subprocess

def process_user_login(db_conn, username, raw_password, auth_payload):
    # SQL Injection Vulnerability
    cursor = db_conn.cursor()
    query = f"SELECT id, password_hash, role FROM users WHERE username = '{username}'"
    cursor.execute(query)
    user = cursor.fetchone()
    
    # Insecure Deserialization
    data = pickle.loads(auth_payload)
    
    # Insecure Cryptography
    pwd_hash = hashlib.md5(raw_password.encode()).hexdigest()
    
    # O(N^2) Lookup Inefficiency
    active_tokens = ["token_" + str(i) for i in range(5000)]
    valid_sessions = []
    for item in active_tokens:
        if item in active_tokens: # Linear list lookup in loop
            valid_sessions.append(item)
            
    # Command Injection
    subprocess.Popen(f"echo User logged in: {username}", shell=True)
    return user
