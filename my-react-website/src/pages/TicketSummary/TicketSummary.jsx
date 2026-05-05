import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TicketSummary.css';

export default function JourneyHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/journey/history');
        // Double check it's an array before setting state
        setHistory(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error loading history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="loader">Loading history...</div>;

  return (
    <div className="history-container">
      <div className="history-card-main">
        <div className="history-header">
          <h2>Journey History</h2>
          <span className="count-badge">{history.length} Trips</span>
        </div>

        {history.length === 0 ? (
          <p className="no-history">No completed journeys found.</p>
        ) : (
          <div className="history-list">
            {history.map((j) => (
              <div key={j._id} className="history-item">
                <div className="history-details">
                  <strong>{j.from} → {j.to}</strong>
                  <p className="history-date">
                    {new Date(j.createdAt).toLocaleString()}
                  </p>
                  <span className="status-badge-completed">Completed</span>
                </div>

                <div className="history-fare">
                  {/* Fixed the potential crash here */}
                  {/* ₹{typeof j.totalFare === 'number' ? j.totalFare.toFixed(2) : "0.00"} */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}