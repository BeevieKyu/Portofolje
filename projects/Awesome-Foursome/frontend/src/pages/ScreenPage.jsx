import { useState, useEffect } from "react";
import "../styles/styles.css";
import News from '../components/ui/News.jsx';
import CurrentSeminars from '../components/ui/CurrentSeminars.jsx';

function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('no-NO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="infoboard__clock">
      <span className="infoboard__time">{timeStr}</span>
      <span className="infoboard__date">{dateStr}</span>
    </div>
  );
}

export default function ScreenPage() {
  return (
    <main className="screen-page">
      <div className="infoboard">
        <header className="infoboard__header">
          <div className="infoboard__header-left">
            <h1>AI Lab</h1>
            <p>InfoBoard</p>
          </div>
          <LiveClock />
        </header>

        <section className="infoboard__content">
          <article className="board-card board-card--about">
            <div className="board-card__label">About Us</div>
            <p className="board-about__tagline">Mission: Designing and evaluating AI systems with and for people, focusing on aligning technology with human needs and values</p>
            <p className="board-about__tagline">Situated at the intersection of AI and HCI, we focus on methodologies prioritising the human perspective, ensuring that AI technologies serve as responsive and responsible extensions of human intent and values. We aim to establish guidelines and methods for designing with and for AI-powered systems that align with human needs and values.</p>
            <ul className="board-about__list">
              <li>Cutting-edge AI research</li>
              <li>Open seminars and events</li>
              <li>Collaborative innovation</li>
            </ul>
          </article>

          <article className="board-card board-card--seminars">
            <div className="board-card__label">Upcoming Seminars</div>
            <CurrentSeminars showRegisterButton={false} />
          </article>

          <article className="board-card board-card--news">
            <div className="board-card__label">Latest News</div>
            <News />
          </article>
        </section>
      </div>
    </main>
  );
}
