import { useState, useEffect } from "react";
import { useAuth } from "../context/auth-context.jsx";
import DataCard from '../components/layout/DataCard.jsx';
import { apiRequest } from "../utils/api.js";
import "../styles/styles.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:2169";

export default function MySeminarsPage() {
	const { user, authHeaders } = useAuth();
	const [registrations, setRegistrations] = useState([]);
	const [seminars, setSeminars] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [withdrawingIndex, setWithdrawingIndex] = useState(null);

	useEffect(() => {
		const loadData = async () => {
			try {
				const [registrationsData, seminarsData] = await Promise.all([
					apiRequest(`/api/v1/users/${user.uid}/seminars`, { headers: authHeaders }),
					apiRequest("/api/v1/seminars?limit=100")
				]);
				setRegistrations(registrationsData.seminarRegistrations || []);
				setSeminars(seminarsData.data || seminarsData || []);
			} catch (err) {
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		};

		if (user) loadData();
	}, [user]);

	const getSeminarInfo = (seminarId) => {
		const seminar = seminars.find(s => s._id === seminarId);
		return seminar || {};
	};

	const formatDate = (date) => {
		return new Date(date).toLocaleDateString();
	};

	const reloadRegistrations = async () => {
		try {
			const registrationsData = await apiRequest(`/api/v1/users/${user.uid}/seminars`, { headers: authHeaders });
			setRegistrations(registrationsData.seminarRegistrations || []);
		} catch (err) {
			console.error("Failed to reload registrations:", err);
		}
	};

	const handleWithdraw = async (index) => {
		if (!window.confirm("Are you sure you want to withdraw from this seminar?")) {
			return;
		}

		setWithdrawingIndex(index);
		try {
			const response = await fetch(`${API_BASE_URL}/api/v1/seminars/${index}/unregister`, {
				method: "DELETE",
				headers: authHeaders,
			});

			let errorMessage = "Failed to withdraw from seminar";
			
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

			// Successfully withdrew - reload registrations
			await reloadRegistrations();
			setError("");
		} catch (err) {
			setError(err.message);
		} finally {
			setWithdrawingIndex(null);
		}
	};

	const getRegistrationStatus = (registration) => {
		if (registration.withdrawnAt) return "Withdrawn";
		return "Active";
	};

	const getStatusClass = (registration) => {
		if (registration.withdrawnAt) return "status-withdrawn";
		return "status-active";
	};

	if (isLoading) return <div><DataCard title="My Seminars" isEmpty={true} emptyMessage="Loading..." /></div>;

	return (
		<DataCard 
			title="My Seminars" 
			error={error}
			isEmpty={registrations.length === 0}
			emptyMessage="You haven't registered for any seminars yet."
		>
			<div className="table-wrapper">
				<table>
					<thead>
						<tr>
							<th>Seminar</th>
							<th>Professor</th>
							<th>Room</th>
							<th>Registered Date</th>
							<th>Status</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{registrations.map((reg, idx) => {
							const seminar = getSeminarInfo(reg.seminarId);
							return (
								<tr key={idx}>
									<td>{seminar.title || "N/A"}</td>
									<td>{seminar.professor || "N/A"}</td>
									<td>{seminar.room || "N/A"}</td>
									<td>{formatDate(reg.registeredAt)}</td>
									<td>
										<span className={`status-badge ${getStatusClass(reg)}`}>
											{getRegistrationStatus(reg)}
										</span>
									</td>
									<td>
										{!reg.withdrawnAt && (
											<button
												onClick={() => handleWithdraw(idx)}
												disabled={withdrawingIndex === idx}
												className="action-button btn-withdraw"
											>
												{withdrawingIndex === idx ? "Withdrawing..." : "Withdraw"}
											</button>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</DataCard>
	);
}
