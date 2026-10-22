import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Usage: <ProtectedRoute roles={["admin"]}><Page /></ProtectedRoute>
// If roles is left out, any logged-in user can open the page.
export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  // Not logged in -> login page
  if (!user) return <Navigate to="/login" replace />;

  // Wrong role -> dashboard
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
