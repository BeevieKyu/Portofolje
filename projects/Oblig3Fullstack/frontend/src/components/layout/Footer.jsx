import { Link } from "react-router-dom";

const FOUNDED = 2026;

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const yearRange = currentYear > FOUNDED ? `${FOUNDED}–${currentYear}` : `${FOUNDED}`;

  return (
    <footer className="site-footer">
      <Link to="/about-us">About Us</Link>
      <Link to="/terms">Terms</Link>
      <Link to="/privacy">Privacy</Link>
      <span>© {yearRange} Spanish Poker Dice</span>
    </footer>
  );
}
