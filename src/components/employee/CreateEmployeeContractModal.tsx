
import { useState, type FormEvent, type ChangeEvent } from "react";
import {
    createContract,
    getActiveEmployees,
    type Employee,
    type CreateEmployeeContractType,
} from "../../api/employeeContractApi";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const initialForm = {
    employee_id: "",
    hire_date: "",
    termination_date: "",
    status: "Active",
    position_type: "Permanent",
    base_salary: "",
    currency: "USD",
    employee_type: "Full-time",
};

export default function CreateEmployeeContractModal({
    isOpen,
    onClose,
    onSuccess,
}: Props) {
    const [form, setForm] = useState(initialForm);
    const [formError, setFormError] = useState("");

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

    const employees: Employee[] = employeeData ?? [];

    function handleChange(
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError("");

        if (
            !form.employee_id ||
            !form.hire_date ||
            !form.base_salary.trim()
        ) {
            setFormError("Please complete all required fields.");
            return;
        }

        const salary = Number(form.base_salary);

        if (!Number.isFinite(salary) || salary < 0) {
            setFormError("Please enter a valid, non-negative salary.");
            return;
        }

        if (
            form.termination_date &&
            form.termination_date < form.hire_date
        ) {
            setFormError(
                "Termination date cannot be earlier than the hire date."
            );
            return;
        }

        const payload: CreateEmployeeContractType = {
            employee_id: Number(form.employee_id),
            hire_date: form.hire_date,
            termination_date: form.termination_date || null,
            status: form.status,
            position_type: form.position_type,
            base_salary: salary,
            currency: form.currency,
            employee_type: form.employee_type,
        };

        const success = await create(payload);

        if (success) {
            setForm(initialForm);
            onSuccess();
            onClose();
        } else {
            setFormError(createError || "Could not create the contract.");
        }
    }

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-contract-title"
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-6 flex items-center justify-between gap-4">
                    <h2
                        id="create-contract-title"
                        className="text-xl font-bold text-blue-firstRate"
                    >
                        Create New Contract
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                        className="rounded-lg px-3 py-1 text-2xl text-gray-500 hover:bg-gray-100"
                    >
                        ×
                    </button>
                </div>

                {(formError || employeeError) && (
                    <p role="alert" className="mb-4 text-sm text-red-500">
                        {formError || employeeError}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label
                                htmlFor="create_employee_id"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Employee *
                            </label>

                            <select
                                id="create_employee_id"
                                name="employee_id"
                                value={form.employee_id}
                                onChange={handleChange}
                                required
                                disabled={loadingEmployees}
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-firstRate disabled:bg-gray-100"
                            >
                                <option value="">
                                    {loadingEmployees
                                        ? "Loading employees..."
                                        : "Select an employee"}
                                </option>

                                {employees.map((employee) => {
                                    const employeeId =
                                        employee.registration_id ??
                                        employee.employee_id ??
                                        employee.id;

                                    if (employeeId === undefined || employeeId === null) {
                                        return null;
                                    }

                                    return (
                                        <option key={employeeId} value={employeeId}>
                                            {employee.first_name ?? ""}{" "}
                                            {employee.last_name ?? ""} (ID: {employeeId})
                                        </option>
                                    );
                                })}
                            </select>

                            {!loadingEmployees && employees.length === 0 && (
                                <p className="mt-1 text-xs text-gray-500">
                                    No active employees found.
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="create_hire_date"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Hire Date *
                            </label>

                            <input
                                id="create_hire_date"
                                name="hire_date"
                                type="date"
                                value={form.hire_date}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-firstRate"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="create_termination_date"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Termination Date
                            </label>

                            <input
                                id="create_termination_date"
                                name="termination_date"
                                type="date"
                                value={form.termination_date}
                                min={form.hire_date || undefined}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-firstRate"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="create_status"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Status
                            </label>

                            <select
                                id="create_status"
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-firstRate"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Terminated">Terminated</option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="create_position_type"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Position Type
                            </label>

                            <select
                                id="create_position_type"
                                name="position_type"
                                value={form.position_type}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-firstRate"
                            >
                                <option value="Permanent">Permanent</option>
                                <option value="External">External</option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="create_base_salary"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Base Salary *
                            </label>

                            <input
                                id="create_base_salary"
                                name="base_salary"
                                type="number"
                                min="0"
                                step="any"
                                value={form.base_salary}
                                onChange={handleChange}
                                required
                                placeholder="Enter salary"
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-firstRate"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="create_currency"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Currency
                            </label>

                            <select
                                id="create_currency"
                                name="currency"
                                value={form.currency}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-firstRate"
                            >
                                <option value="USD">USD</option>
                                <option value="AFN">AFN</option>
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label
                                htmlFor="create_employee_type"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Employee Type
                            </label>

                            <select
                                id="create_employee_type"
                                name="employee_type"
                                value={form.employee_type}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-firstRate"
                            >
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                            </select>
                        </div>
                    </div>

                    {createError && (
                        <p role="alert" className="text-sm text-red-500">
                            {createError}
                        </p>
                    )}

                    <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={creating}
                            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={creating || loadingEmployees}
                            className="rounded-lg bg-blue-firstRate px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {creating ? "Saving..." : "Create Contract"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
