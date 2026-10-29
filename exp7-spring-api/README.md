# HostelCare Experiment 7 — Spring Boot CRUD REST API

This experiment adds a Spring Boot API for HostelCare resident profiles. It follows the Student CRUD exercise from the Experiment 7 handout and connects resident data to the original HostelCare site and the React portal.

The API supports these Postman requests:

| Method | URL | Purpose |
| --- | --- | --- |
| POST | http://localhost:8080/api/students | Add a resident |
| GET | http://localhost:8080/api/students | List all residents |
| GET | http://localhost:8080/api/students/1 | Find one resident by ID |
| PUT | http://localhost:8080/api/students/1 | Replace a resident |
| PATCH | http://localhost:8080/api/students/1 | Change selected resident fields |
| DELETE | http://localhost:8080/api/students/1 | Delete a resident |
| GET | http://localhost:8080/api/health | Check that the API is running |

In Postman, choose the method and URL, then select Send. POST should return 201 and the saved resident with an ID. GET, PUT, PATCH, and DELETE should return 200 when successful. A missing ID returns 404. Use the ID returned by POST in the other requests.

For POST and PUT, choose Body → raw → JSON in Postman and send:

    {
      "name": "Aarav Deshmukh",
      "email": "aarav@example.com",
      "course": "Computer Engineering",
      "roomNumber": "A-204",
      "mobile": "9876543210"
    }

For PATCH, send only the fields to change, for example:

    {
      "roomNumber": "A-205"
    }

Use GET to confirm the updated values. After DELETE, request that same ID with GET; it should return 404.

## Start the API

Install a JDK version 17 or later and Apache Maven version 3.6.3 or later. Open a terminal in this folder and run:

    mvn spring-boot:run

Keep that terminal open while using the site or React portal. The resident API runs on port 8080.

The complaints API remains the Experiment 2 JSON Server at http://localhost:3000/complaints. Start it as before from exp2-api. The React portal remains on port 5173. These services use separate ports and separate data: resident records use Spring Boot, while complaints use JSON Server.

The original site and React portal show resident records from the Spring Boot API. Registering a resident in either portal also syncs the resident profile to the API when it is available. Passwords stay in the browser account storage and are never sent to this API. Changes made through Postman or the React admin resident form appear in the original site's admin resident list.

The API uses an in-memory H2 database. Its records clear when the Spring Boot server restarts. Existing browser accounts can be copied back into the API after a restart so those users can still log in; Postman deletions remain deleted until the server is restarted.

H2 Console: http://localhost:8080/h2-console

JDBC URL: jdbc:h2:mem:hostelcare_students

Username: sa

Password: leave blank

## Spring Boot complaint routes

The Spring Boot API also exposes the same complaints stored by the Experiment 2 JSON Server. It forwards CRUD requests to that shared data, so the site, React portal, Postman on port 3000, and these Spring Boot routes see the same complaint changes.

Keep both JSON Server (port 3000) and Spring Boot (port 8080) running.

| Method | URL | Purpose |
| --- | --- | --- |
| GET | http://localhost:8080/api/complaints | List all complaints |
| GET | http://localhost:8080/api/complaints/{id} | Get one complaint |
| POST | http://localhost:8080/api/complaints | Add a complaint |
| PUT | http://localhost:8080/api/complaints/{id} | Replace a complaint |
| PATCH | http://localhost:8080/api/complaints/{id} | Change selected fields |
| DELETE | http://localhost:8080/api/complaints/{id} | Delete a complaint |
