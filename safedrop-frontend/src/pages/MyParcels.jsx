import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const STATUSES = ["pending", "picked", "in-transit", "delivered", "cancelled"];
// Badge color for each parcel status
const statusColor = {
  pending: "bg-secondary",
  picked: "bg-primary",
  "in-transit": "bg-warning text-dark",
  delivered: "bg-success",
  cancelled: "bg-danger",
};


export default function MyParcels() {
  const { user } = useAuth();
  const [parcels, setParcels] = useState([]);
  const [agents, setAgents] = useState([]);
  const [chosenAgent, setChosenAgent] = useState({}); // { parcelId: agentId }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadParcels = async () => {
    try {
      const res = await api.get("/parcels");
      setParcels(res.data);
      // Only the admin needs the agent list
      if (user.role === "admin") {
        const agentRes = await api.get("/auth/agents");
        setAgents(agentRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not load parcels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParcels();
  }, []);

  // Agent: change status
  const updateStatus = async (id, status) => {
    setError("");
    setMessage("");
    try {
      await api.put(`/parcels/${id}/status`, { status });
      setMessage("Status updated");
      loadParcels();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update status");
    }
  };

  // Admin: assign agent
  const assignAgent = async (id) => {
    const agentId = chosenAgent[id];
    if (!agentId) return setError("Please choose an agent first");
    setError("");
    setMessage("");
    try {
      await api.put(`/parcels/${id}/assign`, { agentId });
      setMessage("Agent assigned");
      loadParcels();
    } catch (err) {
      setError(err.response?.data?.message || "Could not assign agent");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h3>
        {user.role === "customer" && "My Parcels"}
        {user.role === "agent" && "Assigned Parcels"}
        {user.role === "admin" && "All Parcels"}
      </h3>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {parcels.length === 0 ? (
        <p>No data found</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle">
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Receiver</th>
                <th>Address</th>
                <th>Status</th>
                {user.role === "admin" && <th>Sender</th>}
                {user.role !== "agent" && <th>Agent</th>}
                {user.role === "agent" && <th>Update Status</th>}
                {user.role === "admin" && <th>Assign Agent</th>}
              </tr>
            </thead>
            <tbody>
              {parcels.map((p) => (
                <tr key={p._id}>
                  <td>{p.trackingId}</td>
                  <td>{p.receiverName}</td>
                  <td>{p.receiverAddress}</td>
                  <td><span className={`badge ${statusColor[p.status]}`}>{p.status}</span></td>

                  {user.role === "admin" && <td>{p.sender?.name || "-"}</td>}
                  {user.role !== "agent" && <td>{p.assignedAgent?.name || "Not assigned"}</td>}

                  {user.role === "agent" && (
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={p.status}
                        onChange={(e) => updateStatus(p._id, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  )}

                  {user.role === "admin" && (
                    <td>
                      <div className="d-flex gap-2">
                        <select
                          className="form-select form-select-sm"
                          value={chosenAgent[p._id] || ""}
                          onChange={(e) => setChosenAgent({ ...chosenAgent, [p._id]: e.target.value })}
                        >
                          <option value="">Select agent</option>
                          {agents.map((a) => (
                            <option key={a._id} value={a._id}>{a.name}</option>
                          ))}
                        </select>
                        <button className="btn btn-sm btn-primary" onClick={() => assignAgent(p._id)}>
                          Assign
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
