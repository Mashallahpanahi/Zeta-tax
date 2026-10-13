import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllEmployeesHistory, // ✅ history route: /employee-register
  updateEmployee,
  type GetAllEmployeeType,
} from "../../api/employeeApi";
import ViewMoreDetailEmployeeModal from "../../components/employee/viewmoreDetailEmployeeModal";

export default function EmployeeRegisterHistory() {
  const navigate = useNavigate();

  const {
    data: employees,
    message,
    loading,
    error,
    refetch,
  } = getAllEmployeesHistory();

  const { update, loading: updating, error: updateError } = updateEmployee();

  const [viewEmployee, setViewEmployee] = useState<GetAllEmployeeType | null>(
    null,
  );
  const [visibleMessage, setVisibleMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    setVisibleMessage(message);

    const timer = setTimeout(() => setVisibleMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  // ✅ Show ALL employees from /employee-register
  const allEmployees = employees ?? [];

  const handleActivate = async (emp: GetAllEmployeeType) => {
    const confirmed = window.confirm(
      `Activate ${emp.first_name} ${emp.last_name} again?`,
    );
    if (!confirmed) return;

    const ok = await update(emp.registration_id, { status: "active" });
    if (ok) refetch();
  };

  const handleDeactivate = async (emp: GetAllEmployeeType) => {
    const confirmed = window.confirm(
      `Deactivate ${emp.first_name} ${emp.last_name}?`,
    );
    if (!confirmed) return;

    const ok = await update(emp.registration_id, { status: "inactive" });
    if (ok) refetch();
  };

  if (loading) return <p className="p-6">Loading history...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 space-y-6">
      {/* ---------- TOP BAR ---------- */}
      {/* ---------- TOP BAR ---------- */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-bold">Employee Register History</h1>

          {/* //✅ inline message next to the heading
          {visibleMessage && (
            <p className="text-sm text-green-600 transition-opacity duration-500">
              {visibleMessage}
            </p>
          )} */}
        </div>

        <button
          onClick={() => navigate("/employees")}
          className="bg-gray-100 hover:bg-gray-300 text-blue-firstRate font-semibold px-4 py-2 rounded-lg shadow-md transition"
        >
          ← Back
        </button>
      </div>

      {updateError && (
        <p className="text-sm text-red-500">Update: {updateError}</p>
      )}

      {/* ---------- TABLE ---------- */}
      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">
                ID
              </th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">
                First Name
              </th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">
                Last Name
              </th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">
                Email
              </th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">
                Phone
              </th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">
                TIN
              </th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {allEmployees.map((emp, idx) => (
              <tr
                key={emp.registration_id}
                className={`transition hover:bg-blue-50 ${
                  idx !== allEmployees.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <td className="p-3 text-sm">{emp.registration_id}</td>
                <td className="p-3 text-sm">{emp.first_name}</td>
                <td className="p-3 text-sm">{emp.last_name}</td>
                <td className="p-3 text-sm">{emp.email}</td>
                <td className="p-3 text-sm">{emp.phone}</td>
                <td className="p-3 text-sm">{emp.tin}</td>

                <td className="p-3 text-sm">
                  {emp.status === "active" ? (
                    <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                      active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">
                      inactive
                    </span>
                  )}
                </td>

                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewEmployee(emp)}
                      className="bg-blue-firstRate hover:bg-blue-firstRate/70 text-white px-3 py-1.5 rounded-lg text-sm shadow-sm transition"
                    >
                      View More
                    </button>

                    {emp.status === "inactive" ? (
                      <button
                        onClick={() => handleActivate(emp)}
                        disabled={updating}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm shadow-sm transition disabled:opacity-50"
                      >
                        {updating ? "..." : "Activate"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeactivate(emp)}
                        disabled={updating}
                        className="bg-red-500 hover:bg-red-600/70 text-white px-3 py-1.5 rounded-lg text-sm shadow-sm transition disabled:opacity-50"
                      >
                        {updating ? "..." : "Deactivate"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {allEmployees.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center p-6 text-gray-500">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- VIEW MORE MODAL ---------- */}
      <ViewMoreDetailEmployeeModal
        isOpen={!!viewEmployee}
        employee={viewEmployee}
        onClose={() => setViewEmployee(null)}
      />
    </div>
  );
}
