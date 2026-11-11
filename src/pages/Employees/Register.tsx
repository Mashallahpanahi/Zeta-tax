import { useState, useEffect } from "react";
import Loader from "../../components/common/Loader";
import { useNavigate } from "react-router-dom";
import {
  getAllEmployees,
  updateEmployee,
  type GetAllEmployeeType,
} from "../../api/employeeApi";
import RegisterNewEmployeeModal from "../../components/employee/RegisterNewEmployeeModal";
import UpdateEmployeeModal from "../../components/employee/UpdateEmployeeModal";
import ViewMoreDetailEmployeeModal from "../../components/employee/viewmoreDetailEmployeeModal";
import ResponsivePage from "../../components/common/ResponsivePage";

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

    const timer = setTimeout(() => setVisibleMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  const activeEmployees =
    employees?.filter((emp) => emp.status === "active") ?? [];

  const columns = [
    "ID",
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Actions",
  ];

  const handleInactive = async (emp: GetAllEmployeeType) => {
    const confirmed = window.confirm(
      `Are you sure you want to set ${emp.first_name} ${emp.last_name} as inactive?`,
    );
    if (!confirmed) return;

    const ok = await update(emp.registration_id, { status: "inactive" });
    if (ok) refetch();
  };

  if (loading) {
    return <Loader message="Loading employees..." fullPage />;
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
          className="rounded-lg bg-blue-firstRate px-4 py-2 text-white transition hover:opacity-90"
        >
          Back to Employees
        </button>
      </div>
    );
  }

  return (
    <ResponsivePage>
      {/* ---------- TOP BAR ---------- */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-xl font-bold text-black">Active Employees</h1>

            {visibleMessage && (
              <p className="text-sm text-green-600">{visibleMessage}</p>
            )}
          </div>

          <p className="mt-1 text-sm text-gray-500">
            View and manage active employee registrations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/employee-register-history")}
            className="rounded-lg bg-gray-100 px-4 py-2 font-semibold text-blue-firstRate shadow-sm transition hover:bg-gray-200"
          >
            History
          </button>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="rounded-lg bg-blue-firstRate px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-blue-firstRate/90"
          >
            + Register new employee
          </button>
        </div>
      </div>

      {updateError && (
        <p role="alert" className="text-sm text-red-500">
          Update: {updateError}
        </p>
      )}

      {/* ---------- TABLE ---------- */}
      <div className="w-full min-w-0 max-w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[700px] border-collapse text-left text-sm lg:text-base">
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
            {activeEmployees.map((emp) => (
              <tr
                key={emp.registration_id}
                className="border-b border-gray-100 align-top transition hover:bg-gray-50"
              >
                <td className="whitespace-nowrap px-4 py-4 text-gray-700 2xl:px-5 2xl:py-5">
                  {emp.registration_id}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-gray-700 2xl:px-5 2xl:py-5">
                  {emp.first_name}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-gray-700 2xl:px-5 2xl:py-5">
                  {emp.last_name}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-gray-700 2xl:px-5 2xl:py-5">
                  {emp.email}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-gray-700 2xl:px-5 2xl:py-5">
                  {emp.phone}
                </td>

                {/* Actions */}
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex w-max flex-nowrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setViewEmployee(emp)}
                      className="rounded-lg bg-blue-firstRate px-3 py-1.5 text-xs text-white shadow-sm transition hover:bg-blue-firstRate/70"
                    >
                      View More
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditEmployee(emp)}
                      className="rounded-lg bg-yellow-500 px-3 py-1.5 text-xs text-white shadow-sm transition hover:bg-yellow-600/70"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInactive(emp)}
                      disabled={updating}
                      className="rounded-lg bg-red-500 px-3 py-1.5 text-xs text-white shadow-sm transition hover:bg-red-600/70 disabled:opacity-50"
                    >
                      {updating ? "..." : "Deactivate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {activeEmployees.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No active employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500">
        Total active employees: {activeEmployees.length}
      </p>

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
    </ResponsivePage>
  );
}
