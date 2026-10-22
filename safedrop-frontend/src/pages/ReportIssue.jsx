import { useState } from "react";
import api from "../services/api";
import { CATEGORIES } from "./Reports";

const emptyForm = {
  category: "flooding", description: "", severity: "low", lng: "", lat: "", city: "",
};

export default function ReportIssue() {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/reports", {
        ...form,
        lng: Number(form.lng),
        lat: Number(form.lat),
      });
      setSuccess("Report submitted successfully");
      setForm(emptyForm);
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit report");
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card p-4">
          <h3 className="mb-3">Report an Issue</h3>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Category</label>
              <select name="category" className="form-select" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-control" value={form.description} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Severity</label>
              <select name="severity" className="form-select" value={form.severity} onChange={handleChange}>
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">City</label>
              <input name="city" className="form-control" value={form.city} onChange={handleChange} required />
            </div>
            <div className="row">
              <div className="col mb-3">
                <label className="form-label">Longitude</label>
                <input type="number" step="any" name="lng" className="form-control" value={form.lng} onChange={handleChange} required />
              </div>
              <div className="col mb-3">
                <label className="form-label">Latitude</label>
                <input type="number" step="any" name="lat" className="form-control" value={form.lat} onChange={handleChange} required />
              </div>
            </div>
            <button className="btn btn-primary w-100">Submit Report</button>
          </form>
        </div>
      </div>
    </div>
  );
}
