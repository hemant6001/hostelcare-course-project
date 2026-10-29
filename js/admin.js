// =============================================
// HostelCare - Admin Dashboard JavaScript
// =============================================


// =============================================
// 1. DOM Elements
// =============================================

const searchInput = document.getElementById("searchComplaint");
const statusFilter = document.getElementById("adminStatusFilter");
const complaintTable = document.getElementById("adminComplaintTable");


// =============================================
// 2. Data Helper Functions
// =============================================

function getSavedComplaints() {
    try {
        const data = JSON.parse(
            localStorage.getItem("hostelcareComplaints") || "[]"
        );

        return Array.isArray(data) ? data : [];

    } catch (error) {
        console.error("Unable to load complaints:", error);
        return [];
    }
}


function saveComplaints(complaints) {
    try {
        localStorage.setItem(
            "hostelcareComplaints",
            JSON.stringify(complaints)
        );

        return true;

    } catch (error) {
        console.error("Unable to save complaints:", error);

        alert("Unable to save changes. Please try again.");

        return false;
    }
}


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


function getPriorityClass(priority) {
    return String(priority || "Low").toLowerCase();
}


// =============================================
// 3. Repair Complaint Details
// =============================================

function repairComplaintDetails() {
    const complaints = getSavedComplaints();
    const users = getRegisteredUsers();

    let changed = false;

    complaints.forEach(function (complaint) {

        // Find the student account associated with the complaint.
        const user = users.find(function (registeredUser) {
            return (
                registeredUser.email &&
                complaint.userEmail &&
                registeredUser.email.toLowerCase() ===
                complaint.userEmail.toLowerCase()
            );
        });

        if (!user) {
            return;
        }

        // Use the registered student's actual name.
        if (user.name && complaint.name !== user.name) {
            complaint.name = user.name;
            changed = true;
        }

        // Repair an email accidentally saved as a room number.
        // Prefer the registered room when it is valid.
        if (isValidRoom(user.room)) {

            if (complaint.room !== user.room.trim()) {
                complaint.room = user.room.trim();
                changed = true;
            }

        } else if (!isValidRoom(complaint.room)) {

            // Do not display an email as a room number.
            complaint.room = "Not set";
            changed = true;
        }

        // Standardize complaint statuses.
        const normalizedStatus = normalizeStatus(complaint.status);

        if (complaint.status !== normalizedStatus) {
            complaint.status = normalizedStatus;
            changed = true;
        }
    });

    if (changed) {
        saveComplaints(complaints);
    }

    return complaints;
}


// =============================================
// 4. Create Table Badges
// =============================================

function createBadge(type, value) {
    const badge = document.createElement("span");

    if (type === "status") {
        badge.className = "status " + getStatusClass(value);
        badge.textContent = normalizeStatus(value);

    } else {
        badge.className = "priority " + getPriorityClass(value);
        badge.textContent = value || "Low";
    }

    return badge;
}


// =============================================
// 5. Display Complaint Table
// =============================================

function displaySavedComplaints() {

    if (!complaintTable) {
        console.error("Admin complaint table not found.");
        return;
    }

    const table = complaintTable.closest("table");

    if (!table) {
        console.error("Complaint table element not found.");
        return;
    }

    const headerCells = table.querySelectorAll("thead th");

    const headers = Array.from(headerCells).map(function (header) {
        return header.textContent.trim().toLowerCase();
    });

    // Remove previously generated complaint rows.
    complaintTable.querySelectorAll(
        'tr[data-saved-complaint="true"]'
    ).forEach(function (row) {
        row.remove();
    });

    // Remove any previous empty-table message.
    const previousEmptyRow = document.getElementById("emptyComplaintsRow");

    if (previousEmptyRow) {
        previousEmptyRow.remove();
    }

    const complaints = repairComplaintDetails();

    complaints.forEach(function (complaint) {

        const row = document.createElement("tr");

        row.dataset.savedComplaint = "true";
        row.dataset.complaintId = String(complaint.id || "");

        headers.forEach(function (heading) {

            const cell = document.createElement("td");

            // Complaint ID
            if (
                heading === "id" ||
                heading.includes("complaint id") ||
                heading.includes("complaint no")
            ) {
                cell.textContent = complaint.id || "";
            }

            // Student Name
            else if (
                heading.includes("student") ||
                heading.includes("resident") ||
                heading === "name"
            ) {
                cell.textContent = complaint.name || "Unknown";
            }

            // Room Number
            else if (heading.includes("room")) {

                const room = complaint.room || "";

                cell.textContent = isValidRoom(room)
                    ? room
                    : "Not set";
            }

            // Category
            else if (heading.includes("category")) {
                cell.textContent = complaint.category || "";
            }

            // Description
            else if (
                heading.includes("description") ||
                heading.includes("details") ||
                heading.includes("issue")
            ) {
                cell.textContent = complaint.description || "";
            }

            // Priority
            else if (heading.includes("priority")) {
                cell.appendChild(
                    createBadge("priority", complaint.priority || "Low")
                );
            }

            // Date
            else if (heading.includes("date")) {
                cell.textContent = complaint.date || "";
            }

            // Status
            else if (heading.includes("status")) {
                cell.appendChild(
                    createBadge("status", complaint.status || "Pending")
                );
            }

            // Action Button
            else if (
                heading.includes("action") ||
                heading.includes("update")
            ) {
                const button = document.createElement("button");

                button.type = "button";
                button.className = "action-btn";
                button.textContent = "Update";

                cell.appendChild(button);
            }

            row.appendChild(cell);
        });

        complaintTable.appendChild(row);
    });

    // Show an informative message when there are no complaints.
    if (complaints.length === 0) {

        const emptyRow = document.createElement("tr");

        emptyRow.id = "emptyComplaintsRow";

        const emptyCell = document.createElement("td");

        emptyCell.colSpan = headers.length || 1;
        emptyCell.textContent = "No student complaints submitted yet.";
        emptyCell.style.textAlign = "center";
        emptyCell.style.padding = "20px";

        emptyRow.appendChild(emptyCell);
        complaintTable.appendChild(emptyRow);
    }

    updateStatistics(complaints);
    filterComplaints();
}


// =============================================
// 6. Update Dashboard Statistics
// =============================================

function updateStatistics(complaints) {

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

    const totalElement = document.getElementById("totalComplaintsCount");
    const pendingElement = document.getElementById("pendingComplaintsCount");
    const progressElement = document.getElementById("progressComplaintsCount");
    const resolvedElement = document.getElementById("resolvedComplaintsCount");

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
// 7. Search and Status Filter
// =============================================

function filterComplaints() {

    if (!complaintTable) {
        return;
    }

    const searchText = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const selectedStatus = statusFilter
        ? statusFilter.value
        : "all";

    const rows = complaintTable.querySelectorAll(
        'tr[data-saved-complaint="true"]'
    );

    rows.forEach(function (row) {

        const rowText = row.textContent.toLowerCase();

        const statusElement = row.querySelector(".status");

        const status = statusElement
            ? statusElement.textContent.trim().toLowerCase()
            : "";

        let statusMatch = true;

        if (selectedStatus !== "all") {

            const requiredStatus =
                selectedStatus === "progress"
                    ? "in progress"
                    : selectedStatus;

            statusMatch = status === requiredStatus;
        }

        const searchMatch = rowText.includes(searchText);

        row.style.display =
            statusMatch && searchMatch ? "" : "none";
    });
}


if (searchInput) {
    searchInput.addEventListener("input", filterComplaints);
}


if (statusFilter) {
    statusFilter.addEventListener("change", filterComplaints);
}


// =============================================
// 8. Update Complaint Status
// =============================================

function updateComplaintStatus(button) {

    const row = button.closest("tr");

    if (!row) {
        return;
    }

    const complaintId = row.dataset.complaintId;

    if (!complaintId) {
        alert("Complaint ID not found.");
        return;
    }

    const newStatus = prompt(
        "Enter the new complaint status:\n\n" +
        "Pending\n" +
        "In Progress\n" +
        "Resolved"
    );

    if (newStatus === null || newStatus.trim() === "") {
        return;
    }

    const inputStatus = newStatus.trim().toLowerCase();

    let formattedStatus;

    if (inputStatus === "pending") {
        formattedStatus = "Pending";

    } else if (
        inputStatus === "in progress" ||
        inputStatus === "progress"
    ) {
        formattedStatus = "In Progress";

    } else if (inputStatus === "resolved") {
        formattedStatus = "Resolved";

    } else {
        alert(
            "Invalid status!\n\n" +
            "Enter Pending, In Progress or Resolved."
        );

        return;
    }

    const complaints = getSavedComplaints();

    const complaint = complaints.find(function (item) {
        return String(item.id) === String(complaintId);
    });

    if (!complaint) {
        alert("Complaint not found in saved records.");
        return;
    }

    const previousStatus = complaint.status;

    complaint.status = formattedStatus;

    if (!saveComplaints(complaints)) {
        complaint.status = previousStatus;
        return;
    }

    alert("Complaint status updated successfully!");

    // Re-render the table and statistics using saved data.
    displaySavedComplaints();
}


// Use event delegation for dynamically created buttons.
if (complaintTable) {

    complaintTable.addEventListener("click", function (event) {

        const button = event.target.closest(".action-btn");

        if (button && complaintTable.contains(button)) {
            updateComplaintStatus(button);
        }
    });
}


// =============================================
// 9. Initialize Admin Dashboard
// =============================================

displaySavedComplaints();