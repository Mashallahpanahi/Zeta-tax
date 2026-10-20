
import { useEffect, useState } from "react";
import { getAllOtherExpenses, type OtherExpense, } from "../../api/otherExpenseApi";
import CreateOtherExpenseModal from "../../components/expenses/CreateOtherExpenseModal";
import UpdateOtherExpenseModal from "../../components/expenses/UpdateOtherExpenseModal";
import { getAllExpenseCategories } from "../../api/expenseCategoryApi";
import { formatNumber } from "../../utils/formatNumber";
export default function OtherExpensesPage() {
    const {
        data: expenseData,
        loading,
        error,
        refetch,
    } = getAllOtherExpenses();

    const { data: categoryData } = getAllExpenseCategories();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editExpense, setEditExpense] = useState<OtherExpense | null>(null);
    const [message, setMessage] = useState("");

    const expenses = expenseData ?? [];
    const categories = categoryData ?? [];

    useEffect(() => {
        if (!message) return;

        const timer = window.setTimeout(() => setMessage(""), 5000);
        return () => window.clearTimeout(timer);
    }, [message]);

    function handleSuccess() {
        setMessage(
            editExpense
                ? "Expense updated successfully."
                : "Expense created successfully.",
        );
        refetch();
    }

    function getCategoryName(expense: OtherExpense) {
        const category = categories.find(
            (item) =>
                Number(item.category_id) === Number(expense.category_id),
        );

        return expense.category_title ?? category?.category_title ?? "—";
    }

    if (loading) {
        return <p className="p-6">Loading other expenses...</p>;
    }

    if (error && expenses.length === 0) {
        return (
            <div className="space-y-4 p-6">
                <p role="alert" className="text-red-500">
                    Error: {error}
                </p>
                <button
                    type="button"
                    onClick={refetch}
                    className="rounded-lg bg-blue-firstRate px-4 py-2 text-white"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold">Other Expenses</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage and track your other business expenses in one place.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setEditExpense(null);
                        setIsCreateOpen(true);
                    }}
                    className="rounded-lg bg-blue-firstRate px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-blue-firstRate/90"
                >
                    + Add New Expense
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
                <table className="w-full min-w-[750px] border-collapse">
                    <thead className="bg-gray-50">
                        <tr>
                            {[
                                "ID",
                                "Description",
                                "Amount",
                                "Currency",
                                "Category",
                                "Expense Date",
                                "Note",
                                "Actions",
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
                        {expenses.map((expense, index) => {
                            const id = expense.id ?? expense.expense_id;

                            return (
                                <tr
                                    key={id ?? index}
                                    className="border-b border-gray-100 transition hover:bg-blue-50"
                                >
                                    <td className="whitespace-nowrap p-3 text-sm">
                                        {id ?? "—"}
                                    </td>
                                    <td className="p-3 text-sm">{expense.description || "—"}</td>
                                    <td className="whitespace-nowrap p-3 text-sm">
                                        {formatNumber(Number(expense.amount))}
                                    </td>
                                    <td className="whitespace-nowrap p-3 text-sm">
                                        {expense.currency || "—"}
                                    </td>
                                    <td className="p-3 text-sm">{getCategoryName(expense)}</td>
                                    <td className="whitespace-nowrap p-3 text-sm">
                                        {expense.expense_date?.slice(0, 10) || "—"}
                                    </td>
                                    <td className="max-w-[220px] p-3 text-sm">
                                        {expense.note || "—"}
                                    </td>
                                    <td className="whitespace-nowrap p-3">
                                        <button
                                            type="button"
                                            onClick={() => setEditExpense(expense)}
                                            className="rounded-lg bg-yellow-500 px-3 py-1.5 text-sm text-white transition hover:bg-yellow-600"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}

                        {expenses.length === 0 && (
                            <tr>
                                <td colSpan={8} className="p-6 text-center text-gray-500">
                                    No other expenses found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <p className="text-sm text-gray-500">
                Total expenses: {expenses.length}
            </p>

            <CreateOtherExpenseModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={handleSuccess}
            />

            <UpdateOtherExpenseModal
                expense={editExpense}
                onClose={() => setEditExpense(null)}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
