function Header({ user, cartCount = 0 }) {
  return (
    <header className="topbar">
      <div className="brand">
        <h1>HostelCare</h1>
        <p>Student Maintenance Portal</p>
      </div>
      <div className="header-actions">
        <div className="cart-pill" aria-live="polite">
          <span>🛒 Supplies</span>
          <b>{cartCount}</b>
        </div>
        <div className="user-profile">
          <span className="avatar" aria-hidden="true">{user.initials || "👨‍🎓"}</span>
          <div className="user-copy">
            <strong>{user.name}</strong>
            <small>Room: {user.roomNumber}</small>
          </div>
        </div>
      </div>
    </header>
  );
}
export default Header;
