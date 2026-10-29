export function normalizeStatus(status) {
  const value = String(status || "Pending").trim().toLowerCase();
  if (value === "resolved") return "Resolved";
  if (value === "in progress" || value === "progress") return "In Progress";
  return "Pending";
}

export function Badge({ type, value }) {
  const text = type === "status" ? normalizeStatus(value) : (value || "Low");
  const css = type === "status" ? text === "In Progress" ? "progress" : text.toLowerCase() : String(text).toLowerCase();
  return <span className={type + " " + css}>{text}</span>;
}

export function Stat({ icon, value, label, color }) {
  return color
    ? <article className="admin-stat-card"><div className={"stat-icon " + color}>{icon}</div><div><strong>{value}</strong><span>{label}</span></div></article>
    : <article className="stat-card"><span>{icon}</span><div><strong>{value}</strong><small>{label}</small></div></article>;
}

export function Announcements({ student = false }) {
  const items = student
    ? [["💧", "Water Supply Maintenance", "Water supply maintenance will be carried out tomorrow from 10:00 AM to 1:00 PM."], ["⚡", "Electrical Inspection", "Electrical inspection of hostel rooms will be conducted this week."], ["🧹", "Monthly Cleanliness Drive", "Students are requested to cooperate during the monthly cleanliness drive."]]
    : [["💧", "Water Supply Maintenance", "Temporary water supply interruption scheduled for tomorrow.", "Posted today"], ["⚡", "Electrical Inspection", "Hostel electrical inspection will be conducted this week.", "Posted yesterday"], ["🧹", "Cleanliness Drive", "Monthly hostel cleanliness drive will be conducted soon.", "Posted 3 days ago"]];
  return <section id="announcements" className={student ? "card" : "admin-card"}>
    <div className="announcement-title"><h2>Hostel Announcements</h2>{!student && <p className="card-description">Important notices for hostel residents.</p>}</div>
    <div className={student ? "announcements" : "announcement-grid"}>{items.map(([icon, title, text, date]) => <article key={title}><span>{icon}</span><div><h3>{title}</h3><p>{text}</p>{date && <small>{date}</small>}</div></article>)}</div>
  </section>;
}

export function Resident({ initials, name, room }) {
  return <div className="resident"><span>{initials}</span><div><strong>{name}</strong><small>Room {room}</small></div><b>Active</b></div>;
}

export function CategoryBar({ name, count, width }) {
  return <div><label>{name}<span>{count}</span></label><div className="bar"><i style={{ width }} /></div></div>;
}
