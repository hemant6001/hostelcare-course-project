# HostelCare Experiment 3 — Connected React Portal

The React portal follows the existing HostelCare flow: home, student registration/login, student dashboard, admin login, and admin dashboard. It reuses the original HostelCare CSS. The Experiment 3 product components and sample data remain in the project as assignment reference files; the active portal opens to HostelCare roles and complaints.

## Start the connected project

1. Start JSON Server from `exp2-api` with `npm start` and keep it running.
2. Start React from `exp3-react` with `npm run dev`.
3. Open `http://localhost:5173/` for the original HostelCare home page. Open `http://localhost:5173/exp3-react/` for the React portal.

The Vite server serves the original site and React portal from one browser origin, so both share student account storage. Student accounts use `hostelcareUsers`; the admin demo login is `admin@hostelcare.com` / `admin123`.

Both dashboards use the Experiment 2 JSON Server API at `http://localhost:3000/complaints` and refresh about every two seconds. Students see only complaints matching their email. Admin sees all complaints. The React student form creates complaints with POST; the admin dashboard updates status with PATCH. Postman changes appear on the next refresh. The original student dashboard's React Portal link opens the app with that logged-in student's details.

## Experiment 4 — State Management and Form Validation

Experiment 4 is integrated into this same HostelCare React portal. HostelCareContext shares the active user, complaints, API connection status, and complaint create/update actions with the student and admin dashboards. Account forms and the complaint form use controlled React state and field-level validation. Complaints continue to use the existing JSON Server API, so the original website and Postman see the same complaint records.

## Experiment 7 — Spring Boot Resident CRUD API

Experiment 7 adds a Spring Boot API for HostelCare residents. Run the API from exp7-spring-api with mvn spring-boot:run; it uses port 8080. Use Postman to create, list, view, replace, partially update, and delete residents at http://localhost:8080/api/students. The original site's admin page and React admin dashboard display the same resident records, and the React admin can add, edit, and delete them.

Resident profiles created by the original site or React registration form are synced to this API when it is running. Existing local accounts are copied to H2 once after each API restart. Passwords stay in browser storage and are not sent to the API.

The Experiment 2 complaints API is still JSON Server at http://localhost:3000/complaints. Complaints and residents are separate data sets: complaints stay on port 3000, residents use port 8080. The Spring API needs JDK 17 or later and Maven 3.6.3 or later. See exp7-spring-api/README.md for Postman request bodies and setup notes.

## React concepts shown

- Functional components and JSX
- Reusable home, access, student dashboard, admin dashboard, status badge, and statistics components
- `useState`, `useEffect`, and `useMemo`
- Conditional rendering for home, login, registration, and dashboards
- `map()` for complaint rows, residents, announcements, and dashboard cards
