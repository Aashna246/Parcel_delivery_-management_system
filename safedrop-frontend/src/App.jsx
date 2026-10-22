import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateParcel from "./pages/CreateParcel";
import MyParcels from "./pages/MyParcels";
import TrackParcel from "./pages/TrackParcel";
import Reports from "./pages/Reports";
import ReportIssue from "./pages/ReportIssue";
import AdminReports from "./pages/AdminReports";

export default function App() {
  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/track" element={<TrackParcel />} />

          {/* Any logged-in user */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/my-parcels" element={<ProtectedRoute><MyParcels /></ProtectedRoute>} />

          {/* Customer only */}
          <Route
            path="/create-parcel"
            element={<ProtectedRoute roles={["customer"]}><CreateParcel /></ProtectedRoute>}
          />

          {/* Agent and admin */}
          <Route
            path="/report-issue"
            element={<ProtectedRoute roles={["agent", "admin"]}><ReportIssue /></ProtectedRoute>}
          />

          {/* Admin only */}
          <Route
            path="/admin/reports"
            element={<ProtectedRoute roles={["admin"]}><AdminReports /></ProtectedRoute>}
          />

          <Route path="*" element={<h3>Page not found</h3>} />
        </Routes>
      </div>
    </>
  );
}
