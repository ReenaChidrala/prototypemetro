import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Navbar } from './components/Navbar/Navbar';
// Page Imports
import PlanJourney from './pages/PlanJourney/PlanJourney';
import Payment from './pages/Payment/Payment';
import QRScan from './pages/QRScan/QRScan';
import Summary from './pages/TicketSummary/TicketSummary';
import Tracking from './pages/TicketTracking/TicketTracking';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />

        {/* Main Content: 
          pt-20 (Padding top) covers the 64px (h-16) top navbar.
          pb-20 (Padding bottom) ensures content isn't hidden by the mobile bottom bar.
        */}
        <main className="flex-grow pt-20 pb-20 px-4 max-w-lg mx-auto w-full">
          <Routes>
            {/* The Home path '/' now renders PlanJourney */}
            <Route path="/" element={<PlanJourney />} />
            
            <Route path="/Payment" element={<Payment />} />
            <Route path="/QRScan" element={<QRScan />} />
            <Route path="/Summary" element={<Summary />} />
            <Route path="/Tracking" element={<Tracking />} />
            
            {/* Fallback route for 404s */}
            <Route path="*" element={<div className="text-center mt-10">404 - Page Not Found</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;