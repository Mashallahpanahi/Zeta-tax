
import { useEffect, useState } from "react";
import {
    createExpenseCategory,
    type CreateExpenseCategoryType,
} from "../../api/expenseCategoryApi";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const emptyForm: CreateExpenseCategoryType = {
    category_title: "",
    description: "",
};

export default function CreateExpenseCategoryModal({
    isOpen,
    onClose,
    onSuccess,
}: Props) {
    const { create, loading, error } = createExpenseCategory();
    const [form, setForm] =
        useState<CreateExpenseCategoryType>(emptyForm);

    useEffect(() => {
        if (isOpen) setForm({ ...emptyForm });
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const payload = {
            category_title: form.category_title.trim(),
            description: form.description.trim(),
        };

        if (!payload.category_title) return;

        const success = await create(payload);

        if (success) {
            onSuccess();
            onClose();
        }
    };

    const inputClass =
        "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm " +
        "focus:border-blue-firstRate focus:outline-none " +
        "focus:ring-2 focus:ring-blue-firstRate/30";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-category-title"
                className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl"
            >
                <div className="mb-5 flex items-center justify-between">
                    <h2
                        id="create-category-title"
                        className="text-lg font-bold text-blue-firstRate"
                    >
                        Add Expense Category
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close modal"
                        className="text-xl text-gray-500 hover:text-gray-800 disabled:opacity-50"
                    >
                        &times;
                    </button>
                </div>

                {error && (
                    <p role="alert" className="mb-4 text-sm text-red-600">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="create-category-name"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Category Title *
                        </label>
                        <input
                            id="create-category-name"
                            name="category_title"
                            value={form.category_title}
                            onChange={(e) =>
                                setForm((current) => ({
                                    ...current,
                                    category_title: e.target.value,
                                }))
                            }
                            placeholder="e.g. Office Rent"
                            className={inputClass}
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="create-category-description"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Description
                        </label>
                        <textarea
                            id="create-category-description"
                            value={form.description}
                            onChange={(e) =>
                                setForm((current) => ({
                                    ...current,
                                    description: e.target.value,
                                }))
                            }
                            placeholder="Describe this category"
                            className={inputClass}
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading || !form.category_title.trim()}
                            className="rounded-lg bg-blue-firstRate px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create Category"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
