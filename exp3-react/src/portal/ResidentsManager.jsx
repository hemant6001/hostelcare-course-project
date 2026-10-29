import { useEffect, useState } from "react";

const EMPTY_FORM = { name: "", email: "", course: "Hostel Resident", roomNumber: "", mobile: "" };

function ResidentsManager() {
  const [residents, setResidents] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("Connecting to the resident API…");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const api = window.hostelCareStudents;
    if (!api) {
      setMessage("Resident API helper is unavailable.");
      return;
    }
    try {
      await api.syncLocalAccountsForCurrentServer();
      const rows = await api.list();
      setResidents(Array.isArray(rows) ? rows : []);
      setMessage("Live · Spring Boot resident API connected");
    } catch {
      setMessage("Spring Boot API offline · Start the Experiment 7 server");
    }
  }

  useEffect(() => {
    let active = true;
    async function load() {
      const api = window.hostelCareStudents;
      if (!api) {
        setMessage("Resident API helper is unavailable.");
        return;
      }
      try {
        await api.syncLocalAccountsForCurrentServer();
        const rows = await api.list();
        if (active) {
          setResidents(Array.isArray(rows) ? rows : []);
          setMessage("Live · Spring Boot resident API connected");
        }
      } catch {
        if (active) setMessage("Spring Boot API offline · Start the Experiment 7 server");
      }
    }
    load();
    const timer = window.setInterval(load, 2500);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  function change(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function startEdit(resident) {
    setEditingId(String(resident.id));
    setForm({
      name: resident.name || "",
      email: resident.email || "",
      course: resident.course || "",
      roomNumber: resident.roomNumber || "",
      mobile: resident.mobile || ""
    });
    setMessage("Editing " + resident.name + ".");
  }

  function cancelEdit() {
    setEditingId("");
    setForm(EMPTY_FORM);
    setMessage("Changes cancelled.");
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const api = window.hostelCareStudents;
      if (editingId) await api.update(editingId, form);
      else await api.create(form);
      setForm(EMPTY_FORM);
      setEditingId("");
      setMessage(editingId ? "Resident updated." : "Resident added.");
      await refresh();
    } catch (error) {
      setMessage(error.status === 409
        ? "That email already belongs to another resident."
        : "Could not save the resident. Check the API and form details.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(resident) {
    if (!window.confirm("Delete " + resident.name + " from the resident API?")) return;
    setBusy(true);
    try {
      await window.hostelCareStudents.remove(resident.id);
      if (editingId === String(resident.id)) cancelEdit();
      setMessage("Resident deleted.");
      await refresh();
    } catch {
      setMessage("Could not delete the resident. Check that the API is running.");
    } finally {
      setBusy(false);
    }
  }

  return <section id="residents" className="admin-card resident-manager">
    <div className="resident-manager-heading">
      <div><h2>Hostel Residents</h2><p className="card-description">Resident records shared with the original site and Postman.</p></div>
      <span className={"resident-api-status" + (message.startsWith("Live") ? " connected" : "")}>{message}</span>
    </div>
    <form className="resident-form" onSubmit={save}>
      <label>Name<input name="name" value={form.name} onChange={change} minLength={2} required /></label>
      <label>Email<input name="email" type="email" value={form.email} onChange={change} required /></label>
      <label>Room<input name="roomNumber" value={form.roomNumber} onChange={change} /></label>
      <label>Mobile<input name="mobile" type="tel" value={form.mobile} onChange={change} /></label>
      <div className="resident-form-actions">
        <button className="action-btn" type="submit" disabled={busy}>{busy ? "Saving…" : editingId ? "Save Changes" : "Add Resident"}</button>
        {editingId && <button className="resident-cancel-btn" type="button" onClick={cancelEdit} disabled={busy}>Cancel</button>}
      </div>
    </form>
    <div className="table-wrapper">
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Room</th><th>Mobile</th><th>Actions</th></tr></thead>
        <tbody>{residents.length ? residents.map((resident) => <tr key={resident.id}>
          <td>{resident.name}</td><td>{resident.email}</td><td>{resident.roomNumber || "—"}</td><td>{resident.mobile || "—"}</td>
          <td className="resident-row-actions"><button type="button" onClick={() => startEdit(resident)} disabled={busy}>Edit</button><button type="button" onClick={() => remove(resident)} disabled={busy}>Delete</button></td>
        </tr>) : <tr><td colSpan="5" className="empty-row">No resident records yet.</td></tr>}</tbody>
      </table>
    </div>
  </section>;
}

export default ResidentsManager;
