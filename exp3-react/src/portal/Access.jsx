import { useState } from "react";

const EMPTY_FORM = { name: "", email: "", mobile: "", room: "", password: "", confirmPassword: "" };

function Access({ mode, notice, onNotice, onNavigate, onStudentLogin, onRegister, onAdminLogin }) {
  const isRegister = mode === "register";
  const isAdmin = mode === "admin-login";
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function validate() {
    const nextErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (isRegister && formData.name.trim().length < 2) nextErrors.name = "Enter your full name.";
    if (!emailPattern.test(formData.email.trim())) nextErrors.email = "Enter a valid email address.";
    if (isRegister && !/^[0-9]{10}$/.test(formData.mobile.trim())) nextErrors.mobile = "Enter a valid 10-digit mobile number.";
    if (isRegister && !/^[A-Za-z]{1,3}-?[0-9]{1,4}$/.test(formData.room.trim())) nextErrors.room = "Enter a room number such as A-204.";
    if (!formData.password) nextErrors.password = "Password is required.";
    else if (isRegister && formData.password.length < 6) nextErrors.password = "Use at least 6 characters.";
    if (isRegister && formData.password !== formData.confirmPassword) nextErrors.confirmPassword = "The passwords do not match.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function submit(event) {
    event.preventDefault();
    onNotice("");
    if (!validate()) return;
    if (isRegister) {
      return onRegister({ name: formData.name.trim(), email: formData.email.trim(), mobile: formData.mobile.trim(), room: formData.room.trim(), password: formData.password });
    }
    if (isAdmin) return onAdminLogin(formData.email.trim(), formData.password);
    return onStudentLogin(formData.email.trim(), formData.password);
  }

  return <main className="login-container">
    <section className={"login-card" + (isAdmin ? " admin-login" : "")}>
      <div className="login-icon">{isAdmin ? "👨‍💼" : isRegister ? "🎓" : "👨‍🎓"}</div>
      <h1>HostelCare</h1>
      <h2>{isAdmin ? "Admin Login" : isRegister ? "Create Student Account" : "Student Login"}</h2>
      <p className="login-subtitle">{isAdmin ? "Login to manage hostel maintenance activities" : isRegister ? "Register to manage and track your hostel complaints." : "Login to access your hostel maintenance portal"}</p>
      {notice && <p className="portal-notice" role="status">{notice}</p>}
      <form onSubmit={submit} noValidate>
        {isRegister ? <>
          <Field name="name" label="Full Name" placeholder="Enter your full name" value={formData.name} onChange={handleChange} error={errors.name} required />
          <Field name="email" label="Email Address" type="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} error={errors.email} required />
          <Field name="mobile" label="Mobile Number" type="tel" placeholder="Enter 10-digit mobile number" maxLength={10} value={formData.mobile} onChange={handleChange} error={errors.mobile} required />
          <Field name="room" label="Hostel Room Number" placeholder="Example: A-204" value={formData.room} onChange={handleChange} error={errors.room} required />
          <Field name="password" label="Password" type="password" placeholder="Create a password" minLength={6} value={formData.password} onChange={handleChange} error={errors.password} required />
          <Field name="confirmPassword" label="Confirm Password" type="password" placeholder="Re-enter your password" minLength={6} value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} required />
          <button type="submit">Create Account</button>
        </> : <>
          <Field name="email" label={isAdmin ? "Admin Email" : "Email"} type="email" placeholder={isAdmin ? "Enter admin email" : "Enter your email"} value={formData.email} onChange={handleChange} error={errors.email} required />
          <Field name="password" label="Password" type="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} error={errors.password} required />
          <button type="submit">{isAdmin ? "Admin Login" : "Login"}</button>
        </>}
      </form>
      {isAdmin && <p className="demo-login">Demo: admin@hostelcare.com / admin123</p>}
      {!isAdmin && !isRegister && <p className="demo-login">New student? <button className="text-button" onClick={() => { onNotice(""); onNavigate("register"); }}>Register here</button></p>}
      {isRegister && <p className="demo-login">Already registered? <button className="text-button" onClick={() => { onNotice(""); onNavigate("student-login"); }}>Login here</button></p>}
      <button className="back-link text-button" onClick={() => { onNotice(""); onNavigate("home"); }}>← Back to Home</button>
    </section>
  </main>;
}

function Field({ name, label, error, ...props }) {
  return <div className="form-group">
    <label htmlFor={name}>{label}</label>
    <input id={name} name={name} aria-invalid={Boolean(error)} aria-describedby={error ? name + "-error" : undefined} {...props} />
    {error && <small id={name + "-error"} className="field-error">{error}</small>}
  </div>;
}

export default Access;

