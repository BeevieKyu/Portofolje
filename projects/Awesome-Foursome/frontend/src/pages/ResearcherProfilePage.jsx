import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import "../styles/styles.css";
import "../styles/_ResearcherPage.scss";
import Navbar from '../components/layout/navbar.jsx';
import Footer from '../components/layout/Footer.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:2169";

function PublicationCard({ pub }) {
  return (
    <div className="rp-pub-card">
      <p className="rp-pub-title">
        {pub.url ? (
          <a href={pub.url} target="_blank" rel="noopener noreferrer" className="rp-pub-link">
            {pub.title}
          </a>
        ) : pub.title}
        {pub.year && <span className="rp-pub-year"> ({pub.year})</span>}
      </p>
      {pub.researchers && <p className="rp-pub-authors">{pub.researchers}</p>}
      {pub.venue && <p className="rp-pub-venue">{pub.venue}</p>}
    </div>
  );
}

export default function ResearcherProfilePage() {
  const { id } = useParams();
  const [researcher, setResearcher] = useState(null);
  const [publications, setPublications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [researcherRes, pubsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/researchers/${id}`),
          fetch(`${API_BASE_URL}/api/v1/research`),
        ]);
        if (!researcherRes.ok) throw new Error("Researcher not found");
        const researcherData = await researcherRes.json();
        const allPubs = await pubsRes.json();

        setResearcher(researcherData);

        const pubs = allPubs
          .filter(p => p.researcherRef === researcherData._id)
          .sort((a, b) => (b.year || 0) - (a.year || 0));
        setPublications(pubs);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  if (isLoading) return (
    <div id="hp-body-wrapper">
      <Navbar />
      <main className="rp-main"><p>Loading...</p></main>
      <Footer />
    </div>
  );

  if (error || !researcher) return (
    <div id="hp-body-wrapper">
      <Navbar />
      <main className="rp-main"><p>{error || "Researcher not found."}</p></main>
      <Footer />
    </div>
  );

  const initials = researcher.name.split(" ").map(p => p[0]).join("").slice(0, 2);

  return (
    <div id="hp-body-wrapper">
      <Navbar />

      <main className="rp-main">

        <section className="rp-header">
          <div className="rp-avatar">
            {researcher.photo && !imgError ? (
              <img
                src={researcher.photo}
                alt={researcher.name}
                className="rp-photo"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="rp-photo-fallback">{initials}</div>
            )}
          </div>
          <div className="rp-info">
            <h1 className="rp-name">{researcher.name}</h1>
            {researcher.title && <p className="rp-title">{researcher.title}</p>}
            {researcher.email && (
              <p className="rp-email">
                <a href={`mailto:${researcher.email}`}>{researcher.email}</a>
              </p>
            )}
            {researcher.researchInterests?.length > 0 && (
              <div className="rp-interests">
                {researcher.researchInterests.map((interest, i) => (
                  <span key={i} className="research-keyword">{interest}</span>
                ))}
              </div>
            )}
          </div>
        </section>

        {researcher.bio && (
          <section className="rp-section">
            <h2 className="rp-section-title">About</h2>
            <p className="rp-bio">{researcher.bio}</p>
          </section>
        )}

        <section className="rp-section">
          <h2 className="rp-section-title">Publications</h2>
          {publications.length === 0 ? (
            <p style={{ color: "#ccc" }}>No publications found.</p>
          ) : (
            <div className="rp-pub-list">
              {publications.map((pub) => (
                <PublicationCard key={pub._id} pub={pub} />
              ))}
            </div>
          )}
        </section>

        <Link to="/research" className="rp-back">← Back to researchers</Link>

      </main>

      <Footer />
    </div>
  );
}
