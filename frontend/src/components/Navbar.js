import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      alert("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Error signing out");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <span className="fw-bold">TuneTogether</span>
        </Link>
        <div className="d-flex ms-auto">
          {user ? (
            <div className="d-flex align-items-center">
              <Link to="/profile" className="btn btn-link me-2">
                Profile
              </Link>
              <button className="btn btn-outline-primary" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center">
              <Link to="/login" className="btn btn-link me-2">
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
