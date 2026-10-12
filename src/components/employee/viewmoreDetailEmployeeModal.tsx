import type { GetAllEmployeeType } from "../../api/employeeApi";

interface Props {
  isOpen: boolean;
  employee: GetAllEmployeeType | null;
  onClose: () => void;
}

export default function ViewMoreDetailEmployeeModal({
  isOpen,
  employee,
  onClose,
}: Props) {
  if (!isOpen || !employee) return null;

  const labelClass = "text-xs text-gray-500";
  const valueClass = "text-sm text-gray-800 font-medium";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        {/* ---------- HEADER ---------- */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-blue-firstRate">
            Employee Details #{employee.registration_id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl"
          >
            ✕
          </button>
        </div>

        {/* ---------- DETAILS ---------- */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <p className={labelClass}>First Name</p>
            <p className={valueClass}>{employee.first_name || "—"}</p>
          </div>
          <div>
            <p className={labelClass}>Last Name</p>
            <p className={valueClass}>{employee.last_name || "—"}</p>
          </div>

          <div>
            <p className={labelClass}>Email</p>
            <p className={valueClass}>{employee.email || "—"}</p>
          </div>
          <div>
            <p className={labelClass}>Phone</p>
            <p className={valueClass}>{employee.phone || "—"}</p>
          </div>

          <div>
            <p className={labelClass}>Date of Birth</p>
            <p className={valueClass}>{employee.date_of_birth || "—"}</p>
          </div>
          <div>
            <p className={labelClass}>Gender</p>
            <p className={valueClass}>{employee.gender || "—"}</p>
          </div>

          <div>
            <p className={labelClass}>Status</p>
            <p className={valueClass}>
              <span
                className={`px-2 py-0.5 rounded text-xs ${
                  employee.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {employee.status}
              </span>
            </p>
          </div>
          <div>
            <p className={labelClass}>National ID</p>
            <p className={valueClass}>{employee.national_id || "—"}</p>
          </div>

          <div>
            <p className={labelClass}>TIN</p>
            <p className={valueClass}>{employee.tin || "—"}</p>
          </div>
          <div>
            <p className={labelClass}>Bank Account</p>
            <p className={valueClass}>{employee.bank_account || "—"}</p>
          </div>

          <div className="col-span-2">
            <p className={labelClass}>Address</p>
            <p className={valueClass}>{employee.address || "—"}</p>
          </div>

          <div>
            <p className={labelClass}>Created At</p>
            <p className={valueClass}>
              {employee.created_at
                ? new Date(employee.created_at).toLocaleString()
                : "—"}
            </p>
          </div>
          <div>
            <p className={labelClass}>Updated At</p>
            <p className={valueClass}>
              {employee.updated_at
                ? new Date(employee.updated_at).toLocaleString()
                : "—"}
            </p>
          </div>
        </div>

        {/* ---------- ACTIONS ---------- */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="bg-blue-firstRate hover:bg-blue-firstRate/90 text-white px-4 py-1.5 text-sm rounded-lg shadow-sm transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}