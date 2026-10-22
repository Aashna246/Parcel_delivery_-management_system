import { useState } from "react";
import api from "../services/api";

const emptyForm = {
  receiverName: "", receiverPhone: "", receiverAddress: "", weight: "", lng: "", lat: "",
};

export default function CreateParcel() {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [trackingId, setTrackingId] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setTrackingId("");
    try {
      // weight, lng and lat must be numbers
      const res = await api.post("/parcels", {
        ...form,
        weight: Number(form.weight),
        lng: Number(form.lng),
        lat: Number(form.lat),
      });
      setTrackingId(res.data.trackingId || res.data.parcel?.trackingId);
      setForm(emptyForm);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create parcel");
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card p-4">
          <h3 className="mb-3">Create Parcel</h3>

          {error && <div className="alert alert-danger">{error}</div>}
          {trackingId && (
            <div className="alert alert-success">
              Parcel created! Your tracking ID is <strong>{trackingId}</strong>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Receiver Name</label>
              <input name="receiverName" className="form-control" value={form.receiverName} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Receiver Phone</label>
              <input name="receiverPhone" className="form-control" value={form.receiverPhone} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Receiver Address</label>
              <textarea name="receiverAddress" className="form-control" value={form.receiverAddress} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Weight (kg)</label>
              <input type="number" step="0.1" name="weight" className="form-control" value={form.weight} onChange={handleChange} required />
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
            <button className="btn btn-primary w-100">Create Parcel</button>
          </form>
        </div>
      </div>
    </div>
  );
}
