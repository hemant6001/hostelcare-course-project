import os
import secrets
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import jwt
from flask import Flask, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)
JWT_SECRET = os.environ.get("HOSTELCARE_JWT_SECRET") or secrets.token_urlsafe(48)
TOKEN_LIFETIME_MINUTES = 30
users_db = {}


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


def public_resident(user):
    return {
        "id": user["id"],
        "username": user["username"],
        "name": user["name"],
        "email": user["email"],
        "mobile": user["mobile"],
        "room": user["room"],
    }


def find_user(username):
    return users_db.get(str(username or "").strip().lower())


@app.get("/health")
def health():
    return jsonify({"service": "HostelCare Exp-8 JWT API", "status": "ok"})


@app.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username") or data.get("email") or "").strip()
    password = str(data.get("password") or "")

    if not username or not password:
        return jsonify({"error": "username and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "password must contain at least 6 characters"}), 400
    if find_user(username):
        return jsonify({"error": "username is already registered"}), 409

    email = str(data.get("email") or username).strip()
    user = {
        "id": str(uuid4()),
        "username": username,
        "name": str(data.get("name") or username).strip(),
        "email": email,
        "mobile": str(data.get("mobile") or "").strip(),
        "room": str(data.get("room") or "").strip(),
        "password_hash": generate_password_hash(password),
    }
    users_db[username.lower()] = user
    return jsonify({
        "message": "HostelCare account registered successfully",
        "resident": public_resident(user),
    }), 201


@app.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username") or data.get("email") or "").strip()
    password = str(data.get("password") or "")
    user = find_user(username)

    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "invalid username or password"}), 401

    expires_at = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_LIFETIME_MINUTES)
    token = jwt.encode(
        {
            "sub": user["username"].lower(),
            "iat": datetime.now(timezone.utc),
            "exp": expires_at,
        },
        JWT_SECRET,
        algorithm="HS256",
    )
    return jsonify({
        "message": "Login successful",
        "token": token,
        "tokenType": "Bearer",
        "expiresIn": TOKEN_LIFETIME_MINUTES * 60,
        "resident": public_resident(user),
    })


def authenticated_user():
    authorization = request.headers.get("Authorization", "")
    scheme, separator, token = authorization.partition(" ")
    if not separator or scheme.lower() != "bearer" or not token.strip():
        return None, (jsonify({"error": "Bearer token is required"}), 401)

    try:
        payload = jwt.decode(token.strip(), JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None, (jsonify({"error": "token has expired; log in again"}), 401)
    except jwt.InvalidTokenError:
        return None, (jsonify({"error": "token is invalid"}), 401)

    user = find_user(payload.get("sub"))
    if not user:
        return None, (jsonify({"error": "account is no longer available; register again"}), 401)
    return user, None


@app.get("/dashboard")
def dashboard():
    user, error_response = authenticated_user()
    if error_response:
        return error_response

    return jsonify({
        "message": "Welcome to the HostelCare maintenance dashboard",
        "resident": public_resident(user),
        "features": [
            "Register hostel maintenance complaints",
            "Track complaint status",
            "View HostelCare resident details",
        ],
    })


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)