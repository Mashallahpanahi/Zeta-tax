import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { TbDatabaseHeart, TbReceipt } from "react-icons/tb";
import { IoManSharp } from "react-icons/io5";
import { LiaFileContractSolid } from "react-icons/lia";
import { GrTransaction } from "react-icons/gr";
import { MdAddBusiness } from "react-icons/md";
import {
  FaHome,
  FaMoneyBillWave,
  FaChevronDown,
  FaChevronUp,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import { GiExpense } from "react-icons/gi";
import { FaPeopleGroup } from "react-icons/fa6";

const Sidebar = () => {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const location = useLocation();

  const toggleMenu = (menuId: string) => {
    setExpandedMenu((current) => (current === menuId ? null : menuId));
  };

  useEffect(() => {
    if (
      location.pathname.startsWith("/income") ||
      location.pathname.startsWith("/Income-transaction")
    ) {
      setExpandedMenu("income");
    } else if (
      location.pathname.startsWith("/expenses") ||
      location.pathname.startsWith("/expense-categories") ||
      location.pathname.startsWith("/other-expenses")
    ) {
      setExpandedMenu("expenses");
    } else if (
      location.pathname.startsWith("/employees") ||
      location.pathname.startsWith("/contracts") ||
      location.pathname.startsWith("/employee-register-history") ||
      location.pathname.startsWith("/contract-history")
    ) {
      setExpandedMenu("employees");
    }
  }, [location.pathname]);

  const navItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: <FaHome />,
    },
    {
      label: "Employees",
      icon: <FaPeopleGroup />,
      menuId: "employees",
      subItems: [
        {
          path: "/employees",
          label: "Registered new",
          icon: <IoManSharp />,
        },
        {
          path: "/contracts",
          label: "Contract",
          icon: <LiaFileContractSolid />,
        },
      ],
    },
    {
      label: "Income",
      icon: <FaMoneyBillWave />,
      menuId: "income",
      subItems: [
        {
          path: "/Income-transaction",
          label: "CashBook",
          icon: <FaFileInvoiceDollar />,
        },
        {
          path: "/Exchange-to-AfN",
          label: "Monthly Invoice Allocation",
          icon: <FaFileInvoiceDollar />,
        },

      ],
    },
    {
      label: "Expenses",
      icon: <GiExpense />,
      menuId: "expenses",
      subItems: [
        {
          path: "/expense-categories",
          label: "Add Category",
          icon: <MdAddBusiness />,
        },
        {
          path: "/other-expenses",
          label: "Other Expense",
          icon: <TbReceipt />,
        },
      ],
    },
  ];

  const isSubItemActive = (subItems: { path: string }[]) =>
    subItems.some(
      (sub) =>
        location.pathname === sub.path ||
        location.pathname.startsWith(`${sub.path}/`),
    );

  return (
    <aside className="flex w-64 flex-col rounded-3xl bg-blue-firstRate text-white shadow-lg transition-all duration-300">
      <div className="flex h-24 items-center justify-center">
        <span className="flex-shrink-0 text-2xl">
          <TbDatabaseHeart />
        </span>
        <span className="ms-2 text-xl font-bold tracking-wider">ZETA TAX</span>
      </div>

      <nav className="mt-4 flex-1 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            if (!("subItems" in item)) {
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `flex items-center rounded-2xl px-4 py-3 transition-all duration-200 ${isActive
                        ? "bg-white font-semibold text-blue-firstRate shadow-md"
                        : "text-indigo-100 hover:bg-white/10"
                      }`
                    }
                  >
                    <span className="w-8 text-lg">{item.icon}</span>
                    <span className="ml-2 text-sm">{item.label}</span>
                  </NavLink>
                </li>
              );
            }

            const isExpanded = expandedMenu === item.menuId;
            const isParentActive = isSubItemActive(item.subItems ?? []) || isExpanded;

            return (
              <li key={item.menuId}>
                <button
                  type="button"
                  onClick={() => toggleMenu(item.menuId ?? "")}
                  aria-expanded={isExpanded}
                  className={`flex w-full items-center rounded-2xl px-4 py-3 transition-all duration-200 ${isParentActive
                    ? "bg-white/20 font-semibold text-white"
                    : "text-indigo-100 hover:bg-white/10"
                    }`}
                >
                  <span className="w-8 text-lg">{item.icon}</span>
                  <span className="ml-2 flex-1 text-left text-sm">
                    {item.label}
                  </span>
                  <span className="text-xs">
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </button>

                {isExpanded && (
                  <ul className="ml-6 mt-1 space-y-1">
                    {item.subItems.map((sub) => (
                      <li key={sub.path}>
                        <NavLink
                          to={sub.path}
                          className={({ isActive }) =>
                            `flex items-center rounded-xl px-4 py-2 transition-all duration-200 ${isActive
                              ? "bg-white font-semibold text-blue-firstRate shadow-sm"
                              : "text-indigo-200 hover:bg-white/10"
                            }`
                          }
                        >
                          <span className="w-6 text-sm">{sub.icon}</span>
                          <span className="ml-2 text-sm">{sub.label}</span>
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
