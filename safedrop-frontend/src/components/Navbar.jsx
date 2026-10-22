import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">SafeDrop</Link>

        <div className="navbar-nav me-auto">
          {/* Everyone can track a parcel */}
          <Link className="nav-link" to="/track">Track Parcel</Link>

          {/* Any logged-in user */}
          {user && <Link className="nav-link" to="/dashboard">Dashboard</Link>}
          {user && <Link className="nav-link" to="/reports">Reports</Link>}

          {/* Customer */}
          {user?.role === "customer" && (
            <>
              <Link className="nav-link" to="/create-parcel">Create Parcel</Link>
              <Link className="nav-link" to="/my-parcels">My Parcels</Link>
            </>
          )}

          {/* Agent */}
          {user?.role === "agent" && (
            <>
              <Link className="nav-link" to="/my-parcels">Assigned Parcels</Link>
              <Link className="nav-link" to="/report-issue">Report Issue</Link>
            </>
          )}

          {/* Admin */}
          {user?.role === "admin" && (
            <>
              <Link className="nav-link" to="/my-parcels">All Parcels</Link>
              <Link className="nav-link" to="/report-issue">Report Issue</Link>
              <Link className="nav-link" to="/admin/reports">Manage Reports</Link>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="d-flex align-items-center">
          {user ? (
            <>
              <span className="text-white me-3">{user.name} ({user.role})</span>
              <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link className="btn btn-outline-light btn-sm me-2" to="/login">Login</Link>
              <Link className="btn btn-light btn-sm" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
