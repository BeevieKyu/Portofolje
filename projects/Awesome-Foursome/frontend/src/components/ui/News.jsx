import { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import EVENTImg from '../../assets/events.png';

const NEWS_ENDPOINT = '/api/v1/news';

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiRequest(NEWS_ENDPOINT)
      .then(setNews)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="hp-section-container hp-section-white" id="hp-news-section">
      <h2 className="hp-section-title-dark">News</h2>

      {loading && <p className="hp-news-status">Loading...</p>}
      {error && <p className="hp-news-status hp-news-error">{error}</p>}

      <div className="hp-news-list-container">
        {news.slice(0, 4).map((item) => (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hp-news-card"
            key={item.id}
          >
            <img
              src={item.imageUrl || EVENTImg}
              alt={item.title || 'News'}
              className="hp-news-thumb"
            />
            <div className="hp-news-content">
              <p className="hp-news-text">{item.body}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
