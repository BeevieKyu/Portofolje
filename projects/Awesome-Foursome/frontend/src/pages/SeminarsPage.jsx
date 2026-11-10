import { useEffect, useState } from 'react';
import "../styles/styles.css";
import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer.jsx';
import CurrentSeminars, { SeminarCard } from '../components/ui/CurrentSeminars.jsx';
import Navbar from '../components/layout/navbar.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:2169";

export default function Seminars() {
  const [previousSeminars, setPreviousSeminars] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const LIMIT = 6;

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_BASE_URL}/api/v1/seminars?current=false&page=${currentPage}&limit=${LIMIT}`)
      .then((r) => r.json())
      .then((data) => {
        setPreviousSeminars(data.data || data);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
        }
      })
      .catch(() => {
        setPreviousSeminars([]);
      })
      .finally(() => setIsLoading(false));
  }, [currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div id="hp-body-wrapper">

      {/* Navigation Bar*/}
      <Navbar />

      {/* Main Content */}
      <main className="seminars-main">

        {/* Current Seminars */}
        <CurrentSeminars />

        {/* Previous Seminars */}
        {previousSeminars.length > 0 && (
          <section className="seminars-section">
            <h2 className="seminars-section-title">Previous seminars</h2>
            <div className="seminars-list">
              {previousSeminars.map((seminar) => (
                <SeminarCard key={seminar._id} seminar={seminar} />
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
        )}

      </main>

      <Footer />
    </div>
  );
}
