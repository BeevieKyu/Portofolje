// User profile page - displays logged-in user information and options
import { useAuth } from "../context/auth-context.jsx"; // Get user from global auth state
import { useNavigate } from "react-router-dom";
import Navbar from '../components/layout/navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import "../styles/styles.css";

export default function ProfilePage() {
	const { user, logout } = useAuth(); // Get current user from auth context
	const navigate = useNavigate();

	if (!user) {
		return (
			<div>
				<Navbar />
				<p>Please log in to view your profile.</p>
				<Footer />
			</div>
		);
	}

	return (
		<div className="login-page">
			<header className="login-header">
				<Navbar />
			</header>
			<main className="login-content">
				<div className="login-card">
					<h1>My Profile</h1>
					<div className="profile-details">
						<p><strong>Username:</strong> {user.username}</p>
						<p><strong>Email:</strong> {user.email}</p>
					</div>
					<div className="profile-actions">
						<button 
							type="button"
							onClick={() => navigate("/my-rentals")}
							className="profile-action-button"
						>
							My Rentals
						</button>
						<button 
							type="button"
							onClick={() => navigate("/seminars")}
							className="profile-action-button"
						>
							My Seminars
						</button>
						<button 
							type="button"
							onClick={() => {
								logout();
								navigate("/login");
							}}
							className="profile-action-button profile-action-button--logout"
						>
							Logout
						</button>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}
