from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import uuid
import os

app = Flask(__name__)
CORS(app, origins=['https://wiland-electrical.vercel.app', 'http://localhost:5173'], supports_credentials=True)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'callpilot-secret-change-in-prod')
jwt = JWTManager(app)

DB_NAME = os.getenv('DATABASE_URL', 'callpilot.db')

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        brand_name TEXT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        subscription_tier TEXT DEFAULT 'starter',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        business_name TEXT NOT NULL,
        contact_name TEXT,
        contact_email TEXT,
        contact_phone TEXT,
        phone_number TEXT,
        greeting_message TEXT,
        voice_personality TEXT DEFAULT 'professional',
        status TEXT DEFAULT 'trial',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    )''')
    conn.commit()
    conn.close()

try:
    init_db()
except:
    pass

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    try:
        tenant_id = str(uuid.uuid4())
        c.execute("INSERT INTO tenants (id, name, brand_name, email, password_hash) VALUES (?, ?, ?, ?, ?)",
                  (tenant_id, data['name'], data.get('brand_name', data['name']), data['email'], 
                   generate_password_hash(data['password'])))
        conn.commit()
        access_token = create_access_token(identity=tenant_id)
        return jsonify({"access_token": access_token, "token_type": "bearer"})
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already registered"}), 400
    finally:
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    c.execute("SELECT id, name, brand_name, email, password_hash FROM tenants WHERE email = ?", (data.get('email'),))
    row = c.fetchone()
    conn.close()
    
    if not row or not check_password_hash(row[4], data.get('password', '')):
        return jsonify({"error": "Invalid credentials"}), 401
    
    access_token = create_access_token(identity=row[0])
    return jsonify({
        "access_token": access_token,
        "token_type": "bearer",
        "tenant": {"id": row[0], "name": row[1], "brand_name": row[2], "email": row[3]}
    })

@app.route('/api/me', methods=['GET'])
@jwt_required()
def get_me():
    tenant_id = get_jwt_identity()
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT id, name, brand_name, email, subscription_tier FROM tenants WHERE id = ?", (tenant_id,))
    row = c.fetchone()
    conn.close()
    return jsonify({"id": row[0], "name": row[1], "brand_name": row[2], "email": row[3], "subscription_tier": row[4]})

@app.route('/api/clients', methods=['GET'])
@jwt_required()
def list_clients():
    tenant_id = get_jwt_identity()
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM clients WHERE tenant_id = ?", (tenant_id,))
    clients = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify(clients)

@app.route('/api/clients', methods=['POST'])
@jwt_required()
def create_client():
    tenant_id = get_jwt_identity()
    data = request.json
    client_id = str(uuid.uuid4())
    
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''INSERT INTO clients (id, tenant_id, business_name, contact_name, contact_email, contact_phone, phone_number, greeting_message, voice_personality)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
              (client_id, tenant_id, data.get('business_name'), data.get('contact_name'), 
               data.get('contact_email'), data.get('contact_phone'), data.get('phone_number'),
               data.get('greeting_message', 'Hello, how can I help?'), 
               data.get('voice_personality', 'professional')))
    conn.commit()
    conn.close()
    return jsonify({"id": client_id, "business_name": data.get('business_name')})

@app.route('/api/clients/<client_id>', methods=['PUT'])
@jwt_required()
def update_client(client_id):
    tenant_id = get_jwt_identity()
    data = request.json
    
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT id FROM clients WHERE id = ? AND tenant_id = ?", (client_id, tenant_id))
    if not c.fetchone():
        conn.close()
        return jsonify({"error": "Client not found"}), 404
    
    fields = []
    values = []
    for key in ['business_name', 'contact_name', 'contact_email', 'contact_phone', 'phone_number', 'greeting_message', 'voice_personality']:
        if key in data:
            fields.append(f"{key} = ?")
            values.append(data[key])
    
    if fields:
        values.append(client_id)
        c.execute(f"UPDATE clients SET {', '.join(fields)} WHERE id = ?", values)
        conn.commit()
    
    conn.close()
    return jsonify({"id": client_id})

@app.route('/api/clients/<client_id>', methods=['DELETE'])
@jwt_required()
def delete_client(client_id):
    tenant_id = get_jwt_identity()
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("DELETE FROM clients WHERE id = ? AND tenant_id = ?", (client_id, tenant_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Client deleted"})

# Vercel entry point

@app.route("/api/admin/users", methods=["GET"])
def list_users():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT id, name, email, brand_name, created_at FROM tenants")
    users = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify(users)

app.run(host='0.0.0.0', port=int(os.getenv('PORT', 10000)))
