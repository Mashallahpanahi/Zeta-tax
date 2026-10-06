import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = () => {
  return (
    // Outer background with padding
    <div className="flex h-screen bg-[#F0F2F8] p-4 gap-4 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area (Floating White Card) */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 pt-0 bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;