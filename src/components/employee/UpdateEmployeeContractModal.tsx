
import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import {
    updateContract,
    type EmployeeContract,
    type CreateEmployeeContractType,
} from "../../api/employeeContractApi";
import { formatNumber } from "../../utils/formatNumber";
interface Props {
    isOpen: boolean;
    contract: EmployeeContract | null;
    employeeName: string;
    onClose: () => void;
    onSuccess: () => void;
}

const initialForm = {
    hire_date: "",
    termination_date: "",
    status: "Active",
    position_type: "Permanent",
    base_salary: "",
    currency: "USD",
    employee_type: "Full-time",
};

export default function UpdateEmployeeContractModal({
    isOpen,
    contract,
    employeeName,
    onClose,
    onSuccess,
}: Props) {
    const [form, setForm] = useState(initialForm);
    const [formError, setFormError] = useState("");

    const {
        update,
        loading: updating,
        error: updateError,
    } = updateContract();

    useEffect(() => {
        if (!isOpen || !contract) return;

        setFormError("");
        setForm({
            hire_date: contract.hire_date?.slice(0, 10) ?? "",
            termination_date: contract.termination_date?.slice(0, 10) ?? "",
            status: contract.status ?? "Active",
            position_type: contract.position_type ?? "Permanent",
            base_salary: contract.base_salary != null
                ? formatNumber(Number(contract.base_salary))
                : "",
            currency: contract.currency ?? "USD",
            employee_type: contract.employee_type ?? "Full-time",
        });
    }, [isOpen, contract]);

    function handleChange(
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) {
        const { name, value } = event.target;

        if (name === "base_salary") {
            const cleanValue = value.replace(/,/g, "").replace(/[^\d.]/g, "");
            const [integerPart, ...decimalParts] = cleanValue.split(".");
            const decimalPart = decimalParts.join("");

            const formattedInteger = integerPart
                ? formatNumber(Number(integerPart))
                : "";

            const formattedValue = cleanValue.includes(".")
                ? `${formattedInteger}.${decimalPart}`
                : formattedInteger;

            setForm((previous) => ({
                ...previous,
                [name]: formattedValue,
            }));

            return;
        }

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError("");

        if (!contract) {
            setFormError("Contract information is missing.");
            return;
        }

        const id = contract.id ?? contract.contract_id;

        if (id === undefined || id === null) {
            setFormError("Contract ID is missing.");
            return;
        }

        if (!form.hire_date || !form.base_salary.trim()) {
            setFormError("Please complete all required fields.");
            return;
        }

        const salary = Number(form.base_salary.replace(/,/g, ""));

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
            employee_id: Number(contract.employee_id),
            hire_date: form.hire_date,
            termination_date: form.termination_date || null,
            status: form.status,
            position_type: form.position_type,
            base_salary: salary,
            currency: form.currency,
            employee_type: form.employee_type,
        };

        const success = await update(id, payload);

        if (success) {
            onSuccess();
            onClose();
        } else {
            setFormError(updateError || "Could not update the contract.");
        }
    }

    if (!isOpen || !contract) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="update-contract-title"
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-6 flex items-center justify-between gap-4">
                    <h2
                        id="update-contract-title"
                        className="text-xl font-bold text-blue-firstRate"
                    >
                        Edit Employee Contract
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

                {(formError || updateError) && (
                    <p role="alert" className="mb-4 text-sm text-red-500">
                        {formError || updateError}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label
                                htmlFor="update_employee"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Employee
                            </label>

                            <div
                                id="update_employee"
                                className="w-full rounded-lg border border-gray-300 bg-gray-100 p-3 text-sm text-gray-700"
                            >
                                {employeeName || "Employee not found"} (ID:{" "}
                                {contract.employee_id})
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="update_hire_date"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Hire Date *
                            </label>

                            <input
                                id="update_hire_date"
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
                                htmlFor="update_termination_date"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Termination Date
                            </label>

                            <input
                                id="update_termination_date"
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
                                htmlFor="update_status"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Status
                            </label>

                            <select
                                id="update_status"
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
                                htmlFor="update_position_type"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Position Type
                            </label>

                            <select
                                id="update_position_type"
                                name="position_type"
                                value={form.position_type}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-firstRate"
                            >
                                <option value="Permanent">Permanent</option>
                                <option value="Intern">Intern</option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="update_base_salary"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Base Salary *
                            </label>

                            <input
                                id="update_base_salary"
                                name="base_salary"
                                type="text"
                                inputMode="decimal"
                                value={form.base_salary}
                                onChange={handleChange}
                                required
                                placeholder="Enter salary"
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-firstRate"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="update_currency"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Currency
                            </label>

                            <select
                                id="update_currency"
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
                                htmlFor="update_employee_type"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Employee Type
                            </label>

                            <select
                                id="update_employee_type"
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

                    <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={updating}
                            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={updating}
                            className="rounded-lg bg-blue-firstRate px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {updating ? "Saving..." : "Update Contract"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
