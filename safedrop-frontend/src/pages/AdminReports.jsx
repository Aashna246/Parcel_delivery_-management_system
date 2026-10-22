import { useEffect, useState } from "react";
import api from "../services/api";
import { severityColor } from "./Reports";

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const reportRes = await api.get("/reports");
      const statRes = await api.get("/reports/stats");
      setReports(reportRes.data);
      setStats(statRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // status is "resolved" or "rejected"
  const changeStatus = async (id, status) => {
    setError("");
    try {
      await api.put(`/reports/${id}/status`, { status });
      loadData(); // refresh table and stats
    } catch (err) {
      setError(err.response?.data?.message || "Could not update report");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h3>Manage Reports</h3>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Number of reports per category */}
      <h5 className="mt-3">Reports by Category</h5>
      {stats.length === 0 ? (
        <p>No data found</p>
      ) : (
        <div className="row mb-4">
          {stats.map((s) => (
            <div className="col-6 col-md-2 mb-2" key={s._id}>
              <div className="card text-center">
                <div className="card-body p-2">
                  <h4 className="mb-0">{s.count}</h4>
                  <small className="text-capitalize">{s._id}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All reports */}
      <h5>All Reports</h5>
      {reports.length === 0 ? (
        <p>No data found</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>City</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id}>
                  <td className="text-capitalize">{r.category}</td>
                  <td>{r.description}</td>
                  <td>{r.city}</td>
                  <td><span className={`badge ${severityColor(r.severity)}`}>{r.severity}</span></td>
                  <td><span className="badge bg-secondary">{r.status}</span></td>
                  <td>
                    <button className="btn btn-sm btn-success me-2" onClick={() => changeStatus(r._id, "resolved")}>
                      Resolve
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => changeStatus(r._id, "rejected")}>
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
