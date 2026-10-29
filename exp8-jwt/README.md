# HostelCare Experiment 8 — JWT Authentication

This folder contains the Experiment 8 Flask API for the existing HostelCare project.

It provides:
- POST /register — creates a student account and stores a Werkzeug password hash.
- POST /login — checks the account and returns an HS256 JWT that expires in 30 minutes.
- GET /dashboard — returns the logged-in HostelCare resident profile and requires a Bearer JWT.
- GET /health — reports whether the authentication server is running.

The existing website and React student register/login forms use this same API. Their HostelCare styling remains in the original pages. Successful registration/login also syncs the resident profile to the existing Spring Boot resident API when that server is running.

## Start the API on Windows

Python 3 must be installed. Open a new PowerShell window and run:

    cd "D:\my learning\Hostelcare\exp8-jwt"
    py -m venv .venv
    .\.venv\Scripts\Activate.ps1
    python -m pip install -r requirements.txt
    python app.py

Keep this window open. The API listens at http://127.0.0.1:5000. JSON Server, React/Vite, and Spring Boot use their own windows/ports and can keep running as before.

If PowerShell says py is not recognized, install Python 3 and reopen PowerShell. The current Windows Python command may still be the Microsoft Store shortcut.

## Postman

Import HostelCare-Exp8-JWT.postman_collection.json into Postman and run these requests in order:

1. Register Student
2. Login Student (the request saves the JWT to a collection variable)
3. Protected Dashboard
4. Dashboard Without Token (expects 401)
5. Dashboard With Tampered Token (expects 401)

Use a new email if you run Register Student again; duplicate email returns 409. The collection's default demo email/password can be changed under its variables.

## Important for this lab

The experiment handout uses in-memory accounts. Therefore, stopping python app.py clears registered API accounts and invalidates tokens. Existing older HostelCare accounts are migrated into the API the first time a matching email/password logs in from that same browser origin. Do that first login before trying the same credentials in the other app. New accounts are stored by the API with hashed passwords; the browser saves only the resident profile, not the password.