import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// Small reusable card
function Card({ title, value, link, color }) {
  return (
    <div className="col-md-4 mb-3">
      <div className={`card text-white bg-${color}`}>
        <div className="card-body">
          <h6>{title}</h6>
          {value !== undefined && <h2>{value}</h2>}
          {link && <Link to={link} className="btn btn-light btn-sm">Open</Link>}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [parcels, setParcels] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load the numbers this role needs
  useEffect(() => {
    const loadData = async () => {
      try {
        const parcelRes = await api.get("/parcels");
        setParcels(parcelRes.data);
        if (user.role === "admin") {
          const reportRes = await api.get("/reports");
          setReports(reportRes.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Could not load dashboard");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user.role]);

  if (loading) return <p>Loading...</p>;

  const delivered = parcels.filter((p) => p.status === "delivered").length;

  return (
    <div>
      <h3>Welcome, {user.name}</h3>
      <p className="text-muted">Logged in as {user.role}</p>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        {user.role === "customer" && (
          <>
            <Card title="My Parcels" value={parcels.length} link="/my-parcels" color="primary" />
            <Card title="Delivered" value={delivered} color="success" />
            <Card title="Send a new parcel" link="/create-parcel" color="dark" />
          </>
        )}

        {user.role === "agent" && (
          <>
            <Card title="Assigned Parcels" value={parcels.length} link="/my-parcels" color="primary" />
            <Card title="Delivered" value={delivered} color="success" />
            <Card title="Report a road issue" link="/report-issue" color="dark" />
          </>
        )}

        {user.role === "admin" && (
          <>
            <Card title="Total Parcels" value={parcels.length} link="/my-parcels" color="primary" />
            <Card title="Total Reports" value={reports.length} link="/admin/reports" color="danger" />
            <Card title="Delivered" value={delivered} color="success" />
          </>
        )}
      </div>
    </div>
  );
}
