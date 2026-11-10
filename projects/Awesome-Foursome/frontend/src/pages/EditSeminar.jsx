import { useEffect, useState } from "react";
import Navbar from "../components/layout/navbar.jsx";
import { apiRequest } from "../utils/api.js";
import { useAuth } from "../context/auth-context.jsx";
import "../styles/styles.css";

const EMPTY_FORM = {
  title: "",
  description: "",
  professor: "",
  room: "",
  time: "",
  capacity: 50
};

export default function EditSeminar() {
  const { authHeaders } = useAuth();
  const [seminars, setSeminars] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/api/v1/seminars")
      .then((data) => setSeminars(data.data || data))
      .catch(() => setError("Failed to load seminars"));
  }, []);

  async function addSeminar(e) {
    e.preventDefault();
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("professor", form.professor);
      formData.append("room", form.room);
      formData.append("time", form.time);
      formData.append("capacity", form.capacity);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const data = await apiRequest("/api/v1/seminars", {
        method: "POST",
        headers: authHeaders,
        body: formData,
      });
      setSeminars((prev) => [data, ...prev]);
      setForm(EMPTY_FORM);
      setImageFile(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteSeminar(id) {
    setError("");
    try {
      await apiRequest(`/api/v1/seminars/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      setSeminars((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleCurrent(seminar) {
    setError("");
    try {
      const data = await apiRequest(`/api/v1/seminars/${seminar._id}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ isCurrent: !seminar.isCurrent }),
      });
      setSeminars((prev) => prev.map((s) => (s._id === seminar._id ? data : s)));
    } catch (err) {
      setError(err.message);
    }
  }

  const current = seminars.filter((s) => s.isCurrent);
  const previous = seminars.filter((s) => !s.isCurrent);

  return (
    <div className="edit-seminar-page">
      <Navbar />

      <div className="edit-seminar-wrapper">
        <div className="edit-seminar-header">
          <h1>Edit Seminars</h1>
          {error && <p className="error-message">{error}</p>}
        </div>

        <form className="seminar-form" onSubmit={addSeminar}>
          <h2>Add new seminar</h2>
          <div className="seminar-form-grid">
            <input
              className="seminar-form-input"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              className="seminar-form-input seminar-form-textarea"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
            <input
              className="seminar-form-input"
              placeholder="Professor"
              value={form.professor}
              onChange={(e) => setForm({ ...form, professor: e.target.value })}
              required
            />
            <input
              className="seminar-form-input"
              placeholder="Room"
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
              required
            />
            <input
              className="seminar-form-input"
              placeholder="Time / Date"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              required
            />
            <input
              className="seminar-form-input"
              placeholder="Capacity"
              type="number"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 50 })}
              min="1"
              required
            />
            <input
              className="seminar-form-input"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </div>
          <button className="seminar-form-submit" type="submit">Add seminar</button>
        </form>

        <section className="edit-seminar-section">
          <h2>Current seminars</h2>
          {current.length === 0 && <p className="edit-seminar-empty">No current seminars</p>}
          {current.map((s) => (
            <div key={s._id} className="edit-seminar-row">
              <div className="edit-seminar-info">
                <p className="edit-seminar-desc">{s.title}</p>
                <p className="edit-seminar-meta">{s.professor} &mdash; {s.room} &mdash; {s.time}</p>
              </div>
              <div className="edit-seminar-actions">
                <button className="seminar-btn seminar-btn-move" onClick={() => toggleCurrent(s)}>
                  Move to Previous
                </button>
                <button className="seminar-btn seminar-btn-delete" onClick={() => deleteSeminar(s._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </section>

        <section className="edit-seminar-section">
          <h2>Previous seminars</h2>
          {previous.length === 0 && <p className="edit-seminar-empty">No previous seminars</p>}
          {previous.map((s) => (
            <div key={s._id} className="edit-seminar-row">
              <div className="edit-seminar-info">
                <p className="edit-seminar-desc">{s.title}</p>
                <p className="edit-seminar-meta">{s.professor} &mdash; {s.room} &mdash; {s.time}</p>
              </div>
              <div className="edit-seminar-actions">
                <button className="seminar-btn seminar-btn-move" onClick={() => toggleCurrent(s)}>
                  Move to Current
                </button>
                <button className="seminar-btn seminar-btn-delete" onClick={() => deleteSeminar(s._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
