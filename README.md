# HostelCare

HostelCare is a student hostel maintenance portal. This repository keeps the original website and the course experiments together so they can be reviewed and run from one project.

## Project parts

- Main website: `index.html`, `user*.html`, `admin*.html`, `css/`, and `js/`
- Experiment 2: `exp2-api/` — JSON Server complaints API and Postman CRUD guide
- Experiment 3: `exp3-react/` — React portal
- Experiment 7: `exp7-spring-api/` — Spring Boot REST API for students and complaints
- Experiment 8: `exp8-jwt/` — Flask JWT authentication API and Postman collection
- Experiment 9: `exp7-spring-api/Dockerfile` — Docker deployment setup for the Spring Boot API
- Run and CRUD walkthrough: `HostelCare-Run-and-CRUD-Demo.pdf`

## Before running

Each experiment has its own README with setup instructions. Install the required tools for that experiment (Node.js, Java/Maven, or Python) before following them.

The JSON Server's local `exp2-api/db.json` is intentionally excluded from Git because it may contain personal or test data. For a fresh setup, copy `exp2-api/db.example.json` to `exp2-api/db.json` and use only sample information.

## Notes

- Local databases and generated folders are excluded from Git.
- The JWT and Postman files are for course demonstration. Do not use demo credentials or development settings for a real deployment.
- The Spring Boot API currently uses an in-memory H2 database for its course demonstration.
