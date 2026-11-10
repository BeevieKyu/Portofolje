import React, { useState, useEffect } from "react";
import "../styles/styles.css";
import HEROImg from '../assets/HCAIimg.jpeg';
import EVENTImg from '../assets/events.png';
import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer.jsx';
import Navbar from '../components/layout/navbar.jsx';
import News from '../components/ui/News.jsx';
import { apiRequest } from '../utils/api.js';


export default function Homepage() {
  const [seminars, setSeminars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSeminars = async () => {
      try {
        const data = await apiRequest("/api/v1/seminars?current=true");
        // Handle both direct array and wrapped response
        const seminarsArray = Array.isArray(data) ? data : (data?.data || []);
        // Get first 3 seminars for display
        setSeminars(seminarsArray.slice(0, 3));
      } catch (err) {
        setError(err.message);
        console.error("Failed to load seminars:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSeminars();
  }, []);
  return (
    <div id="hp-body-wrapper">
      {/* Navigation Bar */}
      <Navbar />

      {/* Hero Section */}
      <header className="hp-hero-section">
        <img src={HEROImg} alt="Hero" className="hp-hero-img" />
        <div className="hp-hero-overlay">
          <h1 className="hp-hero-text">Welcome to the Human Centered AI lab</h1>
        </div>
      </header>

      {/* Quick Links Bar */}
      <nav className="hp-quicklinks-bar">
        <Link to="/rent" className="hp-quick-card">
          <h3>Renting</h3>
          <p>Rent equipment here</p>
        </Link>
        <Link to="/seminars" className="hp-quick-card">
          <h3>Seminars</h3>
          <p>Find Seminars here</p>
        </Link>
        <Link to="/research" className="hp-quick-card">
          <h3>Research</h3>
          <p>Find research here</p>
        </Link>
      </nav>

      {/* Main Content */}
      <main>
        {/* About Section */}
        <section className="hp-mission-container">
          <h2 className="hp-mission-title">Our mission</h2>
          <p className="hp-mission-body">
            Situated at the intersection of AI and HCI, we focus on
            methodologies prioritising the human perspective, ensuring that AI
            technologies serve as responsive and responsible extensions of human
            intent and values. We aim to establish guidelines and methods for
            designing with and for AI-powered systems that align with human
            needs and values.
          </p>
        </section>
        {/* Events Section */}
        <section className="hp-section-container" id="hp-events-section">
          <h2 className="hp-section-title">Events</h2>
          {error && (
            <p style={{ color: "red", textAlign: "center" }}>{error}</p>
          )}
          {isLoading ? (
            <p style={{ textAlign: "center" }}>Loading seminars...</p>
          ) : seminars.length === 0 ? (
            <p style={{ textAlign: "center" }}>No seminars available</p>
          ) : (
            <div className="hp-events-grid">
              {seminars.map((seminar, idx) => (
                <div key={idx} className="hp-event-card">
                  <img
                    src={seminar.image || EVENTImg}
                    alt={seminar.title}
                    className="hp-event-placeholder"
                  />
                  <div className="hp-event-info">
                    <h3>{seminar.title}</h3>
                    <p className="hp-event-professor">{seminar.professor}</p>
                    <p className="hp-event-time">
                      {seminar.time} | {seminar.room}
                    </p>
                  </div>
                  <Link to="/seminars" className="hp-learn-more">
                    Learn more →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* News Section */}
        <News />
      </main>

      {/* Footer */}

      <Footer />
    </div>
  );
}
