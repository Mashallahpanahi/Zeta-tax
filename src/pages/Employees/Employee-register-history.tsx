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

  const allEmployees = employees ?? [];

  const columns = [
    "ID",
    "First Name",
    "Last Name",
    "Phone",
    "TIN",
    "Status",
    "Actions",
  ];

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

  if (loading) {
    return <p className="p-6">Loading contract history...</p>;
  }

  if (error) {
    return (
      <div className="space-y-4 p-6">
        <p role="alert" className="text-red-500">
          {error}
        </p>

        <button
          type="button"
          onClick={() => navigate("/employees")}
          className="rounded-lg bg-blue-firstRate px-2 py-2 text-white transition hover:opacity-90"
        >
          Back to Employees
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-[1640px] space-y-6 p-4 sm:p-6">
      {/* ---------- TOP BAR ---------- */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-xl font-bold text-black">
              Employee Register History
            </h1>

            {visibleMessage && (
              <p className="text-sm text-green-600">{visibleMessage}</p>
            )}
          </div>

          <p className="mt-1 text-sm text-gray-500">
            View active and inactive employee registrations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/employees")}
          className="rounded-lg bg-gray-100 px-2 py-2 font-semibold text-blue-firstRate shadow-sm transition hover:bg-gray-200"
        >
          ← Back
        </button>
      </div>

      {updateError && (
        <p role="alert" className="text-sm text-red-500">
          Update: {updateError}
        </p>
      )}

      {/* ---------- TABLE ---------- */}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-gray-100">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="whitespace-nowrap border-b border-gray-200 px-4 py-3 font-semibold text-gray-700"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {allEmployees.map((emp, idx) => (
              <tr
                key={emp.registration_id}
                className="border-b border-gray-100 align-top transition hover:bg-gray-50"
              >
                <td className="whitespace-nowrap px-2 py-3 text-gray-700">
                  {emp.registration_id}
                </td>
                <td className="whitespace-nowrap px-2 py-3 text-gray-700">
                  {emp.first_name}
                </td>
                <td className="whitespace-nowrap px-2 py-3 text-gray-700">
                  {emp.last_name}
                </td>
                <td className="whitespace-nowrap px-2 py-3 text-gray-700">
                  {emp.phone}
                </td>
                <td className="whitespace-nowrap px-2 py-3 text-gray-700">
                  {emp.tin}
                </td>

                {/* Status badge */}
                <td className="whitespace-nowrap px-2 py-3">
                  <span
                    className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                      emp.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {emp.status || "—"}
                  </span>
                </td>

                {/* Actions */}
                <td className="whitespace-nowrap px-2 py-3">
                  <div className="flex w-max flex-nowrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setViewEmployee(emp)}
                      className="rounded-lg bg-blue-firstRate px-3 py-1.5 text-xs text-white shadow-sm transition hover:bg-blue-firstRate/70"
                    >
                      View More
                    </button>

                    {emp.status === "inactive" ? (
                      <button
                        type="button"
                        onClick={() => handleActivate(emp)}
                        disabled={updating}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white shadow-sm transition hover:bg-green-700 disabled:opacity-50"
                      >
                        {updating ? "..." : "Activate"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDeactivate(emp)}
                        disabled={updating}
                        className="rounded-lg bg-red-500 px-3 py-1.5 text-xs text-white shadow-sm transition hover:bg-red-600/70 disabled:opacity-50"
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
                <td colSpan={8} className="px-2 py-8 text-center text-gray-500">
                  No employee registrations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500">
        Total employee registrations: {allEmployees.length}
      </p>

      {/* ---------- VIEW MORE MODAL ---------- */}
      <ViewMoreDetailEmployeeModal
        isOpen={!!viewEmployee}
        employee={viewEmployee}
        onClose={() => setViewEmployee(null)}
      />
    </div>
  );
}
