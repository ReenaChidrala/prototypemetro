import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import "./QrScan.css";

export default function QRScan() {
  const navigate = useNavigate();
  const { journeyId } = useParams();

  const [segments, setSegments] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!journeyId) {
      navigate("/");
      return;
    }

    const fetchJourney = async () => {
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

    fetchJourney();
  }, [journeyId, navigate]);

  // 🔥 SYNC CURRENT QR WITH BACKEND
  useEffect(() => {
    if (segments.length > 0) {
      const nextIndex = segments.findIndex(s => !s.scanned);
      setCurrent(nextIndex === -1 ? segments.length - 1 : nextIndex);
    }
  }, [segments]);

  if (loading) return <h2>Loading journey...</h2>;
  if (segments.length === 0) return <h2>No journey data found</h2>;

  const nextQR = async () => {
    try {
      const token = segments[current].token;

      const res = await fetch("http://localhost:5000/api/journey/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        alert("❌ QR already used or invalid");
        return;
      }

      if (current < segments.length - 1) {
        setCurrent(current + 1);
      } else {
        navigate(`/summary/${journeyId}`);
      }
    } catch (err) {
      console.error(err);
      alert("Scan failed");
    }
  };

  return (
    <div className="qr-page">
      <div className="journey-summary">
        <h3>Journey</h3>
        <p className="jornytext">
          {segments[0].fromStation} →{" "}
          {segments[segments.length - 1].toStation}
        </p>
        <p>Total Segments: {segments.length}</p>
      </div>

      {segments.map((seg, index) => {
        const isActive = index === current;

        return (
          <div
            key={seg._id}
            className={`qr-segment-card ${
              isActive ? "active" : "disabled"
            }`}
          >
            <p>
              <strong>{seg.line}</strong><br />
              {seg.fromStation} → {seg.toStation}
            </p>

            {isActive ? (
              <>
                <QRCodeCanvas value={seg.token} size={200} />
                <button onClick={nextQR}>I have scanned</button>
              </>
            ) : (
              <div className="qr-placeholder">QR Locked</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
