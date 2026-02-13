import React from 'react'
import "./SuggestedRoutes.css"
const LINE_COLORS = {
  L1: "#1f6feb", L2A: "#22c55e", L3: "#06b6d4", L4: "#a855f7", L7: "#f97316",
};

export default function SuggestedRoutes({ journeyResult, segments, source, destination }) {
  // If there's no result yet, don't show anything
  if (!journeyResult || segments.length === 0) return null;

  const currentLine = segments[0].line;

  return (
    <div className="journey-details-card">
      <h3>Journey Details</h3>
      
      <div className="journey-main-info">
        {/* Vertical Line Indicator */}
        <div 
          className="vertical-line" 
          style={{ backgroundColor: LINE_COLORS[currentLine] || "#ccc" }}
        ></div>
        
        <div className="path-details">
          <div className="line-label">
            <span className="dot" style={{ backgroundColor: LINE_COLORS[currentLine] }}></span>
            {currentLine} Line
          </div>
          
          <div className="station-flow">
            <strong>{source}</strong> 
            <span className="arrow"> → </span> 
            <strong>{destination}</strong>
          </div>
          
          <div className="fare-estimate">Fare: ₹{journeyResult.totalFare || "0.00"}</div>
        </div>
      </div>

      <hr className="divider" />

      <div className="journey-footer">
        <div className="est-time">
          <i className="clock-icon">🕒</i> Est. {journeyResult.totalTime || "0"} min
        </div>
        <div className="final-price">
          ₹{journeyResult.totalFare || "0.00"}
        </div>
      </div>

      <button className="book-journey-btn">
        Book Journey - ₹{journeyResult.totalFare || "0.00"}
      </button>
    </div>
  );
}