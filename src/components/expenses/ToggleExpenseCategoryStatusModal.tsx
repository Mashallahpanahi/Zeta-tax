
import {
    updateExpenseCategory,
    type ExpenseCategoryType,
} from "../../api/expenseCategoryApi";

interface Props {
    category: ExpenseCategoryType | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ToggleExpenseCategoryStatusModal({
    category,
    onClose,
    onSuccess,
}: Props) {
    const {
        update,
        loading,
        error,
    } = updateExpenseCategory();

    if (!category) return null;

    const isActive = category.status?.toLowerCase() === "active";
    const nextStatus = isActive ? "inactive" : "active";
    const action = isActive ? "Deactivate" : "Activate";

    const handleStatusChange = async () => {
        const success = await update(category.category_id, {
            status: nextStatus,
        });

        if (success) {
            onSuccess();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="category-status-title"
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            >
                <h2
                    id="category-status-title"
                    className="text-lg font-bold text-gray-900"
                >
                    {action} Expense Category
                </h2>

                <p className="mt-3 text-sm text-gray-600">
                    Are you sure you want to {action.toLowerCase()}{" "}
                    <strong>{category.category_title}</strong>?
                </p>

                {error && (
                    <p role="alert" className="mt-3 text-sm text-red-600">
                        {error}
                    </p>
                )}

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleStatusChange}
                        disabled={loading}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${isActive
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                    >
                        {loading ? "Updating..." : action}
                    </button>
                </div>
            </div>
        </div>
    );
}
