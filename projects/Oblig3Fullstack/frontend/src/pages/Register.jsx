import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { validateEmail, validatePasswordMatch, validatePasswordLength } from "../utils/validationUtils";
import "../styles/auth.css";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
    dateOfBirth: "",
    agreeToTerms: false,
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function calculateAge(dateString) {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!formData.username.trim()) {
      setError("Username is required.");
      return;
    }
    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (formData.username.length > 30) {
      setError("Username must be at most 30 characters.");
      return;
    }

    let validationError = validateEmail(formData.email);
    if (validationError) {
      setError(validationError);
      return;
    }

    validationError = validatePasswordMatch(formData.password, formData.passwordConfirm);
    if (validationError) {
      setError(validationError);
      return;
    }

    validationError = validatePasswordLength(formData.password);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!formData.dateOfBirth) {
      setError("Date of birth is required.");
      return;
    }

    const age = calculateAge(formData.dateOfBirth);
    if (age < 18) {
      setError("You must be at least 18 years old to register.");
      return;
    }

    if (!formData.agreeToTerms) {
      setError("You must agree to the terms and conditions.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          age,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? data.message ?? "Registration failed. Please try again.");
        return;
      }

      login(data.user);
      navigate("/");
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              className="form-input"
              type="text"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <span className="form-hint">3-30 characters</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              className="form-input"
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="dateOfBirth">Date of Birth</label>
            <input
              id="dateOfBirth"
              className="form-input"
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
            <span className="form-hint">Must be 18+</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="form-input"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span className="form-hint">At least 6 characters</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="passwordConfirm">Confirm Password</label>
            <input
              id="passwordConfirm"
              className="form-input"
              type="password"
              name="passwordConfirm"
              placeholder="••••••••"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group form-group-checkbox">
            <input
              id="agreeToTerms"
              className="form-checkbox"
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              required
            />
            <label className="checkbox-label" htmlFor="agreeToTerms">
              I agree to the <Link to="/terms" target="_blank" rel="noopener noreferrer">Terms and Conditions</Link>
            </label>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Register"}
          </button>
        </form>

      </div>
    </div>
  );
}
