import { useEffect, useState } from "react";
import {
  getAllEmployeeContracts,
  fetchContractPayrolls,
  type PayrollHistoryType,
} from "../../api/payRollApi";
import PayrollDetailsModal from "../../components/payroll/PayrollDetailsModal";
import { useNavigate } from "react-router-dom";
import ResponsivePage from "../../components/common/ResponsivePage";

export default function PayRollHistory() {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [employeeId, setEmployeeId] = useState("all");
  const {
    data: contracts,
    loading: loadingContracts,
    error: contractsError,
  } = getAllEmployeeContracts();
  const [payrolls, setPayrolls] = useState<PayrollHistoryType[]>([]);
  const [loadingPayrolls, setLoadingPayrolls] = useState(false);
  const [error, setError] = useState("");
  const [selectedPayroll, setSelectedPayroll] =
    useState<PayrollHistoryType | null>(null);

  useEffect(() => {
    let active = true;

    const loadPayrollHistory = async () => {
      if (loadingContracts || contractsError || !contracts) {
        setPayrolls([]);
        return;
      }

      const selectedContracts =
        employeeId === "all"
          ? contracts
          : contracts.filter(
            (contract) => String(contract.employee_id) === employeeId,
          );

      if (selectedContracts.length === 0) {
        setPayrolls([]);
        setError("");
        setLoadingPayrolls(false);
        return;
      }

      setLoadingPayrolls(true);
      setError("");

      try {
        const results = await Promise.all(
          selectedContracts.map((contract) =>
            fetchContractPayrolls(Number(contract.contract_id), month, year),
          ),
        );

        if (!active) return;

        const records = results
          .flatMap((result) => result.data.data || [])
          .filter((payroll) => payroll.pay_status === true)
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );

        setPayrolls(records);
      } catch {
        if (!active) return;

        setPayrolls([]);
        setError("Failed to load payment history.");
      } finally {
        if (active) setLoadingPayrolls(false);
      }
    };

    loadPayrollHistory();

    return () => {
      active = false;
    };
  }, [contracts, loadingContracts, contractsError, employeeId, month, year]);

  const formatDate = (date: string) => {
    const [y, m, d] = date.split("T")[0].split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount: string | number) =>
    Number(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const navigate = useNavigate();

  return (
    <ResponsivePage>
      {/* Header */}
      <div className="flex flex-col gap-4 min-[768px]:flex-row min-[768px]:items-center min-[768px]:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            History of All Payments
          </h1>
          <p className="mt-1 text-sm text-gray-500 2xl:text-base">
            View employee payment records for the selected period.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/EM-payroll")}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-black-700 transition-colors hover:bg-blue-firstRate hover:text-white min-[768px]:w-auto"
        >
          ← Back to Payroll
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm min-[520px]:p-5 2xl:p-6">
        <div className="grid grid-cols-1 items-end gap-4 min-[768px]:grid-cols-3">
          <div className="min-w-0 min-[768px]:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Employee
            </label>

            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All employees</option>

              {Array.from(
                new Map(
                  (contracts || []).map((contract) => [
                    String(contract.employee_id),
                    contract,
                  ]),
                ).values(),
              ).map((contract) => (
                <option
                  key={contract.employee_id}
                  value={String(contract.employee_id)}
                >
                  {contract.employee?.first_name} {contract.employee?.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Date
            </label>

            <input
              type="month"
              value={`${year}-${String(month).padStart(2, "0")}`}
              onChange={(e) => {
                if (!e.target.value) return;

                const [selectedYear, selectedMonth] = e.target.value
                  .split("-")
                  .map(Number);

                setYear(selectedYear);
                setMonth(selectedMonth);
              }}
              className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {(error || contractsError) && (
        <p role="alert" className="text-sm text-red-600">
          {error || contractsError}
        </p>
      )}

      {/* Payment Table */}
      <div className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm 2xl:text-base">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="whitespace-nowrap px-4 py-4 font-semibold text-gray-700 2xl:px-5 2xl:py-5">
                  Full Name
                </th>
                <th className="whitespace-nowrap px-4 py-4 font-semibold text-gray-700 2xl:px-5 2xl:py-5">
                  Base Salary
                </th>
                <th className="whitespace-nowrap px-4 py-4 font-semibold text-gray-700 2xl:px-5 2xl:py-5">
                  Final Paid (AFN)
                </th>
                <th className="whitespace-nowrap px-4 py-4 font-semibold text-gray-700 2xl:px-5 2xl:py-5">
                  Tax (AFN)
                </th>
                <th className="whitespace-nowrap px-4 py-4 font-semibold text-blue-firstRate 2xl:px-5 2xl:py-5">
                  Date
                </th>
                <th className="whitespace-nowrap px-4 py-4 font-semibold text-blue-firstRate 2xl:px-5 2xl:py-5">
                  View More
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loadingContracts || loadingPayrolls ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    Loading payment history...
                  </td>
                </tr>
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    No paid payroll records found.
                  </td>
                </tr>
              ) : (
                payrolls.map((payroll) => {
                  return (
                    <tr
                      key={payroll.payroll_id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 2xl:px-5 2xl:py-5">
                        {payroll.contract.employee.first_name}{" "}
                        {payroll.contract.employee.last_name}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 2xl:px-5 2xl:py-5">
                        {payroll.contract.currency}{" "}
                        {formatAmount(payroll.base_salary)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-gray-800 2xl:px-5 2xl:py-5">
                        AFN {formatAmount(payroll.final_salary)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600 2xl:px-5 2xl:py-5">
                        AFN {formatAmount(payroll.tax)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600 2xl:px-5 2xl:py-5">
                        {formatDate(payroll.date)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 2xl:px-5 2xl:py-5">
                        <button
                          type="button"
                          onClick={() => setSelectedPayroll(payroll)}
                          className="whitespace-nowrap rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                        >
                          View More
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payroll Details Modal */}
      <PayrollDetailsModal
        payroll={selectedPayroll}
        onClose={() => setSelectedPayroll(null)}
      />
    </ResponsivePage>
  );
}

