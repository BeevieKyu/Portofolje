// components/navbar.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth-context.jsx";
import HCAILogo from '../../assets/hcai-logo.png';
import "../../styles/styles.css";

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="hp-navbar">
        <Link to="/" className="hp-logo-container">
            <img
                src={HCAILogo}
                alt="HCAI Logo"
                className="hp-logo"
            />
        </Link>
        <button
            className="hp-nav-toggle"
            onClick={() => setOpen(!open)}
        >
            ☰
        </button>
        <ul className={`hp-nav-links ${open ? "open" : ""}`}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/rent">Rent</Link></li>
            <li><Link to="/seminars">Seminars</Link></li>
            <li><Link to="/research">Projects and researchers</Link></li>
        </ul>
        {user ? (
            <div className="hp-user-dropdown">
                <button 
                    className="hp-dropdown-toggle"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                    {user.username} ▼
                </button>
                <ul className={`hp-dropdown-menu ${userDropdownOpen ? "open" : ""}`}>
                    <li><Link to="/profile" onClick={() => { setUserDropdownOpen(false); setOpen(false); }}>Profile</Link></li>
                    {!isAdmin && (
                        <>
                            <li><Link to="/my-rentals" onClick={() => { setUserDropdownOpen(false); setOpen(false); }}>My Rentals</Link></li>
                            <li><Link to="/my-seminars" onClick={() => { setUserDropdownOpen(false); setOpen(false); }}>My Seminars</Link></li>
                        </>
                    )}
                    {isAdmin && (
                        <>
                            <li><Link to="/my-rentals" onClick={() => { setUserDropdownOpen(false); setOpen(false); }}>My Rentals</Link></li>
                            <li><Link to="/my-seminars" onClick={() => { setUserDropdownOpen(false); setOpen(false); }}>My Seminars</Link></li>
                            <li style={{ borderTop: "1px solid #e0e0e0", marginTop: "0.5rem", paddingTop: "0.5rem" }}>
                                <Link to="/admin/home" onClick={() => { setUserDropdownOpen(false); setOpen(false); }}>Admin Home</Link>
                            </li>
                            <li><Link to="/admin/seminars" onClick={() => { setUserDropdownOpen(false); setOpen(false); }}>Edit Seminars</Link></li>
                            <li><Link to="/admin/inventory" onClick={() => { setUserDropdownOpen(false); setOpen(false); }}>Lab Inventory</Link></li>
                        </>
                    )}
                    <li><button onClick={() => { handleLogout(); setUserDropdownOpen(false); }} style={{ width: "100%", textAlign: "left", padding: "0.75rem 1.5rem", border: "none", background: "none", cursor: "pointer", color: "inherit", fontSize: "0.9rem" }}>Logout</button></li>
                </ul>
            </div>
        ) : (
            <Link to="/login" className="hp-auth-btn">Login</Link>
        )}
    </nav>
    );
}