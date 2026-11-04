import { useEffect, useState } from "react";
import {
  getAllEmployeeContracts,
  fetchContractPayrolls,
  type PayrollHistoryType,
} from "../../api/payRollApi";
import PayrollDetailsModal from "../../components/payroll/PayrollDetailsModal";
import { useNavigate } from "react-router-dom";

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
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            History of All Payments
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View employee payment records for the selected period.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/EM-payroll")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black-700  border border-gray-300 rounded-lg hover:bg-blue-firstRate hover:text-white transition-colors"
        >
          ← Back to Payroll
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee
            </label>

            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm outline-none"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {(error || contractsError) && (
        <p className="text-sm text-red-600">{error || contractsError}</p>
      )}

      {/* Payment Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-700">
                Full Name
              </th>
              <th className="p-4 text-sm font-semibold text-gray-700">
                Base Salary
              </th>
              <th className="p-4 text-sm font-semibold text-gray-700">
                Final Paid (AFN)
              </th>
              <th className="p-4 text-sm font-semibold text-gray-700">
                Tax (AFN)
              </th>
              <th className="p-4 text-sm font-semibold text-blue-firstRate">
                Date
              </th>
              <th className="p-4 text-sm font-semibold  text-blue-firstRate">
                View More
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loadingContracts || loadingPayrolls ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-500">
                  Loading payment history...
                </td>
              </tr>
            ) : payrolls.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-500">
                  No paid payroll records found.
                </td>
              </tr>
            ) : (
              payrolls.map((payroll) => {
                const exchangeRate = Number(payroll.ex_rate);
                const finalPaidAFN =
                  Number(payroll.final_salary) * exchangeRate;
                const taxAFN = Number(payroll.tax) * exchangeRate;

                return (
                  <tr
                    key={payroll.payroll_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 text-sm font-medium text-gray-900">
                      {payroll.contract.employee.first_name}{" "}
                      {payroll.contract.employee.last_name}
                    </td>

                    <td className="p-4 text-sm text-gray-700">
                      {payroll.contract.currency}{" "}
                      {formatAmount(payroll.base_salary)}
                    </td>

                    <td className="p-4 text-sm font-semibold text-gray-800">
                      AFN {formatAmount(finalPaidAFN)}
                    </td>

                    <td className="p-4 text-sm text-gray-600">
                      AFN {formatAmount(taxAFN)}
                    </td>

                    <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(payroll.date)}
                    </td>

                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => setSelectedPayroll(payroll)}
                        className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 whitespace-nowrap"
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

      {/* Payroll Details Modal */}
      <PayrollDetailsModal
        payroll={selectedPayroll}
        onClose={() => setSelectedPayroll(null)}
      />
    </div>
  );
}
