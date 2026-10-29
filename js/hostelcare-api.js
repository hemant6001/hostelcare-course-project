// Shared HostelCare complaints data source: JSON Server.
(function () {
    const API_URL = "http://localhost:3000/complaints";
    const STORAGE_KEY = "hostelcareComplaints";
    const REACT_APP_URL = "http://localhost:5173/exp3-react/";
    let refreshInProgress = false;

    function readLocal() {
        try {
            const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            return Array.isArray(value) ? value : [];
        } catch {
            return [];
        }
    }

    function fromApi(item) {
        return {
            id: String(item.id),
            apiId: item.id,
            legacyId: item.legacyId || "",
            userEmail: item.studentEmail || "",
            name: item.studentName || "Student",
            room: item.roomNumber || "",
            category: item.category || "Other",
            priority: item.priority || "Medium",
            description: item.description || "",
            date: item.date || "",
            status: item.status || "Pending"
        };
    }

    function toApi(item) {
        return {
            studentName: item.name || item.studentName || "Student",
            studentEmail: item.userEmail || item.studentEmail || "",
            roomNumber: item.room || item.roomNumber || "",
            category: item.category || "Other",
            priority: item.priority || "Medium",
            description: item.description || "",
            date: item.date || new Date().toISOString().slice(0, 10),
            status: item.status || "Pending"
        };
    }

    function sameComplaint(left, right) {
        return String(left.userEmail || left.studentEmail || "").trim().toLowerCase() ===
                String(right.userEmail || right.studentEmail || "").trim().toLowerCase() &&
            String(left.description || "").trim().toLowerCase() ===
                String(right.description || "").trim().toLowerCase() &&
            String(left.category || "").trim().toLowerCase() ===
                String(right.category || "").trim().toLowerCase();
    }

    async function getApiRows() {
        const response = await fetch(API_URL, { cache: "no-store" });
        if (!response.ok) throw new Error("Could not load HostelCare complaints API");
        return response.json();
    }

    async function sendApiRow(method, url, body) {
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error("HostelCare API request failed");
        return response.status === 204 ? null : response.json();
    }

    async function migrateLegacyRows(rows) {
        // Migrate only old Experiment 1 records. API-backed cache entries include apiId;
        // skipping them prevents a Postman DELETE from being undone on the next refresh.
        const legacyRows = readLocal().filter((item) => !item.apiId && item.description);
        for (const item of legacyRows) {
            const legacyId = String(item.legacyId || item.id || "");
            const alreadyOnApi = rows.some((row) =>
                (legacyId && String(row.legacyId || "") === legacyId) ||
                sameComplaint(row, item)
            );
            if (alreadyOnApi) continue;
            const body = toApi(item);
            if (legacyId) body.legacyId = legacyId;
            rows.push(await sendApiRow("POST", API_URL, body));
        }
        return rows;
    }

    function publish(rows) {
        const normalized = rows.map(fromApi);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        window.hostelCareApiIds = new Set(normalized.map((item) => String(item.id)));
        window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
        if (typeof window.displaySavedComplaints === "function") {
            window.displaySavedComplaints();
        }
        return normalized;
    }

    async function syncFromApi() {
        if (refreshInProgress) return;
        refreshInProgress = true;
        try {
            const rows = await getApiRows();
            publish(await migrateLegacyRows(rows));
        } finally {
            refreshInProgress = false;
        }
    }

    function getCurrentUser() {
        try {
            return JSON.parse(sessionStorage.getItem("hostelcareCurrentUser") || "null");
        } catch {
            return null;
        }
    }

    function shareLoginWithReact() {
        const link = document.getElementById("reactPortalLink");
        if (!link) return;
        link.href = REACT_APP_URL;
        link.target = "_blank";
        link.rel = "noopener";
    }
    function saveRoomToAccount(current, room) {
        current.room = room;
        sessionStorage.setItem("hostelcareCurrentUser", JSON.stringify(current));
        try {
            const users = JSON.parse(localStorage.getItem("hostelcareUsers") || "[]");
            const account = users.find((item) =>
                String(item.email || "").trim().toLowerCase() === current.email.trim().toLowerCase()
            );
            if (account) {
                account.room = room;
                localStorage.setItem("hostelcareUsers", JSON.stringify(users));
            }
        } catch (error) {
            console.error("Could not save the student's room number:", error);
        }
        const loggedInRoom = document.getElementById("loggedInRoom");
        const welcomeRoom = document.getElementById("welcomeRoom");
        if (loggedInRoom) loggedInRoom.textContent = "Room: " + room;
        if (welcomeRoom) welcomeRoom.textContent = room;
        if (window.hostelCareStudents) {
            void window.hostelCareStudents.syncProfile(current);
        }
        shareLoginWithReact();
    }

    function attachStudentSubmit() {
        document.addEventListener("submit", async function (event) {
            const form = event.target;
            if (!form || form.id !== "userComplaintForm") return;
            event.preventDefault();
            event.stopImmediatePropagation();

            const current = getCurrentUser();
            if (!current || !current.email) {
                alert("Please log in again before submitting a complaint.");
                return;
            }

            // These existing Experiment 1 inputs use IDs rather than name attributes.
            const readField = (id) => String(form.querySelector("#" + id)?.value || "").trim();
            const room = readField("room");
            const category = readField("category");
            const priority = readField("priority");
            const description = readField("description");
            if (!room || !category || !priority || !description) {
                alert("Please fill in all complaint fields.");
                return;
            }
            if (room.includes("@")) {
                alert("Please enter a valid room number, for example C-506.");
                form.querySelector("#room")?.focus();
                return;
            }

            const complaint = {
                studentName: current.name || readField("name") || "Student",
                studentEmail: current.email,
                roomNumber: room,
                category,
                priority,
                description,
                date: new Date().toISOString().slice(0, 10),
                status: "Pending"
            };

            let saved;
            try {
                saved = await sendApiRow("POST", API_URL, complaint);
            } catch (error) {
                alert("The complaints server is not running. Start JSON Server and try again.");
                console.error(error);
                return;
            }

            saveRoomToAccount(current, room);
            await syncFromApi().catch((error) => console.error("Complaint saved; refresh will retry:", error));
            form.reset();
            const nameField = form.querySelector("#name");
            const roomField = form.querySelector("#room");
            if (nameField) nameField.value = current.name || "";
            if (roomField) roomField.value = room;
            alert("Complaint registered successfully!\n\nComplaint ID: " + saved.id);
        }, true);
    }

    function attachAdminStatusUpdate() {
        // Capture before admin.js's localStorage-only click handler can run.
        document.addEventListener("click", async function (event) {
            const button = event.target instanceof Element
                ? event.target.closest("#adminComplaintTable .action-btn")
                : null;
            if (!button) return;
            event.preventDefault();
            event.stopImmediatePropagation();

            const row = button.closest("tr");
            const id = row && row.dataset.complaintId;
            if (!id) return;

            const input = prompt("Enter the new status: Pending, In Progress, or Resolved");
            if (input === null) return;
            const status = input.trim().toLowerCase();
            const normalized = status === "pending" ? "Pending" :
                (status === "in progress" || status === "progress") ? "In Progress" :
                status === "resolved" ? "Resolved" : "";
            if (!normalized) {
                alert("Enter Pending, In Progress, or Resolved.");
                return;
            }

            try {
                await sendApiRow("PATCH", `${API_URL}/${encodeURIComponent(id)}`, { status: normalized });
                await syncFromApi().catch((error) => console.error("Status saved; refresh will retry:", error));
                alert("Complaint status updated.");
            } catch (error) {
                alert("The status could not be saved to the complaints server.");
                console.error(error);
            }
        }, true);
    }

    shareLoginWithReact();
    attachStudentSubmit();
    attachAdminStatusUpdate();
    syncFromApi().catch((error) => {
        console.info("HostelCare API is offline; existing local data is shown until it reconnects.", error);
    });
    window.setInterval(() => syncFromApi().catch(() => {}), 2000);
    window.addEventListener("focus", () => syncFromApi().catch(() => {}));
})();

