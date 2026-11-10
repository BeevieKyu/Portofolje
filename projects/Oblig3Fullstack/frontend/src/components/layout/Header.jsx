import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth";
import AppearanceCustomizer from "./AppearanceCustomizer";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      setProfilePicture(null);
      return;
    }

    const savedPicture = localStorage.getItem(`profilePicture_${user.id}`);
    setProfilePicture(savedPicture || null);
  }, [user?.id]);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="site-header">
      <Link to="/" className="logo">
        Spanish Poker Dice
      </Link>

      <nav>
        <NavLink to="/lobby">Lobby</NavLink>
        <NavLink to="/about-spanish-dice">The Game</NavLink>
      </nav>

      <AppearanceCustomizer />

      <div className="header-greeting">
        {user ? (
          <>
            <Link to={`/profile/${user.id}`} className="greeting-user">
              <span className="greeting-avatar">
                {profilePicture ? (
                  <img className="greeting-avatar-image" src={profilePicture} alt="Profile avatar" />
                ) : (
                  (user.username?.[0] || "U").toUpperCase()
                )}
              </span>
              <span className="greeting-name">Hello, {user.username}</span>
            </Link>
            <button className="greeting-logout" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="greeting-auth-link">Sign in</NavLink>
            <NavLink to="/register" className="greeting-auth-link greeting-register">Register</NavLink>
          </>
        )}
      </div>
    </header>
  );
}
