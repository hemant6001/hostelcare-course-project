// =============================================
// HostelCare - Student Dashboard JavaScript
// =============================================


// =============================================
// 1. Account Helper Functions
// =============================================

function getRegisteredUsers() {
    try {
        const users = JSON.parse(
            localStorage.getItem("hostelcareUsers") || "[]"
        );

        return Array.isArray(users) ? users : [];

    } catch (error) {
        console.error("Unable to load registered users:", error);
        return [];
    }
}


function getSavedComplaints() {
    try {
        const complaints = JSON.parse(
            localStorage.getItem("hostelcareComplaints") || "[]"
        );

        return Array.isArray(complaints) ? complaints : [];

    } catch (error) {
        console.error("Unable to load complaints:", error);
        return [];
    }
}


function isValidRoom(room) {
    return (
        typeof room === "string" &&
        room.trim() !== "" &&
        !room.includes("@")
    );
}


function normalizeStatus(status) {
    const value = String(status || "Pending")
        .trim()
        .toLowerCase();

    if (value === "resolved") {
        return "Resolved";
    }

    if (value === "in progress" || value === "progress") {
        return "In Progress";
    }

    return "Pending";
}


function getStatusClass(status) {
    const value = normalizeStatus(status);

    if (value === "Resolved") {
        return "resolved";
    }

    if (value === "In Progress") {
        return "progress";
    }

    return "pending";
}


// =============================================
// 2. Load Logged-in Student
// =============================================

let currentUser = null;

try {
    const userData = sessionStorage.getItem("hostelcareCurrentUser");

    if (!userData) {
        alert("Please log in first.");
        window.location.replace("user-login.html");

    } else {
        const sessionUser = JSON.parse(userData);

        if (!sessionUser || !sessionUser.email) {
            throw new Error("Invalid student session.");
        }

        const users = getRegisteredUsers();

        const registeredUser = users.find(function (user) {
            return (
                user.email &&
                user.email.toLowerCase() ===
                sessionUser.email.toLowerCase()
            );
        });

        currentUser = {
            name: registeredUser?.name || sessionUser.name || "Student",
            email: sessionUser.email,
            room: isValidRoom(registeredUser?.room)
                ? registeredUser.room.trim()
                : (
                    isValidRoom(sessionUser.room)
                        ? sessionUser.room.trim()
                        : ""
                )
        };

        // Ask for a room number only if the saved data is incorrect.
        if (!isValidRoom(currentUser.room)) {

            const enteredRoom = prompt(
                "Please enter your correct hostel room number.\n" +
                "Example: C-506"
            );

            if (isValidRoom(enteredRoom)) {
                currentUser.room = enteredRoom.trim();

                if (registeredUser) {
                    registeredUser.room = currentUser.room;

                    localStorage.setItem(
                        "hostelcareUsers",
                        JSON.stringify(users)
                    );
                }

            } else {
                alert(
                    "A valid room number is needed. " +
                    "Please log in again and correct your account details."
                );

                currentUser = null;
                sessionStorage.removeItem("hostelcareCurrentUser");
                window.location.replace("user-login.html");
            }
        }

        if (currentUser) {
            sessionStorage.setItem(
                "hostelcareCurrentUser",
                JSON.stringify(currentUser)
            );
        }
    }

} catch (error) {
    console.error("Account loading error:", error);

    alert("Unable to load your account. Please log in again.");

    sessionStorage.removeItem("hostelcareCurrentUser");
    window.location.replace("user-login.html");
}


// =============================================
// 3. Dashboard
// =============================================

if (currentUser) {

    const nameElement = document.getElementById("loggedInName");
    const roomElement = document.getElementById("loggedInRoom");
    const welcomeElement = document.getElementById("welcomeName");
    const welcomeRoomElement = document.getElementById("welcomeRoom");

    const complaintForm = document.getElementById("userComplaintForm");
    const complaintTable = document.getElementById("complaintTable");
    const statusFilter = document.getElementById("statusFilter");

    const complaintName = document.getElementById("name");
    const complaintRoom = document.getElementById("room");

    // =============================================
    // 4. Display Student Details
    // =============================================

    function displayStudentDetails() {

        if (nameElement) {
            nameElement.textContent = currentUser.name;
        }

        if (roomElement) {
            roomElement.textContent = currentUser.room
                ? "Room: " + currentUser.room
                : "Room: Not set";
        }

        if (welcomeElement) {
            welcomeElement.textContent = currentUser.name;
        }

        if (welcomeRoomElement) {
            welcomeRoomElement.textContent =
                currentUser.room || "Not set";
        }

        if (complaintName) {
            complaintName.value = currentUser.name;
        }

        if (complaintRoom) {
            complaintRoom.value = currentUser.room;
        }
    }

    displayStudentDetails();


    // =============================================
    // 5. Dynamic Statistics
    // =============================================

    function updateStudentStatistics(complaints) {

        const totalElement =
            document.getElementById("totalStudentComplaints");

        const pendingElement =
            document.getElementById("pendingStudentComplaints");

        const progressElement =
            document.getElementById("progressStudentComplaints");

        const resolvedElement =
            document.getElementById("resolvedStudentComplaints");

        const total = complaints.length;

        const pending = complaints.filter(function (complaint) {
            return normalizeStatus(complaint.status) === "Pending";
        }).length;

        const inProgress = complaints.filter(function (complaint) {
            return normalizeStatus(complaint.status) === "In Progress";
        }).length;

        const resolved = complaints.filter(function (complaint) {
            return normalizeStatus(complaint.status) === "Resolved";
        }).length;

        if (totalElement) {
            totalElement.textContent = total;
        }

        if (pendingElement) {
            pendingElement.textContent = pending;
        }

        if (progressElement) {
            progressElement.textContent = inProgress;
        }

        if (resolvedElement) {
            resolvedElement.textContent = resolved;
        }
    }


    // =============================================
    // 6. Complaint Table
    // =============================================

    function addComplaintRow(complaint) {

        const row = document.createElement("tr");

        row.dataset.complaintId = complaint.id || "";

        // Complaint ID
        const idCell = document.createElement("td");
        idCell.textContent = complaint.id || "";
        row.appendChild(idCell);

        // Category
        const categoryCell = document.createElement("td");
        categoryCell.textContent = complaint.category || "";
        row.appendChild(categoryCell);

        // Room
        const roomCell = document.createElement("td");

        roomCell.textContent = isValidRoom(complaint.room)
            ? complaint.room
            : "Not set";

        row.appendChild(roomCell);

        // Priority
        const priorityCell = document.createElement("td");
        const priorityBadge = document.createElement("span");

        const priority = complaint.priority || "Low";

        priorityBadge.className =
            "priority " + priority.toLowerCase();

        priorityBadge.textContent = priority;

        priorityCell.appendChild(priorityBadge);
        row.appendChild(priorityCell);

        // Date
        const dateCell = document.createElement("td");
        dateCell.textContent = complaint.date || "";
        row.appendChild(dateCell);

        // Status
        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");

        const status = normalizeStatus(complaint.status);

        statusBadge.className =
            "status " + getStatusClass(status);

        statusBadge.textContent = status;

        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);

        complaintTable.appendChild(row);
    }


    // =============================================
    // 7. Load This Student's Complaints
    // =============================================

    function getMyComplaints() {

        return getSavedComplaints().filter(function (complaint) {
            return (
                complaint.userEmail &&
                complaint.userEmail.toLowerCase() ===
                currentUser.email.toLowerCase()
            );
        });
    }


    function renderStudentComplaints() {

        if (!complaintTable) {
            return;
        }

        const myComplaints = getMyComplaints();

        // Remove old rows before re-rendering.
        complaintTable.replaceChildren();

        if (myComplaints.length === 0) {

            const emptyRow = document.createElement("tr");
            const emptyCell = document.createElement("td");

            emptyCell.colSpan = 6;
            emptyCell.textContent =
                "You have not submitted any complaints yet.";

            emptyCell.style.textAlign = "center";
            emptyCell.style.padding = "20px";

            emptyRow.appendChild(emptyCell);
            complaintTable.appendChild(emptyRow);

        } else {

            myComplaints.forEach(function (complaint) {
                addComplaintRow(complaint);
            });
        }

        updateStudentStatistics(myComplaints);
        applyStatusFilter();
    }


    // =============================================
    // 8. Save Student Room Number
    // =============================================

    function saveStudentRoom(room) {

        if (!isValidRoom(room)) {
            return false;
        }

        currentUser.room = room.trim();

        sessionStorage.setItem(
            "hostelcareCurrentUser",
            JSON.stringify(currentUser)
        );

        const users = getRegisteredUsers();

        const registeredUser = users.find(function (user) {
            return (
                user.email &&
                user.email.toLowerCase() ===
                currentUser.email.toLowerCase()
            );
        });

        if (registeredUser) {

            registeredUser.room = currentUser.room;

            try {
                localStorage.setItem(
                    "hostelcareUsers",
                    JSON.stringify(users)
                );

            } catch (error) {
                console.error("Unable to update student room:", error);
                alert("Room number could not be saved.");
                return false;
            }
        }

        displayStudentDetails();

        return true;
    }


    // =============================================
    // 9. Submit Complaint
    // =============================================

    if (complaintForm && complaintTable) {

        complaintForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const category =
                document.getElementById("category").value;

            const priority =
                document.getElementById("priority").value;

            const description =
                document.getElementById("description").value.trim();

            const enteredRoom =
                complaintRoom ? complaintRoom.value.trim() : "";

            if (!category || !priority || !description) {
                alert("Please fill in all complaint fields.");
                return;
            }

            if (!isValidRoom(enteredRoom)) {
                alert(
                    "Please enter a valid room number, " +
                    "for example C-506."
                );

                if (complaintRoom) {
                    complaintRoom.focus();
                }

                return;
            }

            if (!saveStudentRoom(enteredRoom)) {
                return;
            }

            const newComplaint = {

                id: "HC-" + String(Date.now()).slice(-6),

                userEmail: currentUser.email,

                name: currentUser.name,

                room: currentUser.room,

                category: category,

                priority: priority,

                description: description,

                date: new Date().toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }),

                status: "Pending"
            };

            const complaints = getSavedComplaints();

            complaints.push(newComplaint);

            try {
                localStorage.setItem(
                    "hostelcareComplaints",
                    JSON.stringify(complaints)
                );

            } catch (error) {
                console.error("Complaint saving error:", error);

                alert("Unable to save complaint. Please try again.");
                return;
            }

            alert(
                "Complaint registered successfully!\n\n" +
                "Complaint ID: " + newComplaint.id
            );

            complaintForm.reset();

            displayStudentDetails();

            renderStudentComplaints();
        });
    }


    // =============================================
    // 10. Status Filter
    // =============================================

    function applyStatusFilter() {

        if (!complaintTable || !statusFilter) {
            return;
        }

        const selectedStatus = statusFilter.value;

        const rows = complaintTable.querySelectorAll("tr[data-complaint-id]");

        rows.forEach(function (row) {

            const statusElement = row.querySelector(".status");

            if (!statusElement) {
                return;
            }

            const status = statusElement.textContent
                .trim()
                .toLowerCase();

            let showRow = false;

            if (selectedStatus === "all") {
                showRow = true;

            } else if (
                selectedStatus === "progress" &&
                status === "in progress"
            ) {
                showRow = true;

            } else if (status === selectedStatus) {
                showRow = true;
            }

            row.style.display = showRow ? "" : "none";
        });
    }


    if (statusFilter) {
        statusFilter.addEventListener(
            "change",
            applyStatusFilter
        );
    }


    // =============================================
    // 11. Refresh When Admin Updates a Complaint
    // =============================================

    window.addEventListener("storage", function (event) {

        if (
            event.key === "hostelcareComplaints" ||
            event.key === null
        ) {
            renderStudentComplaints();
        }

        if (event.key === "hostelcareUsers" && event.newValue) {

            const users = getRegisteredUsers();

            const registeredUser = users.find(function (user) {
                return (
                    user.email &&
                    user.email.toLowerCase() ===
                    currentUser.email.toLowerCase()
                );
            });

            if (registeredUser) {

                currentUser.name = registeredUser.name || currentUser.name;

                if (isValidRoom(registeredUser.room)) {
                    currentUser.room = registeredUser.room;
                }

                sessionStorage.setItem(
                    "hostelcareCurrentUser",
                    JSON.stringify(currentUser)
                );

                displayStudentDetails();
            }
        }
    });


    // =============================================
    // 12. Initial Dashboard Load
    // =============================================

    renderStudentComplaints();
}