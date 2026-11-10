import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context.jsx";
import Navbar from "../components/layout/navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import { apiRequest } from "../utils/api.js";
import "../styles/styles.css";

export default function AdminHomePage() {
	const navigate = useNavigate();
	const { authHeaders, isAdmin } = useAuth();
	const [rentals, setRentals] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!isAdmin) {
			setError("Admin access required");
			setIsLoading(false);
			return;
		}

		const fetchRentals = async () => {
			try {
				const data = await apiRequest("/api/v1/rentals/admin/all", {
					headers: authHeaders,
				});
				setRentals(data);
			} catch (err) {
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		};

		fetchRentals();
	}, [authHeaders, isAdmin]);

	return (
		<div className="admin-home-page">
			<header>
				<Navbar />
			</header>
			<main className="admin-home-content">
				<h1>Admin Dashboard</h1>
				
				<section className="admin-cards">
					<div
						className="admin-home-card"
						onClick={() => navigate("/admin/seminars")}
						role="button"
						tabIndex={0}
						onKeyDown={(e) => e.key === "Enter" && navigate("/admin/seminars")}
					>
						<h2>Edit Seminars</h2>
						<p>Create, update, and manage seminars and events</p>
					</div>
					<div
						className="admin-home-card"
						onClick={() => navigate("/admin/inventory")}
						role="button"
						tabIndex={0}
						onKeyDown={(e) => e.key === "Enter" && navigate("/admin/inventory")}
					>
						<h2>Lab Inventory</h2>
						<p>Overview of all lab inventory, including quantity and availability</p>
					</div>
				</section>

				<section className="admin-rentals-section">
					<h2>Rental Overview</h2>
					
					{isLoading && <p className="loading">Loading rental data...</p>}
					{error && <p className="error">{error}</p>}

					{!isLoading && rentals.length === 0 && !error && (
						<p className="no-data">No rentals found.</p>
					)}

					{!isLoading && rentals.length > 0 && (
						<div className="rentals-container">
							<table className="rentals-table">
								<thead>
									<tr>
										<th>User</th>
										<th>Email</th>
										<th>Item</th>
										<th>Rental Dates</th>
										<th>Created</th>
										<th>Status</th>
									</tr>
								</thead>
								<tbody>
									{rentals.map((rentalRecord, index) => {
										const itemName =
											rentalRecord.rental.itemName || "Unknown Item";
										const isReturned = !!rentalRecord.rental.returnedAt;
										const dateList = rentalRecord.rental.dates
											.map((d) => new Date(d).toLocaleDateString())
											.join(", ");
										const createdDate = new Date(
											rentalRecord.rental.createdAt
										).toLocaleDateString();

										return (
											<tr key={`${rentalRecord.userId}-${index}`}>
												<td className="user-name">{rentalRecord.username}</td>
												<td className="user-email">{rentalRecord.email}</td>
												<td className="item-name">{itemName}</td>
												<td className="dates">{dateList}</td>
												<td className="created-date">{createdDate}</td>
												<td className={`status ${isReturned ? "returned" : "active"}`}>
													{isReturned ? "Returned" : "Active"}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
							<p className="total-rentals">
								Total Rentals: <strong>{rentals.length}</strong>
							</p>
						</div>
					)}
				</section>
			</main>
			<Footer />
		</div>
	);
}
