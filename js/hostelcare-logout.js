(function () {
    document.addEventListener("click", function (event) {
        const target = event.target;
        const button = target instanceof Element ? target.closest("[data-hostelcare-logout]") : null;
        if (!button) return;

        const role = button.getAttribute("data-hostelcare-logout");
        if (role === "admin") {
            sessionStorage.removeItem("hostelcareAdminAuthenticated");
            window.location.replace("admin-login.html");
            return;
        }

        sessionStorage.removeItem("hostelcareJwtToken");
        sessionStorage.removeItem("hostelcareCurrentUser");
        window.location.replace("user-login.html");
    });
})();