import { useState, useEffect } from "react";
import { useAuth } from "../context/auth-context.jsx";
import DataCard from '../components/layout/DataCard.jsx';
import { apiRequest } from "../utils/api.js";
import "../styles/styles.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:2169";

export default function MyRentalsPage() {
	const { user, authHeaders } = useAuth();
	const [rentals, setRentals] = useState([]);
	const [inventory, setInventory] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [cancellingIndex, setCancellingIndex] = useState(null);

	useEffect(() => {
		const loadData = async () => {
			try {
				const [rentalsData, inventoryData] = await Promise.all([
					apiRequest(`/api/v1/users/${user.uid}/rentals`, { headers: authHeaders }),
					apiRequest("/api/v1/inventory")
				]);
				setRentals(rentalsData.rentals || []);
				setInventory(inventoryData || []);
			} catch (err) {
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		};

		if (user) loadData();
	}, [user]);

	const getItemName = (itemId) => {
		const item = inventory.find(i => i._id === itemId);
		return item?.name || `Item ${itemId}`;
	};

	const formatDate = (date) => {
		return new Date(date).toLocaleDateString();
	};

	const handleCancelRental = async (index) => {
		if (!window.confirm("Are you sure you want to cancel this rental?")) {
			return;
		}

		setCancellingIndex(index);
		try {
			const response = await fetch(`${API_BASE_URL}/api/v1/rentals/${index}`, {
				method: "DELETE",
				headers: authHeaders,
			});

			let errorMessage = "Failed to cancel rental";
			
			if (!response.ok) {
				try {
					const errData = await response.json();
					errorMessage = errData.message || errorMessage;
				} catch (e) {
					// If response body is not JSON, use generic error
					errorMessage = `Error: ${response.status} ${response.statusText}`;
				}
				throw new Error(errorMessage);
			}

			// Successfully cancelled - update local state
			const updatedRentals = [...rentals];
			updatedRentals[index].cancelledAt = new Date().toISOString();
			setRentals(updatedRentals);
			setError("");
		} catch (err) {
			setError(err.message);
		} finally {
			setCancellingIndex(null);
		}
	};

	const getRentalStatus = (rental) => {
		if (rental.cancelledAt) return "Cancelled";
		if (rental.returnedAt) return "Returned";
		return "Active";
	};

	const getStatusClass = (rental) => {
		if (rental.cancelledAt) return "status-cancelled";
		if (rental.returnedAt) return "status-returned";
		return "status-active";
	};

	if (isLoading) return <div><DataCard title="My Rentals" isEmpty={true} emptyMessage="Loading..." /></div>;

	return (
		<DataCard 
			title="My Rentals" 
			error={error}
			isEmpty={rentals.length === 0}
			emptyMessage="You haven't rented any items yet."
		>
			<div className="table-wrapper">
				<table>
					<thead>
						<tr>
							<th>Item</th>
							<th>Rented Date</th>
							<th>Status</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{rentals.map((rental, idx) => (
							<tr key={idx}>
								<td>{getItemName(rental.itemId)}</td>
								<td>{formatDate(rental.rentedAt || rental.createdAt)}</td>
								<td>
									<span className={`status-badge ${getStatusClass(rental)}`}>
										{getRentalStatus(rental)}
									</span>
								</td>
								<td>
									{!rental.cancelledAt && !rental.returnedAt && (
										<button
											onClick={() => handleCancelRental(idx)}
											disabled={cancellingIndex === idx}
											className="action-button btn-cancel"
										>
											{cancellingIndex === idx ? "Cancelling..." : "Cancel"}
										</button>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</DataCard>
	);
}
