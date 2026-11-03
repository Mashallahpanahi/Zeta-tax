
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

    const exchangeRate = Number(payroll.ex_rate);
    const taxAFN = Number(payroll.tax) * exchangeRate;
    const finalSalaryAFN = Number(payroll.final_salary) * exchangeRate;

    const DetailRow = ({
        label,
        value,
    }: {
        label: string;
        value: string | number;
    }) => (
        <div className="flex justify-between gap-4 py-3 border-b border-gray-100">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-sm font-medium text-gray-900 text-right">
                {value}
            </span>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Payroll Details
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Complete payment information
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 text-2xl"
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </div>

                <div className="p-5 space-y-6">
                    {/* Employee Information */}
                    <section>
                        <h3 className="font-semibold text-gray-800 mb-2">
                            Full Name :  {`${payroll.contract.employee.first_name} ${payroll.contract.employee.last_name}`}
                        </h3>

                    </section>
                    {/* Salary Information */}
                    <section>
                        <h3 className="font-semibold text-gray-800 mb-2">
                            Salary Information
                        </h3>

                        <DetailRow
                            label="Base Salary"
                            value={`${payroll.contract.currency} ${formatAmount(payroll.base_salary)}`}
                        />
                        <DetailRow
                            label="Salary (AFN)"
                            value={`AFN ${formatAmount(payroll.salary_afn)}`}
                        />
                        <DetailRow
                            label="Exchange Rate"
                            value={formatAmount(payroll.ex_rate)}
                        />
                        <DetailRow
                            label="Overtime Bonus"
                            value={`USD ${formatAmount(payroll.overtime_bonus)}`}
                        />
                    </section>

                    {/* Payment Information */}
                    <section>
                        <h3 className="font-semibold text-gray-800 mb-2">
                            Payment Information
                        </h3>

                        <DetailRow
                            label="Tax (USD)"
                            value={`USD ${formatAmount(payroll.tax)}`}
                        />
                        <DetailRow
                            label="Tax (AFN)"
                            value={`AFN ${formatAmount(taxAFN)}`}
                        />
                        <DetailRow
                            label="Final Paid (USD)"
                            value={`USD ${formatAmount(payroll.final_salary)}`}
                        />
                        <DetailRow
                            label="Final Paid (AFN)"
                            value={`AFN ${formatAmount(finalSalaryAFN)}`}
                        />
                        <DetailRow
                            label="Payment Date"
                            value={formatDate(payroll.date)}
                        />
                        <DetailRow
                            label="Payment Status"
                            value={payroll.pay_status ? "Paid" : "Unpaid"}
                        />
                    </section>
                </div>

                <div className="flex justify-end p-5 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
