import { useRef } from "react";
import type { EmployeeContract, PayrollType } from "../../api/payRollApi";
import { formatNumber } from "../../utils/formatNumber";

interface PayslipData {
  contract: EmployeeContract;
  payroll: PayrollType;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: PayslipData[];
}

export default function PrintPayrollModal({ isOpen, onClose, data }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || data.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-gray-500/80 backdrop-blur-sm print:bg-white print:block">
      {/* Toolbar (Hidden when printing) */}
      <div className="flex items-center justify-between bg-white px-6 py-4 shadow-md print:hidden">
        <h2 className="text-xl font-bold text-gray-800">
          Print Payslips ({data.length})
        </h2>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-firstRate rounded-lg hover:opacity-90 flex items-center gap-2"
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
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Scrollable Preview Area */}
      <div className="flex-1 overflow-auto p-8 print:p-0 print:overflow-visible">
        {/* ✅ Global Print CSS to force black & white, remove shadows/backgrounds */}
        <style type="text/css" media="print">
          {`
            @page { size: auto; margin: 10mm; }
            body * { visibility: hidden; }
            #print-section, #print-section * { visibility: visible; }
            #print-section { position: absolute; left: 0; top: 0; width: 100%; }
            .page-break { page-break-after: always; }
            
            /* Force remove all backgrounds, colors, and shadows for printing */
            * {
              background-color: transparent !important;
              background: transparent !important;
              box-shadow: none !important;
              text-shadow: none !important;
              color: black !important;
              border-color: black !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          `}
        </style>

        <div
          id="print-section"
          ref={printRef}
          className="flex flex-col items-center gap-8 print:gap-0"
        >
          {data.map((item, index) => {
            const isLast = index === data.length - 1;
            return (
              <div
                key={item.contract.contract_id}
                className={`bg-white w-full max-w-[21cm] min-h-[29.7cm] p-12 print:p-8 ${
                  !isLast ? "page-break" : ""
                }`}
                // Removed shadow-xl so the preview matches the print output exactly
              >
                <PayslipDocument
                  contract={item.contract}
                  payroll={item.payroll}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// The actual Payslip Design (No colors, no gray backgrounds)
// ---------------------------------------------------------
function PayslipDocument({ contract, payroll }: PayslipData) {
  const firstName = contract.employee?.first_name || "";
  const lastName = contract.employee?.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();

  const exRate = Number(payroll.ex_rate || 1);

  // Base Salary (API provides base_salary as USD)
  const baseSalaryUSD = Number(payroll.base_salary || 0);
  const baseSalaryAFN = baseSalaryUSD * exRate;

  // Overtime (API provides overtime_bonus as USD)
  const overtimeUSD = Number(payroll.overtime_bonus || 0);
  const overtimeAFN = overtimeUSD * exRate;

  // Tax (API provides tax as AFN)
  const taxAFN = Number(payroll.tax || 0);
  const taxUSD = taxAFN / exRate;

  // Net Salary (API provides final_salary as AFN)
  const netSalaryAFN = Number(payroll.final_salary || 0);
  const netSalaryUSD = netSalaryAFN / exRate;

  const dateObj = new Date(payroll.date);
  const monthName = dateObj.toLocaleString("en-US", { month: "long" });
  const yearNum = dateObj.getFullYear();

  const printDate = new Date()
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    })
    .replace(/ /g, "-");

  return (
    <div className="text-black font-sans antialiased">
      {/* Header */}
      <div className="text-center mb-8 relative">
        <h1 className="text-3xl font-extrabold tracking-wide font-serif">
          First Rate Afghanistan
        </h1>
        <h2 className="text-xl font-medium mt-1 font-serif">Salary Slip</h2>

        <div className="absolute left-0 top-0 flex items-center gap-3">
          <img
            src="/images/fr.png"
            alt="First Rate Afghanistan"
            className="w-16 h-16 object-contain"
          />
        </div>

        <div className="absolute right-0 top-4 flex items-center gap-4">
          <span className="text-sm font-bold text-black">Date</span>
          <span className="text-base font-medium text-black">{printDate}</span>
        </div>
      </div>

      {/* Top Info Section */}
      <div className="flex justify-between items-start mb-8 gap-6">
        {/* Left Table */}
        <div className="flex-1 border-2 border-black">
          <div className="flex border-b border-black">
            <div className="w-1/3 py-1.5 px-3 font-bold text-sm border-r border-black">
              Name
            </div>
            <div className="w-2/3 py-1.5 px-3 text-sm font-medium">
              {fullName}
            </div>
          </div>
          <div className="flex border-b border-black">
            <div className="w-1/3 py-1.5 px-3 font-bold text-sm border-r border-black">
              Position
            </div>
            <div className="w-2/3 py-1.5 px-3 text-sm font-medium">
              {contract.position_type || "—"}
            </div>
          </div>
          <div className="flex border-b border-black">
            <div className="w-1/3 py-1.5 px-3 font-bold text-sm border-r border-black">
              Month
            </div>
            <div className="w-2/3 py-1.5 px-3 text-sm font-medium">
              {monthName}
            </div>
          </div>
          <div className="flex border-b border-black">
            <div className="w-1/3 py-1.5 px-3 font-bold text-sm border-r border-black">
              Period
            </div>
            <div className="w-2/3 py-1.5 px-3 text-sm font-medium">
              {yearNum}
            </div>
          </div>
          <div className="flex border-b border-black">
            <div className="w-1/3 py-1.5 px-3 font-bold text-sm border-r border-black">
              Budget Line
            </div>
            <div className="w-2/3 py-1.5 px-3 text-sm font-medium">
              Head Office
            </div>
          </div>
          <div className="flex">
            <div className="w-1/3 py-1.5 px-3 font-bold text-sm border-r border-black">
              TIN #
            </div>
            <div className="w-2/3 py-1.5 px-3 text-sm font-medium">
              {contract.employee?.tin || "—"}
            </div>
          </div>
        </div>

        {/* Right Table */}
        <div className="w-[35%] border-2 border-black mt-6">
          <div className="py-1.5 px-3 text-center font-bold text-sm border-b border-black">
            Exchange Rate
          </div>
          <div className="py-2 px-3 text-center text-sm font-medium">
            AFN {formatNumber(exRate)}
          </div>
        </div>
      </div>

      {/* Main Financial Table */}
      <table className="w-full border-2 border-black border-collapse mb-6 text-sm">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="border-r border-black py-2 px-3 text-left w-1/2 font-bold">
              Description
            </th>
            <th className="border-r border-black py-2 px-3 text-right w-1/4 font-bold">
              AFN Amount
            </th>
            <th className="py-2 px-3 text-right w-1/4 font-bold">USD Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-black">
            <td className="border-r border-black py-1.5 px-3 font-semibold">
              Monthly Gross Income / معاش ناخالص
            </td>
            <td className="border-r border-black py-1.5 px-3 text-right font-mono">
              AFN {formatNumber(baseSalaryAFN)}
            </td>
            <td className="py-1.5 px-3 text-right font-mono">
              $ {formatNumber(baseSalaryUSD)}
            </td>
          </tr>
          <tr className="border-b border-black">
            <td className="border-r border-black py-1.5 px-3 font-semibold">
              Overtime/bonus / اضافه کاری
            </td>
            <td className="border-r border-black py-1.5 px-3 text-right font-mono">
              AFN {formatNumber(overtimeAFN)}
            </td>
            <td className="py-1.5 px-3 text-right font-mono">
              $ {formatNumber(overtimeUSD)}
            </td>
          </tr>
          <tr className="border-b border-black">
            <td className="border-r border-black py-1.5 px-3 font-semibold">
              Tax Deducted / مالیات وضع شده
            </td>
            <td className="border-r border-black py-1.5 px-3 text-right font-mono">
              AFN {formatNumber(taxAFN)}
            </td>
            <td className="py-1.5 px-3 text-right font-mono">
              $ {formatNumber(taxUSD)}
            </td>
          </tr>
          <tr className="border-b border-black">
            <td className="border-r border-black py-1.5 px-3 font-bold">
              Net Salary / معاش خالص
            </td>
            <td className="border-r border-black py-1.5 px-3 text-right font-mono font-bold">
              AFN {formatNumber(netSalaryAFN)}
            </td>
            <td className="py-1.5 px-3 text-right font-mono font-bold">
              $ {formatNumber(netSalaryUSD)}
            </td>
          </tr>
          <tr className="border-b-2 border-black">
            <td className="border-r border-black py-2 px-3 font-bold uppercase tracking-wider text-xs">
              Net Salary Payable / معاش قابل پرداخت
            </td>
            <td className="border-r border-black py-2 px-3 text-right font-mono font-bold">
              AFN {formatNumber(netSalaryAFN)}
            </td>
            <td className="py-2 px-3 text-right font-mono font-bold">
              $ {formatNumber(netSalaryUSD)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Footer Disclaimer */}
      <p className="text-xs mb-16 italic text-black">
        The employee declares with his sign that there are no further claims
        against First Rate Afghanistan
      </p>

      {/* Signatures */}
      <div className="flex justify-between px-8 mt-12">
        <div className="text-center w-72">
          <p className="mb-10 text-sm font-semibold text-black">Approved By:</p>
          <p className="font-bold text-sm mb-1 text-black">Fraidon Ahmadian</p>
          <p className="text-xs text-black mb-2">HR & Finance Manager</p>
          <div className="border-b-2 border-black w-full"></div>
        </div>

        <div className="text-center w-72">
          <p className="mb-10 text-sm font-semibold text-black">Received By:</p>
          <p className="font-bold text-sm mb-1 text-black">{fullName}</p>
          <p className="text-xs text-black mb-2">&nbsp;</p>
          <div className="border-b-2 border-black w-full"></div>
        </div>
      </div>
    </div>
  );
}
