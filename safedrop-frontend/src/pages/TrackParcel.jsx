import { useState } from "react";
import api from "../services/api";

// Green above 70, yellow 40-70, red below 40
const getBadgeColor = (score) => {
  if (score > 70) return "bg-success";
  if (score >= 40) return "bg-warning text-dark";
  return "bg-danger";
};

export default function TrackParcel() {
  const [trackingId, setTrackingId] = useState("");
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setParcel(null);
    setLoading(true);
    try {
      const res = await api.get(`/parcels/track/${trackingId.trim()}`);
      setParcel(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Parcel not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h3>Track Parcel</h3>

        <form onSubmit={handleSubmit} className="d-flex gap-2 mb-3">
          <input
            className="form-control"
            placeholder="Enter tracking ID"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            required
          />
          <button className="btn btn-primary">Track</button>
        </form>

        {loading && <p>Loading...</p>}
        {error && <div className="alert alert-danger">{error}</div>}

        {parcel && (
          <div className="card p-3">
            <p><strong>Tracking ID:</strong> {parcel.trackingId}</p>
            <p><strong>Receiver:</strong> {parcel.receiverName}</p>
            <p><strong>Address:</strong> {parcel.receiverAddress}</p>
            <p><strong>Status:</strong> <span className="badge bg-secondary">{parcel.status}</span></p>
            <p><strong>Agent:</strong> {parcel.assignedAgent?.name || "Not assigned yet"}</p>
            <p className="mb-0">
              <strong>Route Safety Score:</strong>{" "}
              <span className={`badge ${getBadgeColor(parcel.safetyScore)}`}>
                {parcel.safetyScore} / 100
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
