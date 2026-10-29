import { useEffect, useMemo, useState } from "react";
import Home from "./portal/Home.jsx";
import Access from "./portal/Access.jsx";
import StudentDashboard from "./portal/StudentDashboard.jsx";
import AdminDashboard from "./portal/AdminDashboard.jsx";
import { HostelCareContext } from "./context/HostelCareContext.jsx";
import "../../js/hostelcare-students.js";
import "../../js/hostelcare-auth.js";
import "../../css/style.css";
import "../../css/login.css";
import "../../css/user.css";
import "../../css/admin.css";
import "./portal/portal.css";

const API_URL = "http://localhost:3000/complaints";
const USERS_KEY = "hostelcareUsers";
const CURRENT_USER_KEY = "hostelcareCurrentUser";
const ADMIN_EMAIL = "admin@hostelcare.com";
const ADMIN_PASSWORD = "admin123";

function initialPortal() {
  return { screen: "home", user: null };
}
function readUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function App() {
  const [initial] = useState(initialPortal);
  const [screen, setScreen] = useState(initial.screen);
  const [activeUser, setActiveUser] = useState(initial.user);
  const [complaints, setComplaints] = useState([]);
  const [apiMessage, setApiMessage] = useState("Connecting to the HostelCare complaints API…");
  const [notice, setNotice] = useState("");
  const [adminSearch, setAdminSearch] = useState("");
  const [adminStatus, setAdminStatus] = useState("all");

  useEffect(() => {
    if (initial.screen !== "student") return;
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(initial.user));
    window.history.replaceState({}, "", window.location.pathname);
  }, [initial]);

  const visibleAdminComplaints = useMemo(() => complaints.filter((row) => {
    const term = adminSearch.trim().toLowerCase();
    const matchesText = !term || [row.id, row.studentName, row.roomNumber, row.category, row.description]
      .some((value) => String(value || "").toLowerCase().includes(term));
    const status = String(row.status || "Pending").toLowerCase();
    const matchesStatus = adminStatus === "all" || status === adminStatus.toLowerCase();
    return matchesText && matchesStatus;
  }), [complaints, adminSearch, adminStatus]);

  useEffect(() => {
    if (screen !== "student" && screen !== "admin") return undefined;
    let mounted = true;
    const refresh = async () => {
      try {
        const response = await fetch(API_URL, { cache: "no-store" });
        if (!response.ok) throw new Error("API request failed");
        const rows = await response.json();
        if (mounted) {
          setComplaints(Array.isArray(rows) ? rows : []);
          setApiMessage("Live · HostelCare complaints API connected");
        }
      } catch {
        if (mounted) setApiMessage("API offline · Start JSON Server");
      }
    };
    refresh();
    const timer = window.setInterval(refresh, 2000);
    window.addEventListener("focus", refresh);
    return () => {
      mounted = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [screen]);

  function go(screenName) {
    setNotice("");
    setScreen(screenName);
  }

  async function loginStudent(email, password) {
    if (!window.hostelCareAuth) {
      setNotice("HostelCare login service is not ready. Refresh the page and try again.");
      return;
    }
    try {
      const result = await window.hostelCareAuth.login(email, password);
      const profile = window.hostelCareAuth.saveProfile(result.resident);
      if (window.hostelCareStudents) {
        await window.hostelCareStudents.syncProfile(profile);
      }
      const signedIn = { name: profile.name, email: profile.email, room: profile.room || "" };
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(signedIn));
      setActiveUser(signedIn);
      setNotice("");
      setScreen("student");
    } catch (error) {
      setNotice(error.message || "Email or password is incorrect. If you are new, register first.");
    }
  }

  async function registerStudent(user) {
    if (!window.hostelCareAuth) {
      setNotice("HostelCare login service is not ready. Refresh the page and try again.");
      return;
    }
    try {
      const result = await window.hostelCareAuth.register(user);
      const profile = window.hostelCareAuth.saveProfile(result.resident);
      const synced = window.hostelCareStudents
        ? await window.hostelCareStudents.syncProfile(profile)
        : false;
      setNotice(synced
        ? "Registration successful. Your account is connected to HostelCare."
        : "Registration successful. Log in with this email and password.");
      setScreen("student-login");
    } catch (error) {
      setNotice(error.message || "Registration failed. Please try again.");
    }
  }
  function loginAdmin(email, password) {
    if (email.trim() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      setNotice("Admin email or password is incorrect.");
      return;
    }
    setNotice("");
    setScreen("admin");
  }

  function logout() {
    if (window.hostelCareAuth) window.hostelCareAuth.logout();
    sessionStorage.removeItem(CURRENT_USER_KEY);
    setActiveUser(null);
    setComplaints([]);
    go("home");
  }

  async function submitComplaint(values) {
    if (!activeUser) return false;
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, studentName: activeUser.name, studentEmail: activeUser.email, date: new Date().toISOString().slice(0, 10), status: "Pending" }),
      });
      if (!response.ok) throw new Error("POST failed");
      const saved = await response.json();
      setComplaints((rows) => [...rows, saved]);
      const updated = { ...activeUser, room: values.roomNumber };
      setActiveUser(updated);
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
      const users = readUsers();
      const account = users.find((row) => String(row.email || "").toLowerCase() === updated.email.toLowerCase());
      if (account) {
        account.room = updated.room;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
      if (window.hostelCareStudents) {
        await window.hostelCareStudents.syncProfile(account || updated);
      }
      setNotice("Complaint submitted.");
      return true;
    } catch {
      setNotice("Could not save the complaint. Is JSON Server running?");
      return false;
    }
  }

  async function updateStatus(item, status) {
    try {
      const response = await fetch(API_URL + "/" + encodeURIComponent(item.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("PATCH failed");
      const updated = await response.json();
      setComplaints((rows) => rows.map((row) => String(row.id) === String(updated.id) ? updated : row));
      setNotice("Complaint status updated.");
      return true;
    } catch {
      setNotice("Could not update the status. Is JSON Server running?");
      return false;
    }
  }

  let view = null;
  if (screen === "home") view = <Home onNavigate={go} />;
  else if (screen === "student-login" || screen === "register" || screen === "admin-login") {
    view = <Access mode={screen} notice={notice} onNotice={setNotice} onNavigate={go} onStudentLogin={loginStudent} onRegister={registerStudent} onAdminLogin={loginAdmin} />;
  } else if (screen === "student") {
    view = <StudentDashboard onNavigate={go} onLogout={logout} />;
  } else if (screen === "admin") {
    view = <AdminDashboard complaints={visibleAdminComplaints} search={adminSearch} onSearch={setAdminSearch} status={adminStatus} onStatus={setAdminStatus} onNavigate={go} onLogout={logout} />;
  }

  return <HostelCareContext.Provider value={{ activeUser, complaints, apiMessage, notice, setNotice, submitComplaint, updateStatus }}>
    {view}
  </HostelCareContext.Provider>;
}

export default App;



