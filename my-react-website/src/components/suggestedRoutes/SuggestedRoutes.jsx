import React from 'react';
import "./SuggestedRoutes.css";

const LINE_COLORS = {
  L1: "#1f6feb", L2A: "#22c55e", L3: "#06b6d4", L4: "#a855f7", L7: "#f97316",
};

// Map IDs to friendly names for better UI
const LINE_NAMES = {
  L1: "Blue Line", L2A: "Yellow Line", L3: "Aqua Line", L4: "Green Line", L7: "Red Line"
};

export default function SuggestedRoutes({ journeyResult, segments,onBook }) {
  // If there's no result yet or segments are empty, don't show anything
  if (!journeyResult || !segments || segments.length === 0) return null;

  return (
    <div className="suggested-results-wrapper">
      <div className="journey-details-card">
        <h3 className='sugeheader'>Journey Details</h3>
        
        {/* 🟢 Loop through all segments to show interchanges */}
        {segments.map((seg, index) => (
          <div key={index} className="journey-segment">
            {/* Dynamic Vertical Line for each segment */}
            <div 
              className="vertical-line" 
              style={{ backgroundColor: LINE_COLORS[seg.line] || "#ccc" }}
            ></div>
            
            <div className="path-details">
              <div className="line-label">
                <span 
                  className="dot" 
                  style={{ backgroundColor: LINE_COLORS[seg.line] || "#ccc" }}
                ></span>
                {LINE_NAMES[seg.line] || seg.line}
              </div>
              
              <div className="station-flow">
                <strong>{seg.from}</strong> 
                <span className="arrow"> → </span> 
                <strong>{seg.to}</strong>
              </div>
           <div className="fare-text">Fare: ₹{seg.segmentFare.toFixed(2)} • via {seg.line}</div>
            </div>
          </div>
        ))}

        <hr className="divider" />

        <div className="journey-footer">
          <div className="est-time">
            <span className="icon">🕒</span> Est. {journeyResult.totalTime || "0"} min
          </div>
          <div className="final-price">
            <span className="currency-symbol">₹</span>{journeyResult.totalFare || "0.00"}
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <button className="book-journey-btn-floating" onClick={onBook}>
        Book Journey - ₹{journeyResult.totalFare || "0.00"}
      </button>
    </div>
  );
}