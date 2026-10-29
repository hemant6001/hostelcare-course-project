const userLoginForm = document.getElementById("userLoginForm");

if (userLoginForm) {
    userLoginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const email = document.getElementById("userEmail").value.trim();
        const password = document.getElementById("userPassword").value;

        if (!window.hostelCareAuth) {
            alert("HostelCare login is not ready. Refresh the page and try again.");
            return;
        }

        try {
            const result = await window.hostelCareAuth.login(email, password);
            const user = result.resident;
            if (window.hostelCareStudents) {
                await window.hostelCareStudents.syncProfile(user);
            }
            sessionStorage.setItem("hostelcareCurrentUser", JSON.stringify({
                name: user.name,
                email: user.email,
                room: user.room
            }));
            alert("Login successful! Welcome, " + user.name + ".");
            window.location.href = "user.html";
        } catch (error) {
            alert(error.message || "Invalid email or password. Please check your details.");
        }
    });
} else {
    console.error("Login form not found. Check the form ID in user-login.html.");
}