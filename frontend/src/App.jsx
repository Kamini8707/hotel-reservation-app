import React, { useEffect, useMemo, useState } from "react";
import "./app.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function App() {
  const [state, setState] = useState(null);
  const [count, setCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchState = async () => {
    const res = await fetch(`${API_URL}/state`);
    const data = await res.json();
    setState(data);
  };

  useEffect(() => { fetchState(); }, []);

  const book = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: Number(count) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      await fetchState();
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  const reset = async () => {
    setLoading(true); setError("");
    await fetch(`${API_URL}/reset`, { method: "POST" });
    await fetchState();
    setLoading(false);
  };

  const randomize = async () => {
    setLoading(true); setError("");
    await fetch(`${API_URL}/randomize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ occupancyRatio: 0.35 })
    });
    await fetchState();
    setLoading(false);
  };

  const selectedSet = useMemo(() => new Set(state?.lastBooking?.rooms || []), [state]);

  return (
    <div className="container">
      <h1>🏨 Hotel Room Reservation System</h1>

      <div className="panel">
        <div className="controls">
          <label>Rooms to book (1–5):</label>
          <input type="number" min={1} max={5} value={count}
                 onChange={e => setCount(e.target.value)} />
          <button onClick={book} disabled={loading}>Book</button>
          <button className="secondary" onClick={randomize} disabled={loading}>Randomize Occupancy</button>
          <button className="secondary" onClick={reset} disabled={loading}>Reset</button>
        </div>
        {error && <div style={{color:"#ff8080"}}>⚠️ {error}</div>}
        {state?.lastBooking?.rooms?.length > 0 && (
          <div style={{marginTop:".5rem"}}>
            <strong>Last booking:</strong> {state.lastBooking.rooms.join(", ")} —
            Total travel time: <strong>{state.lastBooking.travelTime} min</strong>
          </div>
        )}
        <div className="legend">
          <span className="badge"><span className="swatch available"></span>Available</span>
          <span className="badge"><span className="swatch booked"></span>Booked</span>
          <span className="badge"><span className="swatch selected"></span>Selected (last booking)</span>
        </div>
      </div>

      <div className="grid panel">
        {state && Object.keys(state.state).sort((a,b)=>Number(b)-Number(a)).map(floorKey => {
          const floor = Number(floorKey);
          const rooms = state.state[floorKey];
          const isTen = floor === 10;
          return (
            <div className={`floor ${isTen ? "ten": ""}`} key={floor}>
              <div className="floor-label"><strong>Floor {floor}</strong></div>
              {rooms.map(({ roomNumber, status }) => (
                <div key={roomNumber}
                     className={`room ${status} ${selectedSet.has(roomNumber) ? "selected" : ""}`}>
                  {roomNumber}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="footer">API: {API_URL}</div>
    </div>
  );
}