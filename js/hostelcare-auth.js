(function () {
    const API_BASE = "http://127.0.0.1:5000";
    const TOKEN_KEY = "hostelcareJwtToken";
    const USERS_KEY = "hostelcareUsers";
    const CURRENT_USER_KEY = "hostelcareCurrentUser";

    function makeError(message, status) {
        const error = new Error(message);
        error.status = status || 0;
        return error;
    }

    async function request(path, options) {
        let response;
        try {
            response = await fetch(API_BASE + path, options);
        } catch (error) {
            throw makeError("HostelCare login server is not reachable. Start the Exp-8 server in its own terminal and try again.", 0);
        }

        let body = {};
        try {
            body = await response.json();
        } catch (error) {
            body = {};
        }

        if (!response.ok) {
            throw makeError(body.error || "The request could not be completed.", response.status);
        }
        return body;
    }

    function cleanProfile(profile) {
        return {
            name: String(profile.name || profile.username || "Student").trim(),
            email: String(profile.email || profile.username || "").trim(),
            mobile: String(profile.mobile || "").trim(),
            room: String(profile.room || profile.roomNumber || "").trim()
        };
    }

    function readUsers() {
        try {
            const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
            return Array.isArray(users) ? users : [];
        } catch (error) {
            return [];
        }
    }

    function saveProfile(profile) {
        const clean = cleanProfile(profile);
        if (!clean.email) return clean;
        const users = readUsers();
        const index = users.findIndex((user) =>
            String(user.email || "").trim().toLowerCase() === clean.email.toLowerCase()
        );
        if (index >= 0) {
            users[index] = Object.assign({}, users[index], clean);
            delete users[index].password;
        } else {
            users.push(clean);
        }
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        return clean;
    }

    function removeLegacyPassword(email) {
        const users = readUsers();
        const user = users.find((entry) =>
            String(entry.email || "").trim().toLowerCase() === String(email).trim().toLowerCase()
        );
        if (user && Object.prototype.hasOwnProperty.call(user, "password")) {
            delete user.password;
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }
    }

    async function register(profile) {
        const clean = cleanProfile(profile);
        const result = await request("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: clean.email,
                email: clean.email,
                password: String(profile.password || ""),
                name: clean.name,
                mobile: clean.mobile,
                room: clean.room
            })
        });
        return { resident: cleanProfile(result.resident || clean) };
    }

    async function login(email, password) {
        const cleanEmail = String(email || "").trim();
        let result;
        try {
            result = await request("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: cleanEmail, email: cleanEmail, password: String(password || "") })
            });
        } catch (error) {
            const legacy = readUsers().find((user) =>
                String(user.email || "").trim().toLowerCase() === cleanEmail.toLowerCase() &&
                user.password === password
            );
            if (error.status !== 401 || !legacy) throw error;

            try {
                await register(legacy);
            } catch (registerError) {
                if (registerError.status !== 409) throw registerError;
            }

            result = await request("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: cleanEmail, email: cleanEmail, password: String(password || "") })
            });
            removeLegacyPassword(cleanEmail);
        }

        sessionStorage.setItem(TOKEN_KEY, result.token);
        const dashboard = await getDashboard();
        const resident = cleanProfile(dashboard.resident || result.resident || { email: cleanEmail });
        saveProfile(resident);
        return { token: result.token, resident: resident, dashboard: dashboard };
    }

    async function getDashboard() {
        const token = sessionStorage.getItem(TOKEN_KEY);
        if (!token) throw makeError("Please log in first to open the HostelCare dashboard.", 401);
        return request("/dashboard", {
            method: "GET",
            headers: { Authorization: "Bearer " + token }
        });
    }

    function logout() {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(CURRENT_USER_KEY);
    }

    window.hostelCareAuth = {
        apiBase: API_BASE,
        tokenKey: TOKEN_KEY,
        register: register,
        login: login,
        getDashboard: getDashboard,
        saveProfile: saveProfile,
        logout: logout
    };
})();