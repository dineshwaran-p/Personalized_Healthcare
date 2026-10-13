import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import HealthTracking from "./pages/HealthTracking";
import AIAnalysis from "./pages/AIAnalysis";
import ExpertCare from "./pages/ExpertCare";
import DietPlans from "./pages/DietPlans";
import AuthPage from "./pages/Auth/AuthPage";
import LearnMore from "./pages/LearnMore";
import ReturnToTop from "./components/ReturnToTop";
import MouseFollower from "./components/MouseFollower";
import Profile from "./components/Profile";
import { trackPendoEvent } from "./utils/pendo";

// eslint-disable-next-line react/prop-types -- this codebase does not declare PropTypes
function ProtectedRoute({ isAuthenticated, children }) {
  const location = useLocation();
  return isAuthenticated ? children : <Navigate to="/auth" state={{ from: location.pathname, message: "Please log in to access this page." }} />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const parts = token.split(".");
        if (parts.length !== 3) throw new Error("Invalid token format");

        const tokenData = JSON.parse(atob(parts[1]));
        const isExpired = tokenData.exp * 1000 < Date.now();

        if (isExpired) {
          localStorage.removeItem("token");
          // Pendo: user silently logged out because the stored JWT expired.
          // The token payload only carries id/iat/exp, so tokenData.id is the only identifier.
          trackPendoEvent("session_expired", {
            reason: "token_expired",
            userId: tokenData.id,
            expiredAt: tokenData.exp, // JWT exp claim, seconds since epoch
          });
          setIsAuthenticated(false);
          setUser(null);
        } else {
          setIsAuthenticated(true);
          setUser({ name: tokenData.name, email: tokenData.email });
        }
      } catch (error) {
        console.error("Token decoding error:", error);
        // Pendo: user silently logged out because the stored token could not be decoded
        trackPendoEvent("session_expired", { reason: "invalid_token" });
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUser(null);
      }
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <MouseFollower />
        <Header user={user} isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        
        {/* Show Profile icon only if logged in */}
        {isAuthenticated && (
          <Profile
            user={user}
            onLogout={() => {
              localStorage.removeItem("token");
              setIsAuthenticated(false);
              setUser(null);
            }}
          />
        )}

        <Routes>
          {/* Public Route */}
          <Route path="/" element={<main><Hero /><Features /><Testimonials /></main>} />
          <Route path="/auth" element={<AuthPage setIsAuthenticated={setIsAuthenticated} setUser={setUser} />} />
          <Route path="/login" element={<Navigate to="/auth" />} />
          <Route path="/signup" element={<Navigate to="/auth" state={{ isSignUp: true }} />} />

          {/* Protected Routes */}
          <Route path="/health-tracking" element={<ProtectedRoute isAuthenticated={isAuthenticated}><HealthTracking /></ProtectedRoute>} />
          <Route path="/ai-analysis" element={<ProtectedRoute isAuthenticated={isAuthenticated}><AIAnalysis /></ProtectedRoute>} />
          <Route path="/ai-analysis/learn-more" element={<ProtectedRoute isAuthenticated={isAuthenticated}><LearnMore /></ProtectedRoute>} />
          <Route path="/expert-care" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ExpertCare /></ProtectedRoute>} />
          <Route path="/diet-plans" element={<ProtectedRoute isAuthenticated={isAuthenticated}><DietPlans /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Profile user={user} onLogout={() => {
            localStorage.removeItem("token");
            setIsAuthenticated(false);
            setUser(null);
          }} /></ProtectedRoute>} />
        </Routes>
        <Footer />
        <ReturnToTop />
      </div>
    </Router>
  );
}

export default App;
