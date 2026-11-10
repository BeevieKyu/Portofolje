// Main application component - defines all routes
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/auth-context.jsx"; // Global auth state

// Pages
import RentPage from "./pages/RentPage.jsx";
import Homepage from "./pages/HomePage.jsx";
import InventoryPage from "./pages/InventoryPage.jsx";
import LoginPage from "./pages/login.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ScreenPage from "./pages/ScreenPage.jsx";
import AdminHomePage from "./pages/AdminHomePage.jsx";
import SeminarsPage from "./pages/SeminarsPage.jsx";
import ResearchPage from "./pages/ResearchPage.jsx";
import ResearcherProfilePage from "./pages/ResearcherProfilePage.jsx";
import EditSeminar from "./pages/EditSeminar.jsx";
import MyRentalsPage from "./pages/MyRentalsPage.jsx";
import MySeminarsPage from "./pages/MySeminarsPage.jsx";

// Route protection wrapper - only admins can access
function AdminRoute({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/login" replace />; // Redirect if not admin
}

// Route protection wrapper - only logged-in users can access
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />; // Redirect if not logged in
}

export default function App() {
  return (
    <AuthProvider> {/* Provide auth context to entire app */}
      <Routes>
        {/* Public pages - anyone can view */}
        <Route path="/" element={<Homepage />} />
        <Route path="/rent" element={<RentPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/seminars" element={<SeminarsPage />} />
        <Route path="/research" element={<ResearchPage />} />
            <Route path="/researchers/:id" element={<ResearcherProfilePage />} />
        <Route path="/screen" element={<ScreenPage />} />

        {/* Protected pages - logged-in users only */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/my-rentals" element={<ProtectedRoute><MyRentalsPage /></ProtectedRoute>} />
        <Route path="/my-seminars" element={<ProtectedRoute><MySeminarsPage /></ProtectedRoute>} />

        {/* Admin-only pages - requires admin role */}
        <Route path="/admin/home" element={<AdminRoute><AdminHomePage /></AdminRoute>} />
        <Route path="/admin/inventory" element={<AdminRoute><InventoryPage /></AdminRoute>} />
        <Route path="/admin/seminars" element={<AdminRoute><EditSeminar /></AdminRoute>} />
      </Routes>
    </AuthProvider>
  );
}
