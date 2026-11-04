import type { PayrollHistoryType } from "../../api/payRollApi";

interface PayrollDetailsModalProps {
  payroll: PayrollHistoryType | null;
  onClose: () => void;
}

export default function PayrollDetailsModal({
  payroll,
  onClose,
}: PayrollDetailsModalProps) {
  if (!payroll) return null;

  const formatAmount = (value: string | number) =>
    Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (date: string) => {
    const [year, month, day] = date.split("T")[0].split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ✅ Increased padding, cleaner row layout
  const DetailRow = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <div className="flex justify-between items-center gap-4 py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <span className="text-sm font-semibold text-gray-900 text-right">
        {value}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {/* ✅ Increased max-width to 3xl and added more inner padding */}
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-gray-200 bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Payroll Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Complete payment and employee information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-800 transition-colors text-3xl leading-none"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Employee Information */}
          <section>
            <h3 className="font-bold text-lg text-blue-firstRate mb-4 border-b-2 border-blue-100 pb-2">
              Employee Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
              <div>
                <DetailRow
                  label="Full Name"
                  value={`${payroll.contract.employee.first_name} ${payroll.contract.employee.last_name}`}
                />
                <DetailRow
                  label="Email"
                  value={payroll.contract.employee.email || "—"}
                />
                <DetailRow
                  label="Phone"
                  value={payroll.contract.employee.phone || "—"}
                />
              </div>
              <div>
                <DetailRow
                  label="Position Type"
                  value={payroll.contract.position_type || "—"}
                />
                <DetailRow
                  label="Employee Type"
                  value={payroll.contract.employee_type || "—"}
                />
                <DetailRow
                  label="TIN #"
                  value={payroll.contract.employee.tin || "—"}
                />
              </div>
            </div>
          </section>

          {/* Salary Information */}
          <section>
            <h3 className="font-bold text-lg text-blue-firstRate mb-4 border-b-2 border-blue-100 pb-2">
              Salary Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
              <div>
                <DetailRow
                  label="Base Salary"
                  value={`${payroll.contract.currency} ${formatAmount(
                    payroll.base_salary,
                  )}`}
                />
                <DetailRow
                  label="Overtime Bonus"
                  value={`${payroll.contract.currency} ${formatAmount(
                    payroll.overtime_bonus,
                  )}`}
                />
              </div>
              <div>
                <DetailRow
                  label="Exchange Rate"
                  value={formatAmount(payroll.ex_rate)}
                />
                <DetailRow
                  label="Salary (AFN)"
                  value={`AFN ${formatAmount(payroll.salary_afn)}`}
                />
              </div>
            </div>
          </section>

          {/* Payment Information */}
          <section>
            <h3 className="font-bold text-lg text-blue-firstRate mb-4 border-b-2 border-blue-100 pb-2">
              Payment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
              <div>
                <DetailRow
                  label="Tax Deducted (AFN)"
                  value={`AFN ${formatAmount(payroll.tax)}`}
                />
                <DetailRow
                  label="Final Paid (AFN)"
                  value={`AFN ${formatAmount(payroll.final_salary)}`}
                />
              </div>
              <div>
                <DetailRow
                  label="Payment Date"
                  value={formatDate(payroll.date)}
                />
                <DetailRow
                  label="Payment Status"
                  value={
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        payroll.pay_status
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${payroll.pay_status ? "bg-green-500" : "bg-red-500"}`}
                      ></span>
                      {payroll.pay_status ? "Paid" : "Unpaid"}
                    </span>
                  }
                />
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 sm:p-8 border-t border-gray-200 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
