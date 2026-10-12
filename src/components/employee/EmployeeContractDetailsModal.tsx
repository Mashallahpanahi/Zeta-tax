
import type { EmployeeContract } from "../../api/employeeContractApi";
interface Props {
    contract: EmployeeContract | null;
    employeeName: string;
    onClose: () => void;
}

export default function EmployeeContractDetailsModal({
    contract,
    employeeName,
    onClose,
}: Props) {
    if (!contract) return null;

    const details = [
        { label: "Employee Name", value: employeeName },
        { label: "Employee ID", value: contract.employee_id },
        {
            label: "Hire Date",
            value: contract.hire_date?.slice(0, 10) || "—",
        },
        {
            label: "Termination Date",
            value: contract.termination_date?.slice(0, 10) || "—",
        },
        { label: "Status", value: contract.status || "—" },
        {
            label: "Position",
            value: contract.position_type || "—",
        },
        {
            label: "Base Salary",
            value: `${Number(contract.base_salary).toLocaleString()} ${contract.currency ?? ""}`.trim(),
        },
        { label: "Currency", value: contract.currency || "—" },
        {
            label: "Employee Type",
            value: contract.employee_type || "—",
        },
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="contract-details-title"
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-6 flex items-center justify-between gap-4">
                    <h2
                        id="contract-details-title"
                        className="text-xl font-bold text-blue-firstRate"
                    >
                        Employee Contract Details
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close details"
                        className="rounded-lg px-3 py-1 text-2xl text-gray-500 hover:bg-gray-100"
                    >
                        ×
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {details.map((detail) => (
                        <div
                            key={detail.label}
                            className="min-w-0 rounded-lg border border-gray-100 bg-gray-50 p-4"
                        >
                            <p className="mb-1 text-xs font-semibold capitalize tracking-wide text-gray-500">
                                {detail.label}
                            </p>

                            <p className="break-words text-sm font-medium text-gray-800">
                                {detail.value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}