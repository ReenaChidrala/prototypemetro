import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./TicketSummary.css";

export default function TicketSummary() {
  const { journeyId } = useParams();
  const navigate = useNavigate();

  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/journey/${journeyId}`
        );

        if (!res.ok) throw new Error("Journey not found");

        const data = await res.json();
        setSegments(data.segments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();

    // ✅ journey complete → localStorage clear
    return () => {
      localStorage.removeItem("journeyId");
    };
  }, [journeyId]);

  if (loading) return <h2>Loading ticket...</h2>;
  if (segments.length === 0) return <h2>No ticket data found</h2>;

  const start = segments[0];
  const end = segments[segments.length - 1];

  return (
    <div className="ticket-page">
      <h2 className="ticket-title">🎟 Journey Completed</h2>

      <div className="ticket-card">
        <p className="ticket-route">
          <strong>{start.fromStation}</strong> →{" "}
          <strong>{end.toStation}</strong>
        </p>

        <div className="ticket-info">
          <p>Total Segments: {segments.length}</p>
          <p>
            Status: <span className="status success">COMPLETED</span>
          </p>
        </div>

        <hr />

        {segments.map((seg, i) => (
          <div key={i} className="ticket-segment">
            <span>{seg.line}</span>
            <span>
              {seg.fromStation} → {seg.toStation}
            </span>
            <span className="checked">✔</span>
          </div>
        ))}
      </div>

      <div className="ticket-actions">
        <button onClick={() => navigate("/")}>New Journey</button>
      </div>
    </div>
  );
}
