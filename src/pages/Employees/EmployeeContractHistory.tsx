
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getNotActiveContracts,
    getAllRegisteredEmployees,
    updateContract,
    type EmployeeContract,
} from "../../api/employeeContractApi";
import EmployeeContractDetailsModal from "../../components/employee/EmployeeContractDetailsModal";

export default function EmployeeContractHistory() {
    const navigate = useNavigate();

    const {
        data: contractData,
        loading: loadingContracts,
        error: contractError,
        refetch: refetchContracts,
    } = getNotActiveContracts();

    const {
        data: employeeData,
        loading: loadingEmployees,
        error: employeeError,
    } = getAllRegisteredEmployees();

    const { update, loading: updating } = updateContract();

    const contracts = contractData ?? [];
    const employees = employeeData ?? [];

    const [viewContract, setViewContract] =
        useState<EmployeeContract | null>(null);
    const [message, setMessage] = useState("");
    const [actionError, setActionError] = useState("");

    function getEmployee(contract: EmployeeContract) {
        return employees.find((employee) => {
            const employeeId =
                employee.registration_id ??
                employee.employee_id ??
                employee.id;

            return (
                employeeId !== undefined &&
                Number(employeeId) === Number(contract.employee_id)
            );
        });
    }

    async function handleActivate(contract: EmployeeContract) {
        const id = contract.id ?? contract.contract_id;

        if (id === undefined || id === null) {
            setActionError("Contract ID is missing.");
            return;
        }

        const employee = getEmployee(contract);
        const employeeName =
            [employee?.first_name, employee?.last_name]
                .filter(Boolean)
                .join(" ") || "this employee";

        if (
            !window.confirm(
                `Are you sure you want to activate ${employeeName}'s contract?`
            )
        ) {
            return;
        }

        setActionError("");
        setMessage("");

        const success = await update(id, { status: "Active" });

        if (!success) {
            setActionError("Could not activate the contract.");
            return;
        }

        setMessage("Contract activated successfully.");
        refetchContracts();
    }

    if (loadingContracts || loadingEmployees) {
        return <p className="p-6">Loading contract history...</p>;
    }

    if ((contractError || employeeError) && contracts.length === 0) {
        return (
            <div className="space-y-4 p-6">
                <p role="alert" className="text-red-500">
                    {contractError || employeeError}
                </p>
                <button
                    type="button"
                    onClick={() => navigate("/contracts")}
                    className="rounded-lg bg-blue-firstRate px-4 py-2 text-white"
                >
                    Back to Contracts
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-xl font-bold text-black">
                    Employee Contract History
                </h1>

                <button
                    type="button"
                    onClick={() => navigate("/contracts")}
                    className="bg-gray-100 hover:bg-gray-300 text-blue-firstRate font-semibold px-4 py-2 rounded-lg shadow-md transition"
                >
                    ← Back
                </button>
            </div>

            {message && (
                <p role="status" className="text-sm text-green-600">
                    {message}
                </p>
            )}

            {actionError && (
                <p role="alert" className="text-sm text-red-500">
                    {actionError}
                </p>
            )}

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full min-w-[760px] border-collapse">
                    <thead className="bg-gray-50">
                        <tr>
                            {[
                                "ID",
                                "First Name",
                                "Last Name",
                                "Hire Date",
                                "Status",
                                "Actions",
                            ].map((heading) => (
                                <th
                                    key={heading}
                                    className="whitespace-nowrap p-3 text-left text-sm font-medium text-gray-700"
                                >
                                    {heading}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {contracts.map((contract, index) => {
                            const id = contract.id ?? contract.contract_id;
                            const employee = getEmployee(contract);
                            const isUpdating = updating;

                            return (
                                <tr
                                    key={id ?? index}
                                    className="border-b border-gray-100 hover:bg-gray-50"
                                >
                                    <td className="whitespace-nowrap p-3 text-sm">
                                        {id ?? "—"}
                                    </td>

                                    <td className="whitespace-nowrap p-3 text-sm">
                                        {employee?.first_name ?? "—"}
                                    </td>

                                    <td className="whitespace-nowrap p-3 text-sm">
                                        {employee?.last_name ?? "—"}
                                    </td>

                                    <td className="whitespace-nowrap p-3 text-sm">
                                        {contract.hire_date?.slice(0, 10) || "—"}
                                    </td>

                                    <td className="whitespace-nowrap p-3 text-sm">
                                        <span
                                            className={`rounded px-2 py-1 text-xs ${contract.status?.toLowerCase() === "terminated"
                                                ? "bg-red-100 text-red-600"
                                                : "bg-red-100 text-red-600"
                                                }`}
                                        >
                                            {contract.status}
                                        </span>
                                    </td>

                                    <td className="p-3">
                                        <div className="flex w-max items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setViewContract(contract)}
                                                className="rounded-lg bg-blue-firstRate px-3 py-2 text-sm text-white hover:opacity-90"
                                            >
                                                View More
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => void handleActivate(contract)}
                                                disabled={isUpdating}
                                                className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                                            >
                                                {isUpdating ? "..." : "Activate"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {contracts.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="p-6 text-center text-gray-500"
                                >
                                    No inactive or terminated contracts found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <EmployeeContractDetailsModal
                contract={viewContract}
                employeeName={
                    viewContract
                        ? [
                            getEmployee(viewContract)?.first_name,
                            getEmployee(viewContract)?.last_name,
                        ]
                            .filter(Boolean)
                            .join(" ") || "Employee not found"
                        : ""
                }
                onClose={() => setViewContract(null)}
            />
        </div>
    );
}
