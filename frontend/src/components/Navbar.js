// frontend/src/components/Navbar.js - COMPLETE REPLACEMENT
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "../hooks/use-toast";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [requestCount, setRequestCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRequestCount();
      const interval = setInterval(fetchRequestCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchRequestCount = async () => {
    try {
      const response = await api.get("/collaboration/requests/received");
      setRequestCount(response.data?.length || 0);
    } catch (error) {
      console.error("Error fetching request count:", error);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    if (!window.confirm("Are you sure you want to logout?")) {
      return;
    }
    
    setIsLoggingOut(true);
    
    try {
      console.log('🚪 Logging out...');
      
      // Call logout from AuthContext (clears localStorage and state)
      await logout();
      
      toast({ 
        title: "Logged out successfully", 
        description: "See you next time!",
        variant: 'success' 
      });
      
      // Redirect to home page
      navigate("/");
      
    } catch (error) {
      console.error("❌ Error logging out:", error);
      toast({ 
        title: "Logout failed", 
        description: "Please try again",
        variant: 'error' 
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
          <i className="bi bi-music-note-beamed me-2"></i>
          TuneTogether
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            {user ? (
              <>
                <li className="nav-item">
                  <Link
                    to="/explore"
                    className={`nav-link ${isActive("/explore") ? "active" : ""}`}
                  >
                    <i className="bi bi-compass me-1"></i> Explore
                  </Link>
                </li>
                
                <li className="nav-item">
                  <Link
                    to="/my-projects"
                    className={`nav-link ${isActive("/my-projects") ? "active" : ""}`}
                  >
                    <i className="bi bi-folder me-1"></i> My Projects
                  </Link>
                </li>
                
                <li className="nav-item">
                  <Link
                    to="/find-collaborators"
                    className={`nav-link ${isActive("/find-collaborators") ? "active" : ""}`}
                  >
                    <i className="bi bi-people me-1"></i> Collaborators
                  </Link>
                </li>
                
                <li className="nav-item">
                  <Link
                    to="/requests"
                    className={`nav-link position-relative ${isActive("/requests") ? "active" : ""}`}
                  >
                    <i className="bi bi-bell me-1"></i> Requests
                    {requestCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {requestCount}
                        <span className="visually-hidden">unread messages</span>
                      </span>
                    )}
                  </Link>
                </li>

                <li className="nav-item dropdown">
                  <button
                    className="btn btn-link nav-link dropdown-toggle d-flex align-items-center"
                    id="profileDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle me-1"></i>
                    {user.username}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="bi bi-person me-2"></i> Profile
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        onClick={handleLogout} 
                        className="dropdown-item text-danger"
                        disabled={isLoggingOut}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i> 
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/signup" className="btn btn-primary ms-2">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};