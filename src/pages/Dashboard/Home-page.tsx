import React from "react";
import { FaEllipsisH } from "react-icons/fa";

const HomePage = () => {
  return (
    <div className="flex flex-col gap-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Welcome back, Jacky</p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 (Blue Bars) */}
        <div className="bg-white border rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-1">Income</p>
              <h3 className="text-2xl font-bold text-gray-800">$2700.50</h3>
            </div>
            <FaEllipsisH className="text-gray-300 cursor-pointer" />
          </div>
          {/* Mock Bar Chart */}
          <div className="flex items-end gap-2 h-20 mt-4">
            {[40, 70, 45, 90, 60, 30, 80].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-indigo-100 rounded-t-md relative flex items-end"
              >
                <div
                  className="w-full bg-indigo-500 rounded-t-md"
                  style={{ height: `${h}%` }}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2 (Red Bars) */}
        <div className="bg-white border rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-1">
                Expense
              </p>
              <h3 className="text-2xl font-bold text-gray-800">$2100.70</h3>
            </div>
            <FaEllipsisH className="text-gray-300 cursor-pointer" />
          </div>
          {/* Mock Bar Chart */}
          <div className="flex items-end gap-2 h-20 mt-4">
            {[50, 30, 80, 40, 60, 90, 20].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-rose-100 rounded-t-md relative flex items-end"
              >
                <div
                  className="w-full bg-rose-500 rounded-t-md"
                  style={{ height: `${h}%` }}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3 (Line Chart) */}
        <div className="bg-white border rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-1">
                Balance
              </p>
              <h3 className="text-2xl font-bold text-gray-800">2400.50</h3>
            </div>
            <FaEllipsisH className="text-gray-300 cursor-pointer" />
          </div>
          {/* Mock Line Chart */}
          <div className="h-20 mt-4 w-full flex items-center justify-center">
            <svg
              viewBox="0 0 100 40"
              className="w-full h-full overflow-visible"
            >
              <path
                d="M0,30 Q20,40 40,20 T80,10 T100,5"
                fill="none"
                stroke="#6366F1"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* RECENT MESSAGES SECTION */}
      <div className="bg-white border rounded-3xl p-6 shadow-sm mt-4">
        <h2 className="text-lg font-bold text-gray-800 mb-6">
          Recent Messages
        </h2>

        <div className="flex flex-col gap-6">
          {/* Row 1 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 w-1/4">
              <img
                src="https://i.pravatar.cc/150?img=1"
                className="w-10 h-10 rounded-full"
                alt="avatar"
              />
              <span className="text-sm font-semibold text-gray-700">
                Jenny Wilson
              </span>
            </div>
            <p className="text-sm text-gray-500 w-2/4">
              How can I return package?
            </p>
            <div className="w-1/4 flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-500">
                Answered
              </span>
              <span className="text-xs text-gray-400">10:30 AM</span>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-100" />

          {/* Row 2 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 w-1/4">
              <img
                src="https://i.pravatar.cc/150?img=5"
                className="w-10 h-10 rounded-full"
                alt="avatar"
              />
              <span className="text-sm font-semibold text-gray-700">
                Ariana McCoy
              </span>
            </div>
            <p className="text-sm text-gray-500 w-2/4">
              Question about the product
            </p>
            <div className="w-1/4 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">
                Pending
              </span>
              <span className="text-xs text-gray-400">2:24 PM</span>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-100" />

          {/* Row 3 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 w-1/4">
              <img
                src="https://i.pravatar.cc/150?img=8"
                className="w-10 h-10 rounded-full"
                alt="avatar"
              />
              <span className="text-sm font-semibold text-gray-700">
                Wade Warren
              </span>
            </div>
            <p className="text-sm text-gray-500 w-2/4">Discount code</p>
            <div className="w-1/4 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">
                Pending
              </span>
              <span className="text-xs text-gray-400">Yesterday</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;