import { useEffect, useState } from "react";
import {
  getActiveContracts,
  getAllRegisteredEmployees,
  updateContract,
  type EmployeeContract,
} from "../../api/employeeContractApi";

import { useNavigate } from "react-router-dom";
import Loader from "../../components/common/Loader";
import ResponsivePage from "../../components/common/ResponsivePage";
import CreateEmployeeContractModal from "../../components/employee/CreateEmployeeContractModal";
import EmployeeContractDetailsModal from "../../components/employee/EmployeeContractDetailsModal";
import UpdateEmployeeContractModal from "../../components/employee/UpdateEmployeeContractModal";

export default function ContractPage() {
  const {
    data: contractData,
    loading: loadingContracts,
    error: contractError,
    refetch: refetchContracts,
  } = getActiveContracts();
  const navigate = useNavigate();

  const {
    data: employeeData,
    loading: loadingEmployees,
    error: employeeError,
    refetch: refetchEmployees,
  } = getAllRegisteredEmployees();

  const { update, loading: savingStatus } = updateContract();

  const contracts = contractData ?? [];
  const employees = employeeData ?? [];

  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editContract, setEditContract] = useState<EmployeeContract | null>(
    null,
  );
  const [viewContract, setViewContract] = useState<EmployeeContract | null>(
    null,
  );
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

  async function handleDeactivate(contract: EmployeeContract) {
    const id = contract.id ?? contract.contract_id;

    if (id === undefined || id === null) {
      setActionError("Contract ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${getEmployee(contract)?.first_name ?? ""} ${getEmployee(contract)?.last_name ?? ""}'s contract?`,
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
    navigate("/contract-history");
  }

  function getEmployee(contract: EmployeeContract) {
    return employees.find((employee) => {
      const employeeId =
        employee.registration_id ?? employee.employee_id ?? employee.id;

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
    return <Loader message="Loading contracts..." fullPage />;
  }

  if (error && contracts.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[2200px] space-y-4 p-3 min-[520px]:p-4 min-[1024px]:p-6 min-[1536px]:p-8 min-[1920px]:p-10">
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
    <ResponsivePage>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold">Employee Contracts</h1>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/contract-history")}
            className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-blue-firstRate shadow-sm transition hover:bg-gray-300"
          >
            History
          </button>

          <button
            type="button"
            onClick={() => {
              setEditContract(null);
              setIsCreateOpen(true);
            }}
            className="rounded-lg bg-blue-firstRate px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-blue-firstRate/90"
          >
            + Create new Contract
          </button>
        </div>
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

      <div className="w-full min-w-0 max-w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[700px] border-collapse text-sm 2xl:text-base">
          <thead className="bg-gray-50">
            <tr>
              {[
                "ID",
                "First Name",
                "Last Name",
                "Termination Date",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-gray-700 2xl:px-5 2xl:py-4"
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
              const isActive = contract.status?.toLowerCase() === "active";

              return (
                <tr
                  key={id ?? index}
                  className="border-b border-gray-100 transition hover:bg-blue-50"
                >
                  <td className="whitespace-nowrap px-4 py-4 text-sm 2xl:px-5 2xl:py-5">
                    {id ?? "—"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-sm 2xl:px-5 2xl:py-5">
                    {employee?.first_name ?? "—"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-sm 2xl:px-5 2xl:py-5">
                    {employee?.last_name ?? "—"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-sm 2xl:px-5 2xl:py-5">
                    {contract.termination_date?.slice(0, 10) || "—"}
                  </td>

                  <td className="whitespace-nowrap p-3">
                    <div className="flex w-max flex-nowrap items-center gap-2 2xl:gap-3">
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
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No contracts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CreateEmployeeContractModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleContractSuccess}
      />

      <UpdateEmployeeContractModal
        isOpen={!!editContract}
        contract={editContract}
        employeeName={
          editContract
            ? [
                getEmployee(editContract)?.first_name,
                getEmployee(editContract)?.last_name,
              ]
                .filter(Boolean)
                .join(" ") || "Employee not found"
            : ""
        }
        onClose={() => setEditContract(null)}
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
    </ResponsivePage>
  );
}
