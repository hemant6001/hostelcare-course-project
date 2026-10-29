function Home({ onNavigate }) {
  return <div className="portal-home">
    <header className="header"><div className="logo"><h1>HostelCare</h1><p>Smart Hostel Maintenance Management System</p></div><div className="header-badge">SDG 11</div></header>
    <main className="welcome-container">
      <section className="welcome-section">
        <h2>Welcome to HostelCare</h2>
        <p>A smart platform for registering, tracking and managing hostel maintenance complaints.</p>
        <div className="role-container">
          <article className="role-card"><div className="role-icon">👨‍🎓</div><h3>Student / User</h3><p>Register complaints, view your complaints and track their status.</p><button className="role-btn" onClick={() => onNavigate("student-login")}>Enter User Panel</button><button className="role-btn secondary-role-btn" onClick={() => onNavigate("register")}>Register as Student</button></article>
          <article className="role-card"><div className="role-icon">👨‍💼</div><h3>Hostel Admin</h3><p>Manage complaints, update statuses and monitor hostel maintenance.</p><button className="role-btn admin-btn" onClick={() => onNavigate("admin-login")}>Enter Admin Panel</button></article>
        </div>
      </section>
      <section className="features">
        <Feature icon="📝" title="Easy Complaints" text="Register maintenance issues digitally." />
        <Feature icon="🔍" title="Track Status" text="Track complaints from pending to resolved." />
        <Feature icon="⚡" title="Quick Management" text="Admins can efficiently manage complaints." />
        <Feature icon="📊" title="Smart Dashboard" text="View maintenance information in one place." />
      </section>
    </main>
    <footer>© 2026 HostelCare | Hostel Maintenance Management System</footer>
  </div>;
}

function Feature({ icon, title, text }) {
  return <article className="feature-card"><span>{icon}</span><h3>{title}</h3><p>{text}</p></article>;
}

export default Home;
