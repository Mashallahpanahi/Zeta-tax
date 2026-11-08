import { useState, useEffect, useMemo } from "react";
import {
  getActiveContracts,
  getMonthlyPayrolls,
  type EmployeeContract,
  type PayrollType,
} from "../../api/payRollApi";
import PostPayrollModal from "../../components/payroll/PostPayrollModal";
import PrintPayrollModal from "../../components/payroll/PrintPayrollModal";
import { loadTaxRates } from "../../utils/calculateTax";
import { formatNumber } from "../../utils/formatNumber";
import { Link } from "react-router-dom";
import ResponsivePage from "../../components/common/ResponsivePage";
import Loader from "../../components/common/Loader";
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function PayrollPage() {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [selectedContracts, setSelectedContracts] = useState<string[]>([]);
  const [payingContract, setPayingContract] = useState<EmployeeContract | null>(
    null,
  );

  const [printData, setPrintData] = useState<
    { contract: EmployeeContract; payroll: PayrollType }[]
  >([]);

  const [globalExRate, setGlobalExRate] = useState<string>("70");
  const storageKey = "global_exchange_rate";

  useEffect(() => {
    const storedRate = localStorage.getItem(storageKey);
    if (storedRate) {
      setGlobalExRate(storedRate);
    }
  }, []);

  const handleRateChange = (value: string) => {
    setGlobalExRate(value);
    localStorage.setItem(storageKey, value);
  };

  useEffect(() => {
    loadTaxRates();
  }, []);

  const {
    data: contracts,
    loading: loadingContracts,
    error: contractsError,
    refetch: refetchContracts,
  } = getActiveContracts(month, year);

  const {
    data: payrolls,
    loading: loadingPayrolls,
    error: payrollsError,
    refetch: refetchPayrolls,
  } = getMonthlyPayrolls(month, year);

  const loading = loadingContracts || loadingPayrolls;
  const paymentDate = `${year}-${String(month).padStart(2, "0")}-01`;

  const rows = useMemo(() => {
    if (!contracts) return [];
    const monthlyPayrolls = payrolls || [];

    return contracts.map((contract) => {
      const payroll = monthlyPayrolls.find(
        (p) => String(p.contract_id) === String(contract.contract_id),
      );

      return {
        contract,
        payroll: payroll || null,
        // ✅ If payroll doesn't exist, isPaid is naturally false
        isPaid: payroll ? payroll.pay_status : false,
      };
    });
  }, [contracts, payrolls]);

  const totalPaid = rows.filter((r) => r.isPaid).length;
  const totalUnpaid = rows.length - totalPaid;

  const handleRefresh = () => {
    refetchContracts();
    refetchPayrolls();
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedContracts(rows.map((r) => String(r.contract.contract_id)));
    } else {
      setSelectedContracts([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedContracts((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ✅ Print Handlers
  const handlePrintSelected = () => {
    const dataToPrint = rows
      .filter(
        (r) =>
          selectedContracts.includes(String(r.contract.contract_id)) &&
          r.payroll,
      )
      .map((r) => ({
        contract: r.contract,
        payroll: r.payroll as PayrollType,
      }));

    if (dataToPrint.length === 0) {
      alert("Please select at least one paid employee to print.");
      return;
    }
    setPrintData(dataToPrint);
  };

  const handlePrintAll = () => {
    const dataToPrint = rows
      .filter((r) => r.payroll)
      .map((r) => ({
        contract: r.contract,
        payroll: r.payroll as PayrollType,
      }));

    if (dataToPrint.length === 0) {
      alert("No payroll data available to print.");
      return;
    }
    setPrintData(dataToPrint);
  };

  return (
    <ResponsivePage>
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm min-[768px]:flex-row min-[768px]:items-center min-[768px]:justify-between min-[1536px]:p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Employee salary status
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review paid and unpaid salaries for the selected month.
          </p>
        </div>

        <div className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 min-[768px]:flex-none">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none"
          >
            {[
              currentDate.getFullYear() - 1,
              currentDate.getFullYear(),
              currentDate.getFullYear() + 1,
            ].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 min-[768px]:flex-row min-[768px]:items-center min-[1536px]:p-6">
        <div>
          <p className="text-xs text-gray-500 font-medium">Selected Period</p>
          <p className="text-lg font-bold text-gray-900">
            {MONTHS[month - 1]} {year}
          </p>
        </div>

        <div className="flex max-w-full items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm">
          <label
            htmlFor="globalRate"
            className="text-sm font-medium text-gray-600 whitespace-nowrap"
          >
            Exchange Rate (AFN):
          </label>
          <input
            id="globalRate"
            type="number"
            min="0.01"
            step="0.01"
            value={globalExRate}
            onChange={(e) => handleRateChange(e.target.value)}
            className="w-20 text-sm font-bold text-blue-firstRate outline-none bg-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>{" "}
            {totalPaid} paid
          </span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <span className="h-2 w-2 rounded-full bg-red-500"></span>{" "}
            {totalUnpaid} unpaid
          </span>
        </div>
      </div>

      {/* Table */}
      {
        loading ? (
          <Loader className="text-center py-10">Loading payroll data...</Loader>
        ) : (
          <div className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-left text-sm 2xl:text-base">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-4 2xl:px-5 2xl:py-5v w-12">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={
                          selectedContracts.length === rows.length &&
                          rows.length > 0
                        }
                        className="rounded border-gray-300 text-blue-firstRate focus:ring-blue-firstRate"
                      />
                    </th>
                    <th className="px-4 py-4 2xl:px-5 2xl:py-5 text-sm font-semibold text-gray-700">
                      Full name
                    </th>
                    <th className="px-4 py-4 2xl:px-5 2xl:py-5 text-sm font-semibold text-gray-700">
                      Base Salary
                    </th>
                    <th className="px-4 py-4 2xl:px-5 2xl:py-5 text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-4 py-4 2xl:px-5 2xl:py-5 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-4 2xl:px-5 2xl:py-5 text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map(({ contract, payroll, isPaid }) => {
                    const fullName = `${contract.employee?.first_name || ""} ${contract.employee?.last_name || ""}`;
                    const baseSalary = Number(contract.base_salary || 0);
                    const currency = contract.currency || "USD";

                    return (
                      <tr
                        key={contract.contract_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4 2xl:px-5 2xl:py-5">
                          <input
                            type="checkbox"
                            checked={selectedContracts.includes(
                              String(contract.contract_id),
                            )}
                            onChange={() =>
                              handleSelectRow(String(contract.contract_id))
                            }
                            className="rounded border-gray-300 text-blue-firstRate focus:ring-blue-firstRate"
                          />
                        </td>
                        <td className="px-4 py-4 2xl:px-5 2xl:py-5px-4 py-4 2xl:px-5 2xl:py-5 font-medium text-gray-900">
                          {fullName}
                        </td>
                        <td className="px-4 py-4 2xl:px-5 2xl:py-5 text-sm font-semibold text-gray-800">
                          {currency} {formatNumber(baseSalary)}
                        </td>
                        <td className="px-4 py-4 2xl:px-5 2xl:py-5 text-sm text-gray-600">
                          {payroll
                            ? formatDate(payroll.date)
                            : formatDate(paymentDate)}
                        </td>

                        {/* ✅ Simplified Status Column */}
                        <td className="p-4">
                          {payrollsError ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                              Network error
                            </span>
                          ) : isPaid ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>{" "}
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>{" "}
                              Unpaid
                            </span>
                          )}
                        </td>

                        {/* ✅ Simplified Action Column */}
                        <td className="p-4">
                          {payrollsError ? (
                            <button
                              disabled
                              className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
                            >
                              Unavailable
                            </button>
                          ) : isPaid ? (
                            <button className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed">
                              Paid
                            </button>
                          ) : (
                            <button
                              onClick={() => setPayingContract(contract)}
                              className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                ></path>
                              </svg>
                              Pay now
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-gray-500">
                        <p className="text-lg font-medium text-gray-600 mb-1">
                          No contracts in this period of time
                        </p>
                        <p className="text-sm">
                          There are no active employee contracts for{" "}
                          {MONTHS[month - 1]} {year}.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Bulk Actions */}
            <div className="flex flex-wrap gap-3 border-t border-gray-200 bg-gray-50 p-3 min-[520px]:p-4 2xl:p-5">
              <button
                onClick={handlePrintSelected}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-blue-firstRate transition-colors duration-200 hover:bg-blue-firstRate hover:text-white hover:border-blue-firstRate"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  ></path>
                </svg>
                Print selected slips
              </button>

              <button
                onClick={handlePrintAll}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-blue-firstRate transition-colors duration-200 hover:bg-blue-firstRate hover:text-white hover:border-blue-firstRate"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  ></path>
                </svg>
                Print all slips
              </button>

              <Link to="/payroll-history">
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-blue-firstRate transition-colors duration-200 hover:bg-blue-firstRate hover:text-white hover:border-blue-firstRate">
                  History of all payments
                </button>
              </Link>
            </div>
          </div>
        )
      }

      <PostPayrollModal
        isOpen={!!payingContract}
        contract={payingContract}
        date={paymentDate}
        defaultExRate={globalExRate}
        onClose={() => setPayingContract(null)}
        onSuccess={handleRefresh}
      />

      <PrintPayrollModal
        isOpen={printData.length > 0}
        onClose={() => setPrintData([])}
        data={printData}
      />
    </ResponsivePage >
  );
}
