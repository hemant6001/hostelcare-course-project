const adminLoginForm =
    document.getElementById("adminLoginForm");

adminLoginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const email =
        document.getElementById("adminEmail").value;

    const password =
        document.getElementById("adminPassword").value;


    if (
        email === "admin@hostelcare.com" &&
        password === "admin123"
    ) {

        sessionStorage.setItem("hostelcareAdminAuthenticated", "true");
        alert("Admin login successful!");

        window.location.href = "admin.html";

    } else {

        alert("Invalid admin email or password.");

    }

});