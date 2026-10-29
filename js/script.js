// =====================================
// HostelCare - JavaScript
// =====================================

const complaintForm = document.getElementById("complaintForm");

complaintForm.addEventListener("submit", function (event) {

    event.preventDefault();

    // Get form values
    const name = document.getElementById("studentName").value.trim();
    const room = document.getElementById("roomNo").value.trim();
    const type = document.getElementById("complaintType").value;
    const priority = document.getElementById("priority").value;
    const description = document.getElementById("complaint").value.trim();

    // Basic validation
    if (
        name === "" ||
        room === "" ||
        type === "" ||
        priority === "" ||
        description === ""
    ) {
        alert("Please fill all the required fields.");
        return;
    }

    // Generate complaint ID
    const complaintId =
        "HC-" + String(Date.now()).slice(-3);

    // Get complaint table
    const tableBody = document.querySelector("tbody");

    // Create new row
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
        <td>${complaintId}</td>
        <td>${type}</td>
        <td>${room}</td>
        <td>${priority}</td>
        <td>
            <span class="badge pending">
                Pending
            </span>
        </td>
    `;

    // Add new complaint
    tableBody.appendChild(newRow);

    // Success message
    alert(
        "Complaint registered successfully!\n\n" +
        "Complaint ID: " + complaintId
    );

    // Clear form
    complaintForm.reset();

});