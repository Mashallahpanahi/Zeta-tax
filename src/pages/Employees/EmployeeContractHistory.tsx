
import { useNavigate } from "react-router-dom";
import {
    getNotActiveContracts,
    getAllRegisteredEmployees,
    type EmployeeContract,
} from "../../api/employeeContractApi";


type Employee = {
    registration_id?: number | string;
    employee_id?: number | string;
    id?: number | string;
    first_name?: string;
    last_name?: string;
};

export default function EmployeeContractHistory() {
    const navigate = useNavigate();

    const {
        data: contractData,
        loading: loadingContracts,
        error: contractError,
    } = getNotActiveContracts();

    const {
        data: employeeData,
        loading: loadingEmployees,
        error: employeeError,
    } = getAllRegisteredEmployees();

    const contracts = contractData ?? [];
    const employees = (employeeData ?? []) as Employee[];

    const columns = [
        "Employee",
        "Hire Date",
        "Termination Date",
        "Status",
        "Position Type",
        "Base Salary",
        "Currency",
        "Employee Type",
    ];

    function getEmployee(contract: EmployeeContract) {
        return employees.find((employee) => {
            const employeeId =
                employee.registration_id ??
                employee.employee_id ??
                employee.id;

            return (
                employeeId !== undefined &&
                employeeId !== null &&
                Number(employeeId) === Number(contract.employee_id)
            );
        });
    }

    if (loadingContracts || loadingEmployees) {
        return <p className="p-6">Loading contract history...</p>;
    }

    if (contractError || employeeError) {
        return (
            <div className="space-y-4 p-6">
                <p role="alert" className="text-red-500">
                    {contractError || employeeError}
                </p>

                <button
                    type="button"
                    onClick={() => navigate("/contracts")}
                    className="rounded-lg bg-blue-firstRate px-4 py-2 text-white transition hover:opacity-90"
                >
                    Back to Contracts
                </button>
            </div>
        );
    }

    return (
        <div className="w-full min-w-0 space-y-6 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-black">
                        Employee Contract History
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        View inactive and terminated employee contracts.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/contracts")}
                    className="rounded-lg bg-gray-100 px-4 py-2 font-semibold text-blue-firstRate shadow-sm transition hover:bg-gray-200"
                >
                    ← Back
                </button>
            </div>

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
                        {contracts.map(
                            (contract: EmployeeContract, index: number) => {
                                const employee = getEmployee(contract);

                                return (
                                    <tr
                                        key={
                                            contract.id ??
                                            contract.contract_id ??
                                            index
                                        }
                                        className="border-b border-gray-100 align-top transition hover:bg-gray-50"
                                    >
                                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                                            {[
                                                employee?.first_name,
                                                employee?.last_name,
                                            ]
                                                .filter(Boolean)
                                                .join(" ") || "—"}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                                            {contract.hire_date?.slice(0, 10) ||
                                                "—"}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                                            {contract.termination_date
                                                ?.slice(0, 10) || "—"}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3">
                                            <span
                                                className={`inline-block rounded px-2 py-1 text-xs font-medium ${contract.status?.toLowerCase() ===
                                                    "active"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {contract.status || "—"}
                                            </span>
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                                            {contract.position_type || "—"}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                                            {contract.base_salary ?? "—"}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                                            {contract.currency || "—"}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                                            {contract.employee_type || "—"}
                                        </td>
                                    </tr>
                                );
                            }
                        )}

                        {contracts.length === 0 && (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="px-4 py-8 text-center text-gray-500"
                                >
                                    No inactive or terminated contracts found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <p className="text-sm text-gray-500">
                Total historical contracts: {contracts.length}
            </p>
        </div>
    );
}
