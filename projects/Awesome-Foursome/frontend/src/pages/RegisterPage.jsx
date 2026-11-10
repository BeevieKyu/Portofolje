// User registration page - allows new users to create accounts
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ButtonLight from "../components/ui/ButtonLight.jsx";
import Navbar from '../components/layout/navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import { apiRequest } from "../utils/api.js"; // API utility to call backend
import "../styles/styles.css";

export default function RegisterPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [email, setEmail] = useState("");
	const [error, setError] = useState(""); // Display validation errors to user
	const [isLoading, setIsLoading] = useState(false); // Show loading state during submission
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);
		try {
			await apiRequest("/api/v1/auth/register", {
				method: "POST",
				body: JSON.stringify({ username, password, email }),
			});
			alert("Registration successful! Redirecting to login...");
			navigate("/login");
		} catch (err) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="login-page">
			<header className="login-header">
				<Navbar />
			</header>
			<main className="login-content">
				<div className="login-card">
					<h1>Register</h1>
					{error && <p className="error-message">{error}</p>}
					<form onSubmit={handleSubmit}>
						<label htmlFor="username">Username</label>
						<input
							id="username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="Enter your username"
							required
							disabled={isLoading}
						/>

						<label htmlFor="email">Email</label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter your email"
							required
							disabled={isLoading}
						/>

						<label htmlFor="password">Password</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter your password"
							required
							disabled={isLoading}
						/>

						<ButtonLight type="submit" disabled={isLoading}>
							{isLoading ? "Creating account..." : "Register"}
						</ButtonLight>
					</form>
				<p className="auth-link">
					Already have an account? <Link to="/login">Sign in here</Link>
					</p>
				</div>
			</main>
			<Footer />
		</div>
	);
}
