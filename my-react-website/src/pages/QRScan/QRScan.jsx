import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code'; 
import confetti from 'canvas-confetti'; // 🟢 Install via: npm install canvas-confetti
import "./QrScan.css";

const LINE_COLORS = {
  L1: "#1f6feb", L2A: "#22c55e", L3: "#06b6d4", L4: "#a855f7", L7: "#f97316", Red: "#ef4444", Blue: "#3b82f6"
};

export default function QRScan() {
  const location = useLocation();
  const navigate = useNavigate();
  const [journeyId, setJourneyId] = useState(
    location.state?.journeyId || localStorage.getItem('activeJourneyId')
  );
  
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false); // 🟢 Track completion

  const fetchJourneyDetails = async () => {
    const idToFetch = journeyId || localStorage.getItem('activeJourneyId');
    if (!idToFetch) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/journey/${idToFetch}`);
      setSegments(res.data.segments || []);
      
      // 🟢 Check if the final status is COMPLETED
      if (res.data.status === 'COMPLETED') {
        handleJourneyCompletion();
      }
    } catch (err) {
      console.error("Error fetching journey:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJourneyCompletion = () => {
    setIsFinished(true);
    localStorage.removeItem('activeJourneyId');
    
    // 🎊 Trigger Party Popper
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });

    // 🕒 Redirect after 5 seconds
    setTimeout(() => {
      navigate('/'); // Redirect to home/suggested routes
    }, 5000);
  };

  useEffect(() => {
    if (journeyId) {
      localStorage.setItem('activeJourneyId', journeyId);
      fetchJourneyDetails();
    } else {
      setLoading(false);
    }
  }, [journeyId]);

  const handleUpdateLocation = async () => {
    try {
      const activeIdx = segments.findIndex(seg => !seg.scanned);
      if (activeIdx !== -1) {
        await axios.post('http://localhost:5000/api/journey/scan', { 
          token: segments[activeIdx].token 
        });
      }
      await fetchJourneyDetails();
    } catch (err) {
      console.error("Update failed:", err.response?.data?.error || err.message);
      fetchJourneyDetails(); 
    }
  };

  if (loading) return <div className="loader">Loading tickets...</div>;

  // 🟢 Success View: Shown when isFinished is true
  if (isFinished) {
    return (
      <div className="success-overlay">
        <div className="success-content">
          <div className="party-popper-icon">🎉</div>
          <h1>Journey Completed!</h1>
          <p>You have reached your destination successfully.</p>
          <div className="redirect-note">Redirecting to home in a few seconds...</div>
        </div>
      </div>
    );
  }

  if (!journeyId) {
    return (
      <div className="qr-scan-container">
        <div className="progress-card">
          <p style={{ textAlign: 'center', color: '#64748b' }}>
            No active journey found. Please book a ticket first.
          </p>
        </div>
      </div>
    );
  }

  const activeIndex = segments.findIndex(seg => !seg.scanned);
  const currentStep = activeIndex === -1 ? segments.length : activeIndex + 1;

  return (
    <div className="qr-scan-container">
      {/* Journey Progress Card */}
      <div className="progress-card">
        <div className="progress-header">
          <h3>Journey Progress</h3>
          <span className="step-count">{currentStep} of {segments.length}</span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${(currentStep / segments.length) * 100}%` }}
          ></div>
        </div>
        <div className="segment-list">
          {segments.map((seg, index) => (
            <div key={seg._id} className={`seg-item ${seg.scanned ? 'done' : index === activeIndex ? 'active' : 'pending'}`}>
              <span className="dot" style={{ backgroundColor: seg.scanned ? '#10b981' : (LINE_COLORS[seg.line] || '#cbd5e1') }}></span>
              <div className="seg-info">
                <strong>{seg.fromStation} → {seg.toStation}</strong>
                <p>{seg.line} Line</p>
              </div>
              {index === activeIndex && <span className="current-badge">Current</span>}
              {seg.scanned && <span className="scanned-badge">✓</span>}
            </div>
          ))}
        </div>
        <button className="update-btn" onClick={handleUpdateLocation}>
          Update Location
        </button>
      </div>

      {/* QR Cards List */}
      {segments.map((seg, index) => {
        const isLocked = index > activeIndex || activeIndex === -1;
        const isScanned = seg.scanned;
        return (
          <div key={seg._id} className={`qr-card ${isLocked || isScanned ? 'locked' : 'active'}`}>
            <div className="line-indicator" style={{ backgroundColor: LINE_COLORS[seg.line] || '#3b82f6' }}>
              <span className="line-dot"></span> {seg.line} Line
            </div>
            <div className="qr-details">
               <p className="station-text">📍 {seg.fromStation} → {seg.toStation}</p>
               <p className="fare-text">Fare: ₹{seg.fare || 'Included'}</p>
            </div>
            <div className="qr-section">
              {index === activeIndex ? (
                <div className="qr-wrapper">
                  <p className="scan-instruction">Scan to Board</p>
                  <div className="qr-border">
                    <QRCode value={seg.token} size={180} />
                  </div>
                  <p className="qr-token-id">TOKEN-{seg.token.slice(-6)}</p>
                </div>
              ) : (
                <div className="qr-locked-overlay">
                  <div className="lock-icon">{isScanned ? "✅" : "🔒"}</div>
                  <p>{isScanned ? "Segment Completed" : "QR code will appear when you reach this line"}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}