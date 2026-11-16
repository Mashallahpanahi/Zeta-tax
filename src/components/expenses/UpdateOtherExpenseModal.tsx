
import { useEffect, useState } from "react";
import {
    updateOtherExpense,
    type OtherExpense,
    type UpdateOtherExpenseType,
} from "../../api/otherExpenseApi";
import { getAllExpenseCategories } from "../../api/expenseCategoryApi";
import { formatNumber } from "../../utils/formatNumber";

interface Props {
    expense: OtherExpense | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UpdateOtherExpenseModal({
    expense,
    onClose,
    onSuccess,
}: Props) {
    const { update, loading, error } = updateOtherExpense();
    const { data: categories, loading: loadingCategories } =
        getAllExpenseCategories();

    const [form, setForm] = useState<UpdateOtherExpenseType>({});
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (!expense) return;

        setForm({
            description: expense.description ?? "",
            amount: Number(expense.amount) || 0,
            category_id: Number(expense.category_id) || 0,
            currency: expense.currency ?? "AFN",
            expense_date: expense.expense_date?.slice(0, 10) ?? "",
            note: expense.note ?? "",
        });
        setFormError("");
    }, [expense]);

    if (!expense) return null;

    const expenseId = expense.id ?? expense.expense_id;

    function handleChange(
        field: keyof UpdateOtherExpenseType,
        value: string,
    ) {
        setForm((current) => ({
            ...current,
            [field]:
                field === "amount" || field === "category_id"
                    ? Number(value)
                    : value,
        }));
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError("");

        if (expenseId === undefined || expenseId === null) {
            setFormError("Expense ID is missing.");
            return;
        }

        if (!form.description?.trim()) {
            setFormError("Description is required.");
            return;
        }

        if (!Number.isFinite(form.amount) || Number(form.amount) <= 0) {
            setFormError("Amount must be greater than zero.");
            return;
        }

        if (!form.category_id) {
            setFormError("Please select a category.");
            return;
        }

        const payload: UpdateOtherExpenseType = {
            ...form,
            description: form.description.trim(),
            amount: Number(form.amount),
            category_id: Number(form.category_id),
            note: form.note?.trim() || "",
        };

        const success = await update(expenseId, payload);

        if (success) {
            onSuccess();
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-expense-title"
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            >
                <h2 id="edit-expense-title" className="text-lg font-bold text-gray-900">
                    Edit Expense
                </h2>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <input
                            required
                            value={form.description ?? ""}
                            onChange={(event) =>
                                handleChange("description", event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Amount
                            </label>
                            <input
                                required
                                type="text"
                                inputMode="decimal"
                                value={
                                    form.amount
                                        ? formatNumber(Number(form.amount))
                                        : ""
                                }
                                onChange={(event) => {
                                    const value = event.target.value.replace(/,/g, "");

                                    handleChange("amount", value);
                                }}
                                placeholder="Enter amount"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Currency
                            </label>
                            <div>

                                <input
                                    type="text"
                                    value="AFN"
                                    readOnly
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-700"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Category
                        </label>
                        <select
                            required
                            value={form.category_id || ""}
                            onChange={(event) =>
                                handleChange("category_id", event.target.value)
                            }
                            disabled={loadingCategories}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        >
                            <option value="">Select category</option>
                            {(categories ?? [])
                                .filter(
                                    (category) =>
                                        category.status === "active" ||
                                        Number(category.category_id) === Number(form.category_id),
                                )
                                .map((category) => (
                                    <option
                                        key={category.category_id}
                                        value={category.category_id}
                                    >
                                        {category.category_title}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Expense Date
                        </label>
                        <input
                            required
                            type="date"
                            value={form.expense_date ?? ""}
                            onChange={(event) =>
                                handleChange("expense_date", event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Note
                        </label>
                        <textarea
                            rows={3}
                            value={form.note ?? ""}
                            onChange={(event) => handleChange("note", event.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        />
                    </div>

                    {(formError || error) && (
                        <p role="alert" className="text-sm text-red-600">
                            {formError || error}
                        </p>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || loadingCategories}
                            className="rounded-lg bg-blue-firstRate px-4 py-2 text-sm font-semibold text-white hover:bg-blue-firstRate/90 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Update Expense"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
