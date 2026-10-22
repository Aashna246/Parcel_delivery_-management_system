import { useEffect, useState } from "react";
import api from "../services/api";

export const CATEGORIES = [
  "flooding", "pothole", "roadblock", "festival-traffic", "unsafe-at-night", "accident",
];

// Badge color for each severity
export const severityColor = (severity) => {
  if (severity === "high") return "bg-danger";
  if (severity === "medium") return "bg-warning text-dark";
  return "bg-success";
};

export default function Reports() {
  const [filters, setFilters] = useState({ city: "", category: "", severity: "" });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = async () => {
    setLoading(true);
    setError("");
    try {
      // Only send the filters that are filled in
      const params = {};
      Object.keys(filters).forEach((key) => {
        if (filters[key]) params[key] = filters[key];
      });
      const res = await api.get("/reports", { params });
      setReports(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  return (
    <div>
      <h3>Route Reports</h3>

      {/* Filters */}
      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <input name="city" className="form-control" placeholder="City" value={filters.city} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <select name="category" className="form-select" value={filters.category} onChange={handleChange}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <select name="severity" className="form-select" value={filters.severity} onChange={handleChange}>
            <option value="">All severity</option>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </div>
        <div className="col-md-3">
          <button className="btn btn-primary w-100" onClick={loadReports}>Search</button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p>Loading...</p>}
      {!loading && reports.length === 0 && <p>No data found</p>}

      <div className="row">
        {reports.map((r) => (
          <div className="col-md-4 mb-3" key={r._id}>
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title text-capitalize">{r.category}</h5>
                <span className={`badge ${severityColor(r.severity)} me-2`}>{r.severity}</span>
                <span className="badge bg-secondary">{r.status}</span>
                <p className="mt-2 mb-1">{r.description}</p>
                <small className="text-muted">City: {r.city}</small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
