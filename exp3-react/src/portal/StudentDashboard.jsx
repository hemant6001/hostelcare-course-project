import { useMemo, useState } from "react";
import { Announcements, Badge, Stat, normalizeStatus } from "./DashboardParts.jsx";
import { useHostelCare } from "../context/HostelCareContext.jsx";

const CATEGORIES = ["Electrical", "Plumbing", "Cleaning", "Furniture", "Internet", "Other"];
const PRIORITIES = ["Low", "Medium", "High", "Emergency"];

function StudentDashboard({ onNavigate, onLogout }) {
  const { activeUser: user, complaints: allComplaints, apiMessage, notice, submitComplaint, setNotice: onNotice } = useHostelCare();
  const [status, setStatus] = useState("all");
  const [formData, setFormData] = useState(() => ({ roomNumber: user?.room || "", category: "", priority: "", description: "" }));
  const [errors, setErrors] = useState({});
  const complaints = useMemo(() => {
    const email = String(user?.email || "").trim().toLowerCase();
    if (!email) return [];
    return allComplaints.filter((item) => String(item.studentEmail || item.userEmail || "").trim().toLowerCase() === email);
  }, [allComplaints, user?.email]);
  const visible = complaints.filter((item) => status === "all" || normalizeStatus(item.status) === status);
  const count = (value) => complaints.filter((item) => normalizeStatus(item.status) === value).length;

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function validate() {
    const nextErrors = {};
    if (!/^[A-Za-z]{1,3}-?[0-9]{1,4}$/.test(formData.roomNumber.trim())) nextErrors.roomNumber = "Enter a room number such as A-204.";
    if (!CATEGORIES.includes(formData.category)) nextErrors.category = "Choose a complaint category.";
    if (!PRIORITIES.includes(formData.priority)) nextErrors.priority = "Choose a priority.";
    if (formData.description.trim().length < 10) nextErrors.description = "Describe the issue in at least 10 characters.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event) {
    event.preventDefault();
    onNotice("");
    if (!validate()) return;
    const saved = await submitComplaint({
      ...formData,
      roomNumber: formData.roomNumber.trim(),
      description: formData.description.trim(),
    });
    if (saved) {
      setFormData({ roomNumber: formData.roomNumber.trim(), category: "", priority: "", description: "" });
      setErrors({});
    }
  }

  return <div className="portal-dashboard">
    <header className="user-header"><div><h1>HostelCare</h1><p>Student Maintenance Portal</p></div><div className="user-profile"><span>👨‍🎓</span><div><strong>{user?.name}</strong><small>Room: {user?.room || "Not set"}</small></div></div></header>
    <nav className="navbar" aria-label="Student navigation"><button onClick={() => onNavigate("home")}>Home</button><a href="#dashboard">Dashboard</a><a href="#complaint">Register Complaint</a><a href="#my-complaints">My Complaints</a><a href="#announcements">Announcements</a><button onClick={onLogout}>Logout</button></nav>
    <main className="user-container">
      <section id="dashboard" className="welcome-card"><div><h2>Welcome back, <span>{user?.name}</span> 👋</h2><p>Manage your hostel maintenance complaints and track their status from one place.</p></div><div className="room-info"><strong>{user?.room || "Not set"}</strong><small>Room Number</small></div></section>
      <p className={"api-connection" + (apiMessage.startsWith("Live") ? " connected" : "")}>● {apiMessage}</p>
      {notice && <p className="portal-notice" role="status">{notice}</p>}
      <section className="stats"><Stat icon="📝" value={complaints.length} label="Total Complaints" /><Stat icon="⏳" value={count("Pending")} label="Pending" /><Stat icon="🔧" value={count("In Progress")} label="In Progress" /><Stat icon="✅" value={count("Resolved")} label="Resolved" /></section>
      <section id="complaint" className="card"><h2>Register Maintenance Complaint</h2><p className="section-description">Report any maintenance issue in your hostel room or common area.</p>
        <form onSubmit={submit} noValidate><div className="form-grid">
          <div className="form-group"><label htmlFor="student-name">Full Name</label><input id="student-name" value={user?.name || ""} readOnly /></div>
          <div className="form-group"><label htmlFor="room">Room Number</label><input id="room" name="roomNumber" value={formData.roomNumber} onChange={handleChange} placeholder="Example: A-204" aria-invalid={Boolean(errors.roomNumber)} aria-describedby={errors.roomNumber ? "room-error" : undefined} required />{errors.roomNumber && <small id="room-error" className="field-error">{errors.roomNumber}</small>}</div>
          <div className="form-group"><label htmlFor="category">Complaint Category</label><select id="category" name="category" value={formData.category} onChange={handleChange} aria-invalid={Boolean(errors.category)} aria-describedby={errors.category ? "category-error" : undefined} required><option value="" disabled>Select Category</option>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select>{errors.category && <small id="category-error" className="field-error">{errors.category}</small>}</div>
          <div className="form-group"><label htmlFor="priority">Priority</label><select id="priority" name="priority" value={formData.priority} onChange={handleChange} aria-invalid={Boolean(errors.priority)} aria-describedby={errors.priority ? "priority-error" : undefined} required><option value="" disabled>Select Priority</option>{PRIORITIES.map((priority) => <option key={priority}>{priority}</option>)}</select>{errors.priority && <small id="priority-error" className="field-error">{errors.priority}</small>}</div>
          <div className="form-group full"><label htmlFor="description">Complaint Description</label><textarea id="description" name="description" rows="5" value={formData.description} onChange={handleChange} placeholder="Describe your problem..." aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "description-error" : undefined} required />{errors.description && <small id="description-error" className="field-error">{errors.description}</small>}</div>
        </div><button type="submit">Submit Complaint</button></form>
      </section>
      <section id="my-complaints" className="card"><div className="section-heading"><div><h2>My Complaints</h2><p className="section-description">Track the maintenance requests you have submitted.</p></div><select aria-label="Filter complaints by status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All Status</option><option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Resolved">Resolved</option></select></div>
        <div className="table-container"><table><thead><tr><th>Complaint ID</th><th>Category</th><th>Room</th><th>Priority</th><th>Date</th><th>Status</th></tr></thead><tbody>{visible.length ? visible.map((item) => <tr key={item.id}><td>{item.id}</td><td>{item.category}</td><td>{item.roomNumber || item.room || "Not set"}</td><td><Badge type="priority" value={item.priority} /></td><td>{item.date}</td><td><Badge type="status" value={item.status} /></td></tr>) : <tr><td colSpan="6" className="empty-row">You have not submitted any complaints in this view.</td></tr>}</tbody></table></div>
      </section>
      <Announcements student />
    </main>
    <footer>© 2026 HostelCare | Student Maintenance Portal</footer>
  </div>;
}

export default StudentDashboard;

