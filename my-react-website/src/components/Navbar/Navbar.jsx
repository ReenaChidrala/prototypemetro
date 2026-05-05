import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Train, QrCode, ClipboardList, CreditCard, LogOut, User } from 'lucide-react';

export function Navbar({ user, onLogout }) {
  

  const navItems = [
    { path: '/', name: 'Plan', icon: Train },
    // { path: '/Payment', name: 'Payment', icon: CreditCard },
    { path: '/QRScan', name: 'Scan', icon: QrCode },
    { path: '/Summary', name: 'History', icon: ClipboardList },
  ];

  // If user is not logged in, don't show any navbar (optional, based on your preference)
  if (!user) return null;

  return (
    <>
      {/* 🟢 TOP BAR: Shows User Name and Logout Button */}
     

      {/* 🔵 BOTTOM NAVBAR: Your existing Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-around items-center h-16 pb-1" style={{backgroundColor:"white",boxShadow:" 0 4px 10px rgba(0,0,0,0.1)"}}>
        {/* <div className="bg-blue-100 p-2 rounded-full">
            <User size={20} className="text-blue-600" />
          </div> */}
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`
            }
          >
            <item.icon size={20} style={{color:"black"}} />
            <span className="text-[10px] font-semibold" style={{color:"black"}}>{item.name}</span>
          </NavLink>
        ))}
         <div 
          onClick={onLogout}
          className=""
        >
          
          <span style={{color:"black", fontWeight:500 , fontFamily: "'Segoe UI', Arial, sans-serif"}}>Logout</span>
        </div>
      </nav>
    </>
  );
}