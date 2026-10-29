(function () {
    if (sessionStorage.getItem("hostelcareAdminAuthenticated") !== "true") {
        window.location.replace("admin-login.html");
    }
})();