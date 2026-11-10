import Navbar from './navbar.jsx';
import Footer from './Footer.jsx';
import "../../styles/styles.css";

export default function DataCard({ title, children, error, isEmpty, emptyMessage }) {
  return (
    <div className="data-page">
      <header className="data-header">
        <Navbar />
      </header>
      <main className="data-content">
        <div className="data-card">
          <h1>{title}</h1>
          {error && <p className="error-message">{error}</p>}
          
          {isEmpty ? (
            <p className="empty-state">{emptyMessage}</p>
          ) : (
            children
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
