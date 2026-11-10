import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ButtonLight from "../components/ui/ButtonLight.jsx";
import { useAuth } from "../context/auth-context.jsx";
import Navbar from '../components/layout/navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import { apiRequest } from "../utils/api.js";
import "../styles/styles.css";

export default function LoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);
		try {
			const session = await apiRequest("/api/v1/auth/login", {
				method: "POST",
				body: JSON.stringify({ username, password }),
			});
			login(session);
			navigate(session.user.role === "admin" ? "/admin/home" : "/");
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
				<h1>Login</h1>
				{error && <p className="error-message">{error}</p>}
				<form onSubmit={handleSubmit}>
					<label htmlFor="username">Username</label>
					<input
						id="username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						placeholder="Enter your username"
						required
					/>

					<label htmlFor="password">Password</label>
					<input
						id="password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Enter your password"
						required
					/>

					<ButtonLight type="submit" disabled={isLoading}>
						{isLoading ? "Signing in..." : "Sign in"}
					</ButtonLight>
				</form>
				<p className="auth-link">
					Don't have an account? <Link to="/register">Register here</Link>
				</p>
			</div>
		</main>
		<Footer />
		</div>
	);
}
