import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import "../styles/styles.css";
import "../styles/_Research.scss";
import Footer from '../components/layout/Footer.jsx';
import Navbar from '../components/layout/navbar.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:2169";

function ResearcherCard({ researcher }) {
  const [imgError, setImgError] = useState(false);
  const TITLE_PREFIXES = new Set(["dr.", "dr", "prof.", "prof", "mr.", "mr", "ms.", "ms", "mrs.", "mrs"]);
  const nameParts = researcher.name.split(" ").filter(p => !TITLE_PREFIXES.has(p.toLowerCase()));
  const initials = nameParts.map(p => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Link to={`/researchers/${researcher._id}`} className="rc-card">
      <div className="rc-photo-wrap">
        {researcher.photo && !imgError ? (
          <img
            src={researcher.photo}
            alt={researcher.name}
            className="rc-photo"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="rc-photo-fallback">{initials}</div>
        )}
      </div>
      <div className="rc-info">
        <p className="rc-name">{researcher.name}</p>
        {researcher.title && <p className="rc-title">{researcher.title}</p>}
        {researcher.researchInterests?.length > 0 && (
          <div className="rc-tags">
            {researcher.researchInterests.slice(0, 3).map((t, i) => (
              <span key={i} className="research-keyword">{t}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

function PublicationCard({ project }) {
  return (
    <div className="research-result-card">
      <h3 className="research-result-title">
        {project.url ? (
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="research-result-title-link">
            {project.title}
          </a>
        ) : project.title}
        {project.year && <span className="research-result-year"> ({project.year})</span>}
      </h3>
      {project.researchers && (
        <p className="research-result-researchers">
          {project.researcherRef ? (
            <Link to={`/researchers/${project.researcherRef}`} className="research-result-researcher-link">
              {project.researchers}
            </Link>
          ) : project.researchers}
        </p>
      )}
      {project.venue && <p className="research-result-venue">{project.venue}</p>}
      {project.tags?.length > 0 && (
        <div className="research-result-tags">
          {project.tags.map((tag, i) => (
            <span key={i} className="research-keyword">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Research() {
  const [searchQuery, setSearchQuery] = useState("");
  const [researchers, setResearchers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [rRes, pRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/researchers`),
          fetch(`${API_BASE_URL}/api/v1/research`),
        ]);
        if (!rRes.ok || !pRes.ok) throw new Error("Failed to fetch data");
        const [rData, pData] = await Promise.all([rRes.json(), pRes.json()]);
        setResearchers(rData);
        setProjects(pData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const q = searchQuery.toLowerCase();

  const filteredResearchers = researchers.filter(r =>
    !q ||
    r.name.toLowerCase().includes(q) ||
    r.title?.toLowerCase().includes(q) ||
    r.researchInterests?.some(i => i.toLowerCase().includes(q))
  );

  const filteredProjects = projects.filter(p =>
    !q ||
    p.title.toLowerCase().includes(q) ||
    p.researchers?.toLowerCase().includes(q) ||
    p.venue?.toLowerCase().includes(q) ||
    p.tags?.some(t => t.toLowerCase().includes(q))
  );

  const allTags = [...new Set([
    ...researchers.flatMap(r => r.researchInterests || []),
    ...projects.flatMap(p => p.tags || []),
  ])];

  return (
    <div id="hp-body-wrapper">
      <Navbar />

      <main className="research-main">

        {/* Search bar */}
        <div className="research-search-box">
          <input
            type="text"
            className="research-search-input"
            placeholder="Search researchers or publications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="research-search-btn" onClick={() => {}}>Search</button>
        </div>

        {/* Keywords */}
        {allTags.length > 0 && (
          <div className="research-keywords-box">
            <p className="research-keywords-title">Popular Keywords</p>
            <div className="research-keywords-grid">
              {allTags.map((tag, i) => (
                <span key={i} className="research-keyword" onClick={() => setSearchQuery(tag)}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {isLoading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* Researchers */}
        {!isLoading && filteredResearchers.length > 0 && (
          <section className="research-results-section">
            <h2 className="research-results-title">Researchers</h2>
            <div className="rc-grid">
              {filteredResearchers.map(r => (
                <ResearcherCard key={r._id} researcher={r} />
              ))}
            </div>
          </section>
        )}

        {/* Publications */}
        {!isLoading && filteredProjects.length > 0 && (
          <section className="research-results-section">
            <h2 className="research-results-title">Publications</h2>
            <div className="research-results-list">
              {filteredProjects.map(p => (
                <PublicationCard key={p._id} project={p} />
              ))}
            </div>
          </section>
        )}

        {!isLoading && !error && filteredResearchers.length === 0 && filteredProjects.length === 0 && (
          <p style={{ color: "#ccc" }}>No results found.</p>
        )}

      </main>

      <Footer />
    </div>
  );
}
