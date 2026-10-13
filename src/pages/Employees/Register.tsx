import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllEmployees,
  updateEmployee,
  type GetAllEmployeeType,
} from "../../api/employeeApi";
import RegisterNewEmployeeModal from "../../components/employee/RegisterNewEmployeeModal";
import UpdateEmployeeModal from "../../components/employee/UpdateEmployeeModal";
import ViewMoreDetailEmployeeModal from "../../components/employee/viewmoreDetailEmployeeModal";

export default function RegisteredNewEmployeePage() {
  const navigate = useNavigate();

  const {
    data: employees,
    message,
    loading,
    error,
    refetch,
  } = getAllEmployees();

  const { update, loading: updating, error: updateError } = updateEmployee();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<GetAllEmployeeType | null>(
    null,
  );
  const [viewEmployee, setViewEmployee] = useState<GetAllEmployeeType | null>(
    null,
  );

  const [visibleMessage, setVisibleMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    setVisibleMessage(message);

    const timer = setTimeout(() => {
      setVisibleMessage(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [message]);

  const activeEmployees =
    employees?.filter((emp) => emp.status === "active") ?? [];

  const handleInactive = async (emp: GetAllEmployeeType) => {
    const confirmed = window.confirm(
      `Are you sure you want to set ${emp.first_name} ${emp.last_name} as inactive?`,
    );
    if (!confirmed) return;

    const ok = await update(emp.registration_id, { status: "inactive" });
    if (ok) refetch();
  };

  if (loading) return <p className="p-6">Loading employees...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 space-y-6">
      {/* ---------- TOP BAR ---------- */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-bold">Active Employees</h1>

          {/* // ✅ inline message next to the heading
          {visibleMessage && (
            <p className="text-sm text-green-600 transition-opacity duration-500">
              {visibleMessage}
            </p>
          )} */}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate("/employee-register-history")}
            className="bg-gray-200 text-blue-firstRate font-semibold hover:bg-gray-300 px-4 py-2 rounded-lg shadow-sm transition"
          >
            History
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-blue-firstRate hover:bg-blue-firstRate/90 font-semibold text-white px-4 py-2 rounded-lg shadow-sm transition"
          >
            + Register new employee
          </button>
        </div>
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
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {activeEmployees.map((emp, idx) => (
              <tr
                key={emp.registration_id}
                className={`transition hover:bg-blue-50 ${
                  idx !== activeEmployees.length - 1
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

                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewEmployee(emp)}
                      className="bg-blue-firstRate hover:bg-blue-firstRate/70 text-white px-3 py-1.5 rounded-lg text-sm shadow-sm transition"
                    >
                      View More
                    </button>

                    <button
                      onClick={() => setEditEmployee(emp)}
                      className="bg-yellow-500 hover:bg-yellow-600/70 text-white px-3 py-1.5 rounded-lg text-sm shadow-sm transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleInactive(emp)}
                      disabled={updating}
                      className="bg-red-500 hover:bg-red-600/70 text-white px-3 py-1.5 rounded-lg text-sm shadow-sm transition disabled:opacity-50"
                    >
                      {updating ? "..." : "Deactivate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {activeEmployees.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center p-6 text-gray-500">
                  No active employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- MODALS ---------- */}
      <RegisterNewEmployeeModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={refetch}
      />

      <UpdateEmployeeModal
        isOpen={!!editEmployee}
        employee={editEmployee}
        onClose={() => setEditEmployee(null)}
        onSuccess={refetch}
      />

      <ViewMoreDetailEmployeeModal
        isOpen={!!viewEmployee}
        employee={viewEmployee}
        onClose={() => setViewEmployee(null)}
      />
    </div>
  );
}
