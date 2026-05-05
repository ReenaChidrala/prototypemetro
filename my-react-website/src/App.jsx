import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { Navbar } from './components/Navbar/Navbar';
import Auth from './components/auth/Auth'; // 🟢 Import your new Auth component
// Page Imports
import PlanJourney from './pages/PlanJourney/PlanJourney';
import Payment from './pages/Payment/Payment';
import QRScan from './pages/QRScan/QRScan';
import Summary from './pages/TicketSummary/TicketSummary';

function App() {
  // 1. Initialize user state from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 2. Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col" >
        {/* Pass user and logout to Navbar so it can show the name/logout button */}
        <Navbar user={user} onLogout={handleLogout} />

        <main className="flex-grow pt-20 pb-20 px-4 max-w-lg mx-auto w-full" >
          <Routes>
            {/* 3. If NOT logged in, show Auth. If logged in, redirect to Home */}
            <Route 
              path="/auth" 
              element={!user ? <Auth onLogin={setUser} /> : <Navigate to="/" />} 
            />
  
            {/* 4. PROTECTED ROUTES: Redirect to /auth if user is null */}
            <Route 
              path="/" 
              element={user ? <PlanJourney /> : <Navigate to="/auth" />} 
            />
            
            <Route 
              path="/Payment" 
              element={user ? <Payment /> : <Navigate to="/auth" />} 
            />
            
            <Route 
              path="/QRScan" 
              element={user ? <QRScan /> : <Navigate to="/auth" />} 
            />
            
            <Route 
              path="/Summary" 
              element={user ? <Summary /> : <Navigate to="/auth" />} 
            />

            <Route path="*" element={<div className="text-center mt-10">404 - Page Not Found</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;