
import { useEffect, useState } from "react";
import {
  getAllContracts,
  getActiveEmployees,
  updateContract,
  type Employee,
  type EmployeeContract,
} from "../../api/employeeContractApi";
import EmployeeContractModal from "../../components/employee/EmployeeContractModel";
import EmployeeContractDetailsModal from "../../components/employee/EmployeeContractDetailsModal";

export default function ContractPage() {
  const {
    data: contractData,
    loading: loadingContracts,
    error: contractError,
    refetch: refetchContracts,
  } = getAllContracts();

  const {
    data: employeeData,
    loading: loadingEmployees,
    error: employeeError,
    refetch: refetchEmployees,
  } = getActiveEmployees();

  const { update, loading: savingStatus, } = updateContract();
  const contracts = contractData ?? [];
  const employees = employeeData ?? [];

  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editContract, setEditContract] = useState<EmployeeContract | null>(null);
  const [viewContract, setViewContract] = useState<EmployeeContract | null>(null);
  const loading = loadingContracts || loadingEmployees;
  const error = actionError || contractError || employeeError || "";

  function refetch() {
    refetchContracts();
    refetchEmployees();
  }

  useEffect(() => {
    if (!message) return;

    const timer = window.setTimeout(() => {
      setMessage("");
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [message]);

  async function handleDeactivate(
    contract: EmployeeContract,
  ) {
    const id = contract.id ?? contract.contract_id;

    if (id === undefined || id === null) {
      setActionError("Contract ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to deactivate this contract?",
    );

    if (!confirmed) return;

    setActionError("");
    setMessage("");

    const success = await update(id, {
      status: "Inactive",
    });

    if (!success) {
      setActionError(
        'Could not deactivate the contract. Confirm that the backend accepts status "Inactive".',
      );
      return;
    }
    setMessage("Contract status updated.");
    refetch();
  }

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

  function closeContractModal() {
    setIsCreateOpen(false);
    setEditContract(null);
  }

  function handleContractSuccess() {
    setMessage(
      editContract
        ? "Contract updated successfully."
        : "Contract created successfully.",
    );

    refetch();
  }

  if (loading) {
    return <p className="p-6">Loading contracts...</p>;
  }

  if (error && contracts.length === 0) {
    return (
      <div className="space-y-4 p-6">
        <p role="alert" className="text-red-500">
          Error: {error}
        </p>

        <button
          type="button"
          onClick={() => {
            setActionError("");
            refetch();
          }}
          className="rounded-lg bg-blue-firstRate px-4 py-2 text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold">
          Employee Contracts
        </h1>

        <button
          type="button"
          onClick={() => {
            setEditContract(null);
            setIsCreateOpen(true);
          }}
          className="rounded-lg bg-blue-firstRate px-4 py-2 text-white shadow-sm transition hover:opacity-90"
        >
          + Create New Contract
        </button>
      </div>

      {message && (
        <p role="status" className="text-sm text-green-600">
          {message}
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full min-w-[620px] border-collapse">
          <thead className="bg-gray-50">
            <tr>
              {["ID", "First Name", "Last Name", "Termination Date", "Actions"
              ].map((heading) => (
                <th
                  key={heading}
                  className="whitespace-nowrap p-3 text-left text-sm font-semibold text-gray-700"
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
              const isActive =
                contract.status?.toLowerCase() === "active";

              return (
                <tr
                  key={id ?? index}
                  className="border-b border-gray-100 transition hover:bg-blue-50"
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
                    {contract.termination_date?.slice(0, 10) || "—"}
                  </td>

                  <td className="whitespace-nowrap p-3">
                    <div className="flex w-max flex-nowrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewContract(contract)}
                        className="rounded-lg border border-gray-300 bg-blue-firstRate px-3 py-1.5
                         text-sm text-white transition hover:bg-blue-firstRate/90"
                      >
                        View More
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsCreateOpen(false);
                          setEditContract(contract);
                        }}
                        className="rounded-lg bg-yellow-500 px-3 py-1.5 text-sm text-white transition hover:bg-yellow-600/70"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          void handleDeactivate(contract);
                        }}
                        disabled={savingStatus || !isActive}
                        className="rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white transition hover:bg-red-600/70 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {savingStatus ? "..." : "Deactivate"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {contracts.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-gray-500"
                >
                  No contracts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create and edit contract modal */}
      <EmployeeContractModal
        isOpen={isCreateOpen || !!editContract}
        contract={editContract}
        onClose={closeContractModal}
        onSuccess={handleContractSuccess}
      />

      {/* Read-only details modal */}
      <EmployeeContractDetailsModal
        contract={viewContract}
        employeeName={
          viewContract
            ? [
              getEmployee(viewContract)?.first_name,
              getEmployee(viewContract)?.last_name,
            ]
              .filter(Boolean)
              .join(" ") || "Unknown employee"
            : "Unknown employee"
        }
        onClose={() => setViewContract(null)}
      />
    </div>
  );
}