from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({"status": "ok", "message": "CallPilot API"})

@app.route('/api/login', methods=['POST'])
def login():
    return jsonify({"error": "Not configured yet"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 10000)))
