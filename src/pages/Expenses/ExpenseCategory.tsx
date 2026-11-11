import { useState } from "react";
import {
  getAllExpenseCategories,
  type ExpenseCategoryType,
} from "../../api/expenseCategoryApi";
import CreateExpenseCategoryModal from "../../components/expenses/CreateExpenseCategoryModal";
import UpdateExpenseCategoryModal from "../../components/expenses/UpdateExpenseCategoryModal";
import ToggleExpenseCategoryStatusModal from "../../components/expenses/ToggleExpenseCategoryStatusModal";
import ResponsivePage from "../../components/common/ResponsivePage";
import Loader from "../../components/common/Loader";

export default function ExpenseCategory() {
  const {
    data: categories,
    loading,
    error,
    refetch,
  } = getAllExpenseCategories();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editCategory, setEditCategory] =
    useState<ExpenseCategoryType | null>(null);
  const [statusCategory, setStatusCategory] =
    useState<ExpenseCategoryType | null>(null);

  if (loading) {
    return <Loader message="Loading expense categories..." fullPage />;
  }

  if (error) {
    return (
      <ResponsivePage>
        <div className="space-y-4">
          <p role="alert" className="text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={refetch}
            className="rounded-lg bg-blue-firstRate px-4 py-2 text-white transition hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      </ResponsivePage>
    );
  }

  const categoryList = categories ?? [];

  return (
    <ResponsivePage>
      {/* Header */}
      <div className="flex flex-col gap-4 min-[640px]:flex-row min-[640px]:items-center min-[640px]:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-black 2xl:text-2xl">
            Expense Categories
          </h1>

          <p className="mt-1 text-sm text-gray-500 2xl:text-base">
            Create and manage categories for recording expenses.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="w-full shrink-0 rounded-lg bg-blue-firstRate px-4 py-2 font-semibold text-white shadow-sm transition hover:opacity-90 min-[640px]:w-auto"
        >
          + Add Category
        </button>
      </div>

      {/* Categories Table */}
      <div className="w-full min-w-0 max-w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[650px] border-collapse text-left text-sm 2xl:text-base">
          <thead className="bg-gray-100">
            <tr>
              {["ID", "Category Title", "Description", "Actions"].map(
                (heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap border-b border-gray-200 px-4 py-3 font-semibold text-gray-700 2xl:px-5 2xl:py-4"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody>
            {categoryList.map((category) => (
              <tr
                key={category.category_id}
                className="border-b border-gray-100 align-top transition hover:bg-gray-50"
              >
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 2xl:px-5 2xl:py-4">
                  {category.category_id}
                </td>

                <td className="max-w-[220px] break-words px-4 py-3 font-medium text-gray-800 2xl:px-5 2xl:py-4">
                  {category.category_title}
                </td>

                <td className="max-w-[350px] break-words px-4 py-3 text-gray-600 2xl:px-5 2xl:py-4">
                  {category.description || "—"}
                </td>

                <td className="px-4 py-3 2xl:px-5 2xl:py-4">
                  <div className="flex w-max flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEditCategory(category)}
                      className="rounded-lg bg-yellow-500 px-3 py-1.5 text-sm text-white transition hover:bg-yellow-600/70"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatusCategory(category)}
                      className={`w-[96px] shrink-0 rounded-lg px-3 py-1.5 text-center text-sm font-semibold text-white ${category.status === "active"
                        ? "bg-red-500 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                        }`}
                    >
                      {category.status === "active"
                        ? "Deactivate"
                        : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {categoryList.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No expense categories found. Add your first category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500 2xl:text-base">
        Total categories: {categoryList.length}
      </p>

      {/* Modals */}
      <CreateExpenseCategoryModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={refetch}
      />

      <UpdateExpenseCategoryModal
        category={editCategory}
        onClose={() => setEditCategory(null)}
        onSuccess={refetch}
      />

      <ToggleExpenseCategoryStatusModal
        category={statusCategory}
        onClose={() => setStatusCategory(null)}
        onSuccess={refetch}
      />
    </ResponsivePage>
  );
}
