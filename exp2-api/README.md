# HostelCare Experiment 2 — Shared REST API with JSON Server and Postman

The complaints in the existing HostelCare website, the Experiment 3 React portal, and Postman use one source of truth: `db.json` in this folder. The API endpoint is `http://localhost:3000/complaints`.

## First-time setup after cloning from GitHub

The local `db.json` is ignored by Git because it contains user-submitted names and emails. From PowerShell, create a clean local database from the sample:

```powershell
cd "D:\my learning\Hostelcare\exp2-api"
npm ci
Copy-Item db.example.json db.json
```

If `db.json` already exists, keep it and skip the copy command.

## Start the shared API

1. Open a terminal in this `exp2-api` folder.
2. Run `npm start` and leave it running. JSON Server serves `db.json` on port 3000.
3. Serve the original HostelCare root folder with VS Code Live Server (or another local web server). Log in through the existing student/admin pages; use the student's **React Portal** link to pass that login identity to the React app.
4. To use the Experiment 3 portal, open a second terminal in `exp3-react` and run `npm run dev`. Keep the API terminal running too.

The student pages show only complaints matching the logged-in student's email. The admin page and Postman can see all complaints. The site and React portal refresh from the API about every two seconds. Existing Experiment 1 complaints stored in the browser are copied to the API the first time the API bridge can read them. API-backed browser cache rows are not re-created if they are deleted from Postman.

Student accounts and passwords remain in the browser's local storage because Experiment 2's REST API is for complaints. Do not enter real passwords into Postman.

## Postman CRUD requests

For write requests, choose **Body → raw → JSON** and send `Content-Type: application/json`.

| Operation | Method | URL | Body |
|---|---|---|---|
| Read all complaints | GET | `http://localhost:3000/complaints` | None |
| Read one complaint | GET | `http://localhost:3000/complaints/1` | None |
| Create a complaint | POST | `http://localhost:3000/complaints` | `{"studentName":"Aarav Deshmukh","studentEmail":"aarav.test@example.com","roomNumber":"A-204","category":"Electrical","priority":"Medium","description":"Ceiling fan is making noise.","date":"2026-10-22","status":"Pending"}` |
| Replace complaint 1 | PUT | `http://localhost:3000/complaints/1` | `{"studentName":"Rahul Patil","studentEmail":"rahul.test@example.com","roomNumber":"C-506","category":"Electrical","priority":"High","description":"Room light and fan are not working.","date":"2026-10-22","status":"In Progress"}` |
| Update only complaint 1 status | PATCH | `http://localhost:3000/complaints/1` | `{"status":"Resolved"}` |
| Delete complaint 1 | DELETE | `http://localhost:3000/complaints/1` | None |

Use the ID returned by POST for later requests if JSON Server assigns a different ID. PUT replaces the entire record, so include every field. PATCH changes only the fields in its body. Postman changes will appear on the website and React portal after their next refresh.

## Adding a future HostelCare experiment

For any later experiment that reads or changes complaints, use the same `http://localhost:3000/complaints` endpoint and existing complaint fields: `studentName`, `studentEmail`, `roomNumber`, `category`, `priority`, `description`, `date`, and `status`. Read complaints from that endpoint and send creates/updates/deletes to it; do not add another complaint list or database. Filter a student's view by the logged-in email, while admin views may show all complaints. Experiment-specific data (for example, static products required by Experiment 3) can remain local to that experiment unless its instructions require an API.

## Practical screenshots

Capture the running JSON Server terminal, the GET response showing complaints, and successful Postman responses for POST, PUT, PATCH, and DELETE. Changes to `db.json` persist when the server restarts; restore sample records manually if you need a clean practical demonstration.
