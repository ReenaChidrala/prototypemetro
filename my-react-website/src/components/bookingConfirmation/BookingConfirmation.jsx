import React from 'react';
import './BookingConfirmation.css';

export default function BookingConfirmation({ journeyData, onStart }) {
  if (!journeyData) return null;

  return (
    <div className="confirmation-overlay">
      <div className="confirmation-card">
        {/* Success Icon */}
        <div className="success-checkmark">
          <div className="check-icon">✓</div>
        </div>

        <h2 className="confirmation-title">Booking Confirmed!</h2>
        <p className="confirmation-subtitle">Your metro journey has been booked successfully</p>

        <div className="info-list">
          {/* Path Info */}
          <div className="info-item">
            <div className="icon-circle blue">📍</div>
            <div className="text-content">
              <span className="label-text">
                {journeyData.from} → {journeyData.to}
              </span>
              <span className="sub-text">{journeyData.route?.length || 0} segments</span>
            </div>
          </div>

          {/* Time Info */}
          <div className="info-item">
            <div className="icon-circle green">🕒</div>
            <div className="text-content">
              <span className="label-text">Est. {journeyData.totalTime} minutes</span>
              <span className="sub-text">Including transfers</span>
            </div>
          </div>

          {/* Fare Info */}
          <div className="info-item">
            <div className="icon-circle orange">💳</div>
            <div className="text-content">
              <span className="label-text">Total Fare: ₹{journeyData.totalFare}</span>
              <span className="sub-text">Paid via Digital Wallet</span>
            </div>
          </div>
        </div>

        <button className="start-journey-btn" onClick={onStart}>
          Start Journey
          {/* This button can redirect to your QrScan page */}
        </button>
      </div>
    </div>
  );
}