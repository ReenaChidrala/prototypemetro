import React from 'react';
import { NavLink } from 'react-router-dom';
import { Train, QrCode, ClipboardList, Map, CreditCard } from 'lucide-react';

export function Navbar() {
  const navItems = [
    { path: '/', name: 'Plan Journey', icon: Train },
    { path: '/Payment', name: 'Payment', icon: CreditCard },
    { path: '/QRScan', name: 'QR Scan', icon: QrCode },
    { path: '/Summary', name: 'Summary', icon: ClipboardList },
    { path: '/Tracking', name: 'Tracking', icon: Map },
  ];

  return (
    <>
      {/* Top Navbar for Desktop */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 h-16 px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Train className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold text-gray-800">MetroGo</span>
        </div>

        <div className="hidden md:flex space-x-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom Navbar for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-around items-center h-16 pb-1">
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
            <item.icon size={20} />
            <span className="text-[10px] font-semibold">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}