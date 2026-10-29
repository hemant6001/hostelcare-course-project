const registrationForm = document.getElementById("registrationForm");

if (registrationForm) {
    registrationForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const newUser = {
            name: document.getElementById("fullName").value.trim(),
            email: document.getElementById("registerEmail").value.trim(),
            mobile: document.getElementById("mobile").value.trim(),
            room: document.getElementById("roomNumber").value.trim(),
            password: document.getElementById("registerPassword").value
        };
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (newUser.password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        if (!/^[0-9]{10}$/.test(newUser.mobile)) {
            alert("Enter a valid 10-digit mobile number.");
            return;
        }
        if (!window.hostelCareAuth) {
            alert("HostelCare registration is not ready. Refresh the page and try again.");
            return;
        }

        try {
            const result = await window.hostelCareAuth.register(newUser);
            const profile = window.hostelCareAuth.saveProfile(result.resident);
            if (window.hostelCareStudents) {
                await window.hostelCareStudents.syncProfile(profile);
            }
            alert("Registration successful! Please log in.");
            window.location.href = "user-login.html";
        } catch (error) {
            alert(error.message || "Registration failed. Please try again.");
        }
    });
}