import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./context/AuthProvider";
import { AppearanceProvider } from "./context/AppearanceProvider";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

import Homepage from "./pages/Homepage";
import Lobby from "./pages/Lobby";
import CreateGame from "./pages/CreateGame";
import GamePage from "./pages/GamePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserProfile from "./pages/UserProfile";
import AllUserGames from "./pages/AllUserGames";
import AboutUs from "./pages/AboutUs";
import AboutSpanishDice from "./pages/AboutSpanishDice";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

export default function App() {
  return (
    <AuthProvider>
      <AppearanceProvider>
        <Router>
          <ErrorBoundary>
            <Header />

            <main className="page-container">
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Homepage />} />
                  <Route path="/lobby" element={<Lobby />} />
                  <Route path="/create-game" element={<CreateGame />} />
                  <Route path="/game/:id" element={<GamePage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/profile/:id" element={<UserProfile />} />
                  <Route path="/profile/:id/games" element={<AllUserGames />} />
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/about-spanish-dice" element={<AboutSpanishDice />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                </Routes>
              </ErrorBoundary>
            </main>

            <Footer />
          </ErrorBoundary>
        </Router>
      </AppearanceProvider>
    </AuthProvider>
  );
}
