
import { useEffect, useState } from "react";
import { createOtherExpense, type CreateOtherExpenseType, } from "../../api/otherExpenseApi";
import { getAllExpenseCategories } from "../../api/expenseCategoryApi";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const initialForm: CreateOtherExpenseType = {
    description: "",
    amount: 0,
    category_id: 0,
    currency: "AFN",
    expense_date: new Date().toISOString().slice(0, 10),
    note: "",
};

export default function CreateOtherExpenseModal({
    isOpen,
    onClose,
    onSuccess,
}: Props) {
    const { create, loading, error } = createOtherExpense();
    const {
        data: categories,
        loading: loadingCategories,
        error: categoryError,
    } = getAllExpenseCategories();

    const [form, setForm] = useState<CreateOtherExpenseType>(initialForm);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setForm(initialForm);
            setFormError("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    function handleChange(
        field: keyof CreateOtherExpenseType,
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

        if (!form.description.trim()) {
            setFormError("Description is required.");
            return;
        }

        if (!Number.isFinite(form.amount) || form.amount <= 0) {
            setFormError("Amount must be greater than zero.");
            return;
        }

        if (!form.category_id) {
            setFormError("Please select a category.");
            return;
        }

        const success = await create({
            ...form,
            description: form.description.trim(),
            note: form.note?.trim() || "",
        });

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
                aria-labelledby="create-expense-title"
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            >
                <h2 id="create-expense-title" className="text-lg font-bold text-gray-900">
                    Add New Expense
                </h2>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <input
                            required
                            value={form.description}
                            onChange={(event) =>
                                handleChange("description", event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-firstRate"
                            placeholder="e.g. Bought office supplies"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Amount
                            </label>
                            <input
                                required
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={form.amount || ""}
                                onChange={(event) => handleChange("amount", event.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-firstRate"
                            />
                        </div>

                        <div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Currency
                                </label>

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
                            <option value="">
                                {loadingCategories ? "Loading categories..." : "Select category"}
                            </option>
                            {(categories ?? [])
                                .filter((category) => category.status === "active")
                                .map((category) => (
                                    <option
                                        key={category.category_id}
                                        value={category.category_id}
                                    >
                                        {category.category_title}
                                    </option>
                                ))}
                        </select>
                        {categoryError && (
                            <p role="alert" className="mt-1 text-sm text-red-600">
                                Could not load expense categories.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Expense Date
                        </label>
                        <input
                            required
                            type="date"
                            value={form.expense_date}
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
                            placeholder="Optional note"
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
                            {loading ? "Saving..." : "Save Expense"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
