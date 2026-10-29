// Shared Spring Boot API for HostelCare resident records (Experiment 7).
(function () {
    const BASE_URL = "http://localhost:8080/api/students";
    const HEALTH_URL = "http://localhost:8080/api/health";

    async function request(url, options) {
        const response = await fetch(url, options || { cache: "no-store" });
        if (!response.ok) {
            const error = new Error("Spring Boot student API returned " + response.status);
            error.status = response.status;
            throw error;
        }
        if (response.status === 204) return null;
        if (response.status === 200 && options && options.method === "DELETE") return null;
        return response.json();
    }

    function profileFor(user) {
        return {
            name: String(user.name || "Student").trim(),
            email: String(user.email || "").trim(),
            course: String(user.course || "Hostel Resident").trim(),
            roomNumber: String(user.roomNumber || user.room || "").trim(),
            mobile: String(user.mobile || "").trim()
        };
    }

    async function list() {
        return request(BASE_URL, { cache: "no-store" });
    }

    async function create(student) {
        return request(BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profileFor(student))
        });
    }

    async function update(id, student) {
        return request(BASE_URL + "/" + encodeURIComponent(id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profileFor(student))
        });
    }

    async function remove(id) {
        return request(BASE_URL + "/" + encodeURIComponent(id), { method: "DELETE" });
    }

    async function upsertProfile(user) {
        const profile = profileFor(user);
        if (!profile.email) return false;
        const students = await list();
        const existing = students.find((student) =>
            String(student.email || "").trim().toLowerCase() === profile.email.toLowerCase()
        );
        if (existing) {
            const merged = { ...existing, ...profile };
            if (!user.course && existing.course) merged.course = existing.course;
            if (!user.mobile && existing.mobile) merged.mobile = existing.mobile;
            return update(existing.id, merged);
        }
        return create(profile);
    }

    async function syncProfile(user) {
        try {
            return Boolean(await upsertProfile(user));
        } catch (error) {
            console.info("HostelCare profile remains saved locally; Spring Boot API is unavailable.", error);
            return false;
        }
    }

    function readLocalUsers() {
        try {
            const users = JSON.parse(localStorage.getItem("hostelcareUsers") || "[]");
            return Array.isArray(users) ? users : [];
        } catch {
            return [];
        }
    }

    async function syncLocalAccountsForCurrentServer() {
        try {
            const health = await request(HEALTH_URL, { cache: "no-store" });
            if (!health.instanceId) return false;

            const students = await list();
            let allSynced = true;
            for (const user of readLocalUsers()) {
                const profile = profileFor(user);
                if (!profile.email) {
                    allSynced = false;
                    continue;
                }

                const alreadySaved = students.some((student) =>
                    String(student.email || "").trim().toLowerCase() === profile.email.toLowerCase()
                );
                if (alreadySaved) continue;

                try {
                    students.push(await create(profile));
                } catch (error) {
                    allSynced = false;
                    console.info("Could not sync one saved HostelCare account.", error);
                }
            }
            return allSynced;
        } catch (error) {
            return false;
        }
    }

    function initials(name) {
        return String(name || "Student").trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
    }

    function renderSiteResidents(target, students) {
        target.replaceChildren();
        if (!students.length) {
            const empty = document.createElement("p");
            empty.className = "placeholder";
            empty.textContent = "No resident records yet.";
            target.appendChild(empty);
            return;
        }
        students.forEach((student) => {
            const row = document.createElement("div");
            row.className = "resident";
            const avatar = document.createElement("span");
            avatar.textContent = initials(student.name);
            const details = document.createElement("div");
            const name = document.createElement("strong");
            name.textContent = student.name || "Student";
            const metadata = document.createElement("small");
            metadata.textContent = "Room " + (student.roomNumber || "Not assigned");
            const course = document.createElement("b");
            course.textContent = student.mobile || "Resident";
            details.append(name, metadata);
            row.append(avatar, details, course);
            target.appendChild(row);
        });
    }

    window.hostelCareStudents = {
        baseUrl: BASE_URL,
        list,
        create,
        update,
        remove,
        syncProfile,
        syncLocalAccountsForCurrentServer
    };

    const siteList = document.getElementById("hostelResidents");
    const siteStatus = document.getElementById("hostelResidentsStatus");
    if (siteList) {
        let lastSyncSucceeded = false;
        let refreshing = false;
        async function refreshResidents() {
            if (refreshing) return;
            refreshing = true;
            try {
                if (!lastSyncSucceeded) lastSyncSucceeded = await syncLocalAccountsForCurrentServer();
                const students = await list();
                renderSiteResidents(siteList, students);
                if (siteStatus) {
                    siteStatus.textContent = "Live · Spring Boot resident API connected";
                    siteStatus.classList.add("connected");
                }
            } catch (error) {
                if (siteStatus) {
                    siteStatus.textContent = "Spring Boot API offline · Start the Experiment 7 server";
                    siteStatus.classList.remove("connected");
                }
            } finally {
                refreshing = false;
            }
        }
        refreshResidents();
        window.setInterval(refreshResidents, 2000);
    }
})();
