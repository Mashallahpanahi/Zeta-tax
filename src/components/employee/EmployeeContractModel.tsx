
import { useEffect, useState } from "react";
import {
    createContract,
    getActiveEmployees,
    updateContract,
    type Employee,
    type EmployeeContract,
} from "../../api/employeeContractApi";

interface Props {
    isOpen: boolean;
    contract: EmployeeContract | null;
    onClose: () => void;
    onSuccess: () => void;
}

const emptyForm = {
    employee_id: "",
    hire_date: "",
    termination_date: "",
    status: "Active",
    position_type: "Permanent",
    base_salary: "",
    currency: "USD",
    employee_type: "Full-time",
};

export default function EmployeeContractModal({
    isOpen,
    contract,
    onClose,
    onSuccess,
}: Props) {
    const {
        data: employeeData,
        loading: loadingEmployees,
        error: employeeError,
    } = getActiveEmployees();

    const {
        create,
        loading: creating,
        error: createError,
    } = createContract();

    const {
        update,
        loading: updating,
        error: updateError,
    } = updateContract();

    const employees = employeeData ?? [];
    const saving = creating || updating;

    const [form, setForm] = useState({ ...emptyForm });
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) return;

        setError("");

        if (contract) {
            setForm({
                employee_id: String(contract.employee_id),
                hire_date: contract.hire_date?.slice(0, 10) ?? "",
                termination_date:
                    contract.termination_date?.slice(0, 10) ?? "",
                status: contract.status,
                position_type: contract.position_type,
                base_salary: String(contract.base_salary),
                currency: contract.currency,
                employee_type: contract.employee_type,
            });
        } else {
            setForm({ ...emptyForm });
        }
    }, [isOpen, contract]);

    useEffect(() => {
        if (!isOpen) return;

        if (employeeError) {
            setError("Could not load employees.");
        } else if (createError) {
            setError(createError);
        } else if (updateError) {
            setError(updateError);
        }
    }, [
        isOpen,
        employeeError,
        createError,
        updateError,
    ]);

    if (!isOpen) return null;

    function handleChange(
        event: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >,
    ) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();
        setError("");

        if (!form.employee_id) {
            setError("Please select an employee.");
            return;
        }

        if (!form.hire_date) {
            setError("Please select a hire date.");
            return;
        }

        if (
            form.termination_date &&
            form.termination_date < form.hire_date
        ) {
            setError(
                "Termination date cannot be before the hire date.",
            );
            return;
        }

        if (
            form.base_salary.trim() === "" ||
            !Number.isFinite(Number(form.base_salary)) ||
            Number(form.base_salary) < 0
        ) {
            setError("Please enter a valid base salary.");
            return;
        }

        const payload: EmployeeContract = {
            employee_id: Number(form.employee_id),
            hire_date: form.hire_date,
            termination_date: form.termination_date || null,
            status: form.status,
            position_type: form.position_type,
            base_salary: Number(form.base_salary),
            currency: form.currency,
            employee_type: form.employee_type,
        };

        let success: boolean;

        if (contract) {
            const id = contract.id ?? contract.contract_id;

            if (id === undefined || id === null) {
                setError("Contract ID is missing.");
                return;
            }

            success = await update(id, payload);
        } else {
            success = await create(payload);
        }

        if (!success) {
            setError(
                contract
                    ? updateError ?? "Could not update the contract."
                    : createError ?? "Could not create the contract.",
            );
            return;
        }

        onSuccess();
        onClose();
    }

    const inputClass =
        "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-700";

    const labelClass =
        "mb-1 block text-sm text-gray-600";

    function employeeIdOf(employee: Employee) {
        return (
            employee.registration_id ??
            employee.employee_id ??
            employee.id
        );
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="contract-modal-title"
                className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-6 flex items-center justify-between">
                    <h2
                        id="contract-modal-title"
                        className="text-lg font-bold text-blue-firstRate"
                    >
                        {contract
                            ? "Update Employee Contract"
                            : "Create New Contract"}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-2xl text-gray-500 hover:text-gray-800"
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <p
                        role="alert"
                        className="mb-4 text-sm text-red-600"
                    >
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="employee_id"
                                className={labelClass}
                            >
                                Employee
                            </label>

                            <select
                                id="employee_id"
                                name="employee_id"
                                value={form.employee_id}
                                onChange={handleChange}
                                className={inputClass}
                                required
                                disabled={
                                    loadingEmployees || employees.length === 0
                                }
                            >
                                <option value="">
                                    {loadingEmployees
                                        ? "Loading employees..."
                                        : employees.length
                                            ? "Select employee"
                                            : "No active employees available"}
                                </option>

                                {employees.map((employee, index) => {
                                    const id = employeeIdOf(employee);

                                    if (id === undefined) return null;

                                    return (
                                        <option
                                            key={`${id}-${index}`}
                                            value={id}
                                        >
                                            {employee.first_name}{" "}
                                            {employee.last_name}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="hire_date"
                                className={labelClass}
                            >
                                Hire Date
                            </label>

                            <input
                                id="hire_date"
                                name="hire_date"
                                type="date"
                                value={form.hire_date}
                                onChange={handleChange}
                                className={inputClass}
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="termination_date"
                                className={labelClass}
                            >
                                Termination Date
                            </label>

                            <input
                                id="termination_date"
                                name="termination_date"
                                type="date"
                                value={form.termination_date}
                                onChange={handleChange}
                                min={form.hire_date || undefined}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="status" className={labelClass}>
                                Status
                            </label>

                            <select
                                id="status"
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Terminated">Terminated</option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="position_type"
                                className={labelClass}
                            >
                                Position Type
                            </label>

                            <select
                                id="position_type"
                                name="position_type"
                                value={form.position_type}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="Permanent">Permanent</option>
                                <option value="External">External</option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="base_salary"
                                className={labelClass}
                            >
                                Base Salary
                            </label>

                            <input
                                id="base_salary"
                                name="base_salary"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.base_salary}
                                onChange={handleChange}
                                className={inputClass}
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="currency"
                                className={labelClass}
                            >
                                Currency
                            </label>

                            <select
                                id="currency"
                                name="currency"
                                value={form.currency}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="USD">USD</option>
                                <option value="AFN">AFN</option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="employee_type"
                                className={labelClass}
                            >
                                Employee Type
                            </label>

                            <select
                                id="employee_type"
                                name="employee_type"
                                value={form.employee_type}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-300"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                saving ||
                                loadingEmployees ||
                                employees.length === 0
                            }
                            className="rounded-lg bg-blue-firstRate px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
                        >
                            {saving
                                ? "Saving..."
                                : contract
                                    ? "Save Changes"
                                    : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
