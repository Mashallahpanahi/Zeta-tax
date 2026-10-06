import React from "react";
import { FaSearch, FaRegBell } from "react-icons/fa";

const Header = () => {
  return (
    <header className="flex items-center justify-between px-8 py-6 bg-white rounded-t-3xl">
      
      {/* LEFT: Search Bar */}
      <div className="flex items-center gap-4 w-1/2">
        <span className="text-sm text-gray-500 font-medium">Short:</span>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-4 pr-10 text-sm text-gray-700 focus:outline-none focus:border-blue-firstRate transition-colors"
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
            <FaSearch className="text-xs" />
          </div>
        </div>
      </div>

      {/* RIGHT: Notifications */}
      <div className="flex items-center">
        <button className="relative text-gray-400 hover:text-blue-firstRate transition-colors">
          <FaRegBell className="text-xl" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
      </div>

    </header>
  );
};

export default Header;