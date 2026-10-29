import { useState } from "react";
import { Announcements, Badge, CategoryBar, Stat, normalizeStatus } from "./DashboardParts.jsx";
import { useHostelCare } from "../context/HostelCareContext.jsx";
import ResidentsManager from "./ResidentsManager.jsx";

function AdminDashboard({ complaints, search, onSearch, status, onStatus, onNavigate, onLogout }) {
  const { complaints: allComplaints, apiMessage, notice, updateStatus: onUpdate } = useHostelCare();
  const [busyId, setBusyId] = useState("");
  const count = (value) => allComplaints.filter((item) => normalizeStatus(item.status) === value).length;

  async function update(item) {
    const choices = ["Pending", "In Progress", "Resolved"];
    const current = normalizeStatus(item.status);
    const next = choices[(choices.indexOf(current) + 1) % choices.length];
    const entered = window.prompt("Enter the new status: Pending, In Progress, or Resolved", next);
    if (entered === null) return;
    const newStatus = choices.find((choice) => choice.toLowerCase() === entered.trim().toLowerCase());
    if (!newStatus) return;
    setBusyId(String(item.id));
    await onUpdate(item, newStatus);
    setBusyId("");
  }

  return <div className="portal-dashboard">
    <header className="admin-header"><div><h1>HostelCare</h1><p>Hostel Administration Portal</p></div><div className="admin-profile"><span>👨‍💼</span><div><strong>Hostel Administrator</strong><small>Admin</small></div></div></header>
    <nav className="admin-navbar" aria-label="Admin navigation"><button onClick={() => onNavigate("home")}>Home</button><a href="#dashboard">Dashboard</a><a href="#complaints">Complaints</a><a href="#residents">Residents</a><a href="#announcements">Announcements</a><button onClick={onLogout}>Logout</button></nav>
    <main className="admin-container">
      <section id="dashboard" className="dashboard-heading"><div><h2>Admin Dashboard</h2><p>Monitor and manage hostel maintenance activities.</p></div><span className="admin-label">Hostel Administrator</span></section>
      <p className={"api-connection" + (apiMessage.startsWith("Live") ? " connected" : "")}>● {apiMessage}</p>
      {notice && <p className="portal-notice" role="status">{notice}</p>}
      <section className="admin-stats"><Stat color="blue" icon="📋" value={allComplaints.length} label="Total Complaints" /><Stat color="yellow" icon="⏳" value={count("Pending")} label="Pending" /><Stat color="orange" icon="🔧" value={count("In Progress")} label="In Progress" /><Stat color="green" icon="✅" value={count("Resolved")} label="Resolved" /></section>
      <section id="complaints" className="admin-card"><div className="card-heading"><div><h2>Complaint Management</h2><p className="card-description">View and manage all hostel maintenance complaints.</p></div><div className="filters"><input type="search" placeholder="Search complaints..." aria-label="Search complaints" value={search} onChange={(event) => onSearch(event.target.value)} /><select aria-label="Filter complaints by status" value={status} onChange={(event) => onStatus(event.target.value)}><option value="all">All Status</option><option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Resolved">Resolved</option></select></div></div>
        <div className="table-wrapper"><table><thead><tr><th>ID</th><th>Student</th><th>Room</th><th>Category</th><th>Description</th><th>Priority</th><th>Date</th><th>Status</th><th>Action</th></tr></thead><tbody>{complaints.length ? complaints.map((item) => <tr key={item.id}><td>{item.id}</td><td>{item.studentName || item.name || "Unknown"}</td><td>{item.roomNumber || item.room || "Not set"}</td><td>{item.category}</td><td>{item.description}</td><td><Badge type="priority" value={item.priority} /></td><td>{item.date}</td><td><Badge type="status" value={item.status} /></td><td><button className="action-btn" disabled={busyId === String(item.id)} onClick={() => update(item)}>{busyId === String(item.id) ? "Saving…" : "Update"}</button></td></tr>) : <tr><td colSpan="9" className="empty-row">No complaints found.</td></tr>}</tbody></table></div>
        <p className="card-description">Student complaints update here from the shared API.</p>
      </section>
      <section className="bottom-grid">
        <ResidentsManager />
        <section className="admin-card"><h2>Complaint Categories</h2><p className="card-description">Sample distribution of maintenance complaints.</p><div className="category-bars"><CategoryBar name="Electrical" count="12" width="75%" /><CategoryBar name="Plumbing" count="8" width="50%" /><CategoryBar name="Cleaning" count="15" width="90%" /><CategoryBar name="Furniture" count="5" width="35%" /></div></section>
      </section>
      <Announcements />
    </main>
    <footer>© 2026 HostelCare | Admin Management Portal</footer>
  </div>;
}

export default AdminDashboard;


