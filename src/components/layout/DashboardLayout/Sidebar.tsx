import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { TbDatabaseHeart } from "react-icons/tb";
import { IoManSharp } from "react-icons/io5";
import {
  FaHome,
  FaMoneyBillWave,
  FaChevronDown,
  FaChevronUp,
  FaFileInvoiceDollar,
  FaReceipt,
} from "react-icons/fa";
import { GiExpense } from "react-icons/gi";
import { FaPeopleGroup } from "react-icons/fa6";

const Sidebar = () => {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const location = useLocation();

  const toggleMenu = (menuId: string) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
  };

  useEffect(() => {
    if (location.pathname.startsWith("/income")) setExpandedMenu("income");
    else if (location.pathname.startsWith("/expenses"))
      setExpandedMenu("expenses");
  }, [location.pathname]);

  const navItems = [
    { path: "/", label: "Dashboard", icon: <FaHome /> },
    {
      label: "Employees",
      icon: <FaPeopleGroup />,
      menuId: "employees",
      subItems: [
        {
          path: "/employees",
          label: "All Employees",
          icon: <IoManSharp />,
        },
      ],
    },
    {
      label: "Income",
      icon: <FaMoneyBillWave />,
      menuId: "income",
      subItems: [
        { path: "/income", label: "A", icon: <FaFileInvoiceDollar /> },
        { path: "/income/b", label: "B", icon: <FaFileInvoiceDollar /> },
        { path: "/income/c", label: "C", icon: <FaFileInvoiceDollar /> },
      ],
    },
    {
      label: "Expenses",
      icon: <GiExpense />,
      menuId: "expenses",
      subItems: [
        { path: "/expenses", label: "A", icon: <FaReceipt /> },
        { path: "/expenses/b", label: "B", icon: <FaReceipt /> },
        { path: "/expenses/c", label: "C", icon: <FaReceipt /> },
      ],
    },
  ];

  const isSubItemActive = (subItems: any[]) => {
    return subItems.some((sub) => location.pathname.startsWith(sub.path));
  };

  return (
    // Floating Sidebar Container with your custom color
    <aside className="w-64 bg-blue-firstRate text-white rounded-3xl flex flex-col shadow-lg transition-all duration-300">
      {/* Logo Area */}
      <div className="h-24 flex items-center justify-center">
        <span className="text-2xl flex-shrink-0">
          <TbDatabaseHeart />
        </span>
        <span className="text-xl font-bold tracking-wider ms-2">ZETA TAX</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 mt-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            if (!item.subItems) {
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path!}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 rounded-2xl transition-all duration-200 ${
                        isActive
                          ? "bg-white text-blue-firstRate font-semibold shadow-md"
                          : "text-indigo-100 hover:bg-white/10"
                      }`
                    }
                  >
                    <span className="text-lg w-8">{item.icon}</span>
                    <span className="text-sm ml-2">{item.label}</span>
                  </NavLink>
                </li>
              );
            }

            const isActive = isSubItemActive(item.subItems);
            const isExpanded = expandedMenu === item.menuId;
            const isParentActive = isActive || isExpanded;

            return (
              <li key={item.menuId}>
                <button
                  onClick={() => toggleMenu(item.menuId!)}
                  className={`w-full flex items-center px-4 py-3 rounded-2xl transition-all duration-200 ${
                    isParentActive
                      ? "bg-white/20 text-white font-semibold"
                      : "text-indigo-100 hover:bg-white/10"
                  }`}
                >
                  <span className="text-lg w-8">{item.icon}</span>
                  <span className="text-sm flex-1 text-left ml-2">
                    {item.label}
                  </span>
                  <span className="text-xs">
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </button>

                {/* Sub Items */}
                {isExpanded && (
                  <ul className="mt-1 ml-6 space-y-1">
                    {item.subItems.map((sub) => (
                      <li key={sub.path}>
                        <NavLink
                          to={sub.path}
                          className={({ isActive }) =>
                            `flex items-center px-4 py-2 rounded-xl transition-all duration-200 ${
                              isActive
                                ? "bg-white text-blue-firstRate font-semibold shadow-sm"
                                : "text-indigo-200 hover:bg-white/10"
                            }`
                          }
                        >
                          <span className="text-sm w-6">{sub.icon}</span>
                          <span className="text-sm ml-2">{sub.label}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
