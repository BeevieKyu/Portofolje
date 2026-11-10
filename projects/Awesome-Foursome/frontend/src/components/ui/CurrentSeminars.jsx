import { useEffect, useState } from "react";
import { useAuth } from "../../context/auth-context.jsx";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:2169";

export function SeminarCard({ seminar, onBookingChange, showRegisterButton = true }) {
  const { user, authHeaders } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const capacity = seminar.capacity || 50;
  const bookedSpots = (seminar.registeredUsers && Array.isArray(seminar.registeredUsers)) 
    ? seminar.registeredUsers.filter(id => id !== null && id !== undefined).length 
    : 0;
  const availableSpots = capacity - bookedSpots;
  const isFullyBooked = availableSpots <= 0;

  useEffect(() => {
    if (user) {
      checkRegistrationStatus();
    }
  }, [user, seminar._id]);

  const checkRegistrationStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/${user.uid}/seminars`, {
        headers: authHeaders,
      });
      const data = await response.json();
      const registeredSeminarIds = (data.seminarRegistrations || [])
        .filter(reg => !reg.withdrawnAt)
        .map(reg => reg.seminarId);
      
      setIsRegistered(registeredSeminarIds.includes(seminar._id));
    } catch (err) {
      console.error("Error checking registration:", err);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      setError("Please log in to register");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/seminars/${seminar._id}/register`, {
        method: "POST",
        headers: authHeaders,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to register");
      }

      // Refresh registration status and seminar data
      await checkRegistrationStatus();
      if (onBookingChange) onBookingChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="seminar-card">
      {seminar.image && (
        <img src={seminar.image.startsWith("/") ? `${API_BASE_URL}${seminar.image}` : seminar.image} alt={seminar.title} className="seminar-card-thumb" />
      )}
      <div className="seminar-card-body">
        <h1 className="seminar-card-title">{seminar.title}</h1>
        <p className="seminar-card-desc">{seminar.description}</p>
        <div className="seminar-card-meta">
          <p>Professor: {seminar.professor}</p>
          <p>Room: {seminar.room}</p>
          <p>Time: {seminar.time}</p>
        </div>
        
        <div className={`seminar-capacity ${isFullyBooked ? 'seminar-capacity--full' : ''}`}>
          <span className="capacity-info">
            {bookedSpots}/{capacity} Booked
          </span>
          <span className={`capacity-spots ${isFullyBooked ? 'spots-full' : ''}`}>
            {availableSpots} spots available
          </span>
        </div>

        {error && <p className="seminar-error">{error}</p>}
        
        {showRegisterButton && user && !isRegistered && (
          <button 
            className="seminar-register-btn"
            onClick={handleRegister}
            disabled={isLoading || isFullyBooked || !seminar.isCurrent}
            title={!seminar.isCurrent ? "Cannot register for past seminars" : ""}
          >
            {!seminar.isCurrent ? "Past Seminar" : isFullyBooked ? "Fully Booked" : isLoading ? "Registering..." : "Register"}
          </button>
        )}
        
        {showRegisterButton && isRegistered && (
          <div className="seminar-registered-badge">✓ Registered</div>
        )}
      </div>
    </div>
  );
}

export default function CurrentSeminars({ showRegisterButton = true }) {
  const [seminars, setSeminars] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const LIMIT = 6;

  const loadSeminars = () => {
    setIsLoading(true);
    fetch(`${API_BASE_URL}/api/v1/seminars?current=true&page=${currentPage}&limit=${LIMIT}`)
      .then((r) => r.json())
      .then((data) => {
        setSeminars(data.data || data);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
        }
      })
      .catch(() => {
        setSeminars([]);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadSeminars();
  }, [currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (seminars.length === 0) return null;

  return (
    <section className="seminars-section">
      <h2 className="seminars-section-title">Current seminars</h2>
      <div className="seminars-list">
        {seminars.slice(0, 4).map((seminar) => (
          <SeminarCard key={seminar._id} seminar={seminar} showRegisterButton={showRegisterButton} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button 
            className="pagination-btn"
            onClick={handlePrevPage}
            disabled={currentPage === 1 || isLoading}
          >
            ← Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            className="pagination-btn"
            onClick={handleNextPage}
            disabled={currentPage === totalPages || isLoading}
          >
            Next →
          </button>
        </div>
      )}
    </section>
  );
}
