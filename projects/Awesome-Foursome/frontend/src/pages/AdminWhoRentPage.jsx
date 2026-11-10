import { useEffect, useState } from "react";
import { useAuth } from "../context/auth-context.jsx";
import Navbar from "../components/layout/navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import { apiRequest } from "../utils/api.js";
import "../styles/styles.css";

export default function AdminWhoRentPage() {
  const { authHeaders, isAdmin, user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  console.log("[DEBUG] AdminWhoRentPage mounted");
  console.log("[DEBUG] User:", user);
  console.log("[DEBUG] IsAdmin:", isAdmin);
  console.log("[DEBUG] AuthHeaders:", authHeaders);

  useEffect(() => {
    if (!isAdmin) {
      console.error("[ERROR] User is not admin, cannot fetch rentals");
      setError("Admin access required");
      setIsLoading(false);
      return;
    }

    const fetchRentals = async () => {
      try {
        console.log("[DEBUG] Fetching rentals with headers:", authHeaders);
        const data = await apiRequest("/api/v1/rentals/admin/all", {
          headers: authHeaders,
        });
        console.log("[DEBUG] Rentals fetched:", data);
        setRentals(data);
      } catch (err) {
        console.error("[ERROR] Failed to fetch rentals:", err.message);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRentals();
  }, [authHeaders, isAdmin]);

  return (
    <>
      <Navbar />
      <main className="admin-who-rent-page">
        <h1>Rental Overview</h1>

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
                    rentalRecord.rental.itemId?.name || "Unknown Item";
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
      </main>
      <Footer />
    </>
  );
}
