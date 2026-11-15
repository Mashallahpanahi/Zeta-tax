import { useEffect, useMemo, useState } from "react";
import Loader from "../../components/common/Loader";
import {
  createOfficeRent,
  getAllOfficeRents,
  type OfficeRent,
  type OfficeRentPayload,
} from "../../api/officeRentApi";
import { loadTaxRates, calculateRentTax } from "../../utils/calculateTax";
import { FaPlus, FaSyncAlt } from "react-icons/fa";
import OfficeRentEditModal from "../../components/expenses/OfficeRentEditModal";

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;
const pad = (n: number) => String(n).padStart(2, "0");
const firstDayOfMonth = `${currentYear}-${pad(currentMonth)}-01`;
const lastDayOfMonth = `${currentYear}-${pad(currentMonth)}-${pad(
  new Date(currentYear, currentMonth, 0).getDate(),
)}`;

const formatNumber = (value: number | string | null | undefined) =>
  Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const parseTax = (value: string) => Number(value.replace(/,/g, "")) || 0;

const initialForm = {
  amount: "",
  date: today(),
  paid: true,
};

const OfficeRentPage = () => {
  const [form, setForm] = useState(initialForm);
  const [selectedRent, setSelectedRent] = useState<OfficeRent | null>(null);
  const [taxReady, setTaxReady] = useState(false);
  const [taxError, setTaxError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState(
    String(new Date().getFullYear()),
  );
  const rentsQuery = getAllOfficeRents();
  const createMutation = createOfficeRent();

  // Load tax rates using the existing utility function.
  useEffect(() => {
    let active = true;
    const fetchTaxRates = async () => {
      try {
        await loadTaxRates();
        if (active) {
          setTaxReady(true);
          setTaxError("");
        }
      } catch {
        if (active) {
          setTaxReady(false);
          setTaxError("Unable to load tax rates. Please try again.");
        }
      }
    };

    fetchTaxRates();

    return () => {
      active = false;
    };
  }, []);

  const amount = Number(form.amount) || 0;
  const rentTaxResult = calculateRentTax(amount);
  const taxAmount = taxReady && amount > 0 ? parseTax(rentTaxResult.tax) : 0;
  const finalPayment = amount - taxAmount;
  const rents = rentsQuery.data ?? [];
  const filteredRents = useMemo(() => {
    return rents
      .filter((rent) => {
        const rentDate = new Date(`${rent.date}T00:00:00`);
        const matchesYear = rentDate.getFullYear() === Number(selectedYear);
        const matchesMonth =
          selectedMonth === "all" ||
          rentDate.getMonth() + 1 === Number(selectedMonth);

        return matchesYear && matchesMonth;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [rents, selectedMonth, selectedYear]);

  const resetForm = () => {
    setForm({
      ...initialForm,
      date: today(),
    });
    setFormError("");
    setTaxError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (!form.amount || amount <= 0) {
      setFormError("Please enter a rent amount greater than zero.");
      return;
    }

    if (!form.date) {
      setFormError("Please select the rent date.");
      return;
    }

    // --- ADD THIS VALIDATION ---
    if (form.date < firstDayOfMonth || form.date > lastDayOfMonth) {
      setFormError("Rent date must be within the current month.");
      return;
    }
    // ---------------------------

    if (!taxReady) {
      setFormError("Tax rates are not ready. Please wait or reload the page.");
      return;
    }

    // ... rest of your code ...

    // Reload the latest rates through the existing utility.
    try {
      await loadTaxRates();
    } catch {
      setFormError("Unable to load the latest tax rates. Please try again.");
      return;
    }

    const latestTaxResult = calculateRentTax(amount);
    const latestTaxAmount = parseTax(latestTaxResult.tax);
    const payload: OfficeRentPayload = {
      amount_af: amount,
      date: form.date,
      tax_amount_af: latestTaxAmount,
      final_pay_af: amount - latestTaxAmount,
      paid: form.paid,
    };

    try {
      const success = await createMutation.create(payload);
      if (success) {
        setSuccessMessage("Office rent created successfully.");
        resetForm();
        await rentsQuery.refetch();
      } else {
        setFormError(
          createMutation.message ||
            "Unable to create office rent, you can choose only current month and year",
        );
      }
    } catch {
      setFormError("Something went wrong. Please try again.");
    }
  };

  const isCurrentMonth = (date: string) => {
    const rentDate = new Date(`${date}T00:00:00`);
    const currentDate = new Date();
    return (
      rentDate.getMonth() === currentDate.getMonth() &&
      rentDate.getFullYear() === currentDate.getFullYear()
    );
  };

  const isSaving = createMutation.loading;
  const years = Array.from(
    { length: 7 },
    (_, index) => new Date().getFullYear() - 5 + index,
  );
  return (
    <div className="min-h-full min-w-0 space-y-6 bg-slate-50/70 p-3 sm:p-5 lg:p-6">
      {/* Add Rent Form */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">Add Office Rent</h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter the rent amount and payment details (current month and year).
          </p>
        </div>

        {taxError && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {taxError}
          </div>
        )}

        {formError && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {formError}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
          >
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="rent-amount"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Rent Amount (AFN)
              </label>

              <input
                id="rent-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    amount: event.target.value,
                  }))
                }
                placeholder="Enter rent amount"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="rent-date"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Rent Date
              </label>

              <input
                id="rent-date"
                type="date"
                value={form.date}
                min={firstDayOfMonth}
                max={lastDayOfMonth}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    date: event.target.value,
                  }))
                }
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Tax calculation preview */}
          <div className="grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-slate-500">Rent Amount</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                AFN {formatNumber(amount)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">Tax Amount</p>
              <p className="mt-1 text-lg font-bold text-amber-600">
                AFN {formatNumber(taxAmount)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Final Payment
              </p>
              <p className="mt-1 text-lg font-bold text-emerald-700">
                AFN {formatNumber(finalPayment)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.paid}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    paid: event.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Rent has been paid
            </label>

            <button
              type="submit"
              disabled={isSaving || !taxReady}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-firstRate px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaPlus />
              {isSaving ? "Saving..." : "Save Rent"}
            </button>
          </div>

          {!taxReady && (
            <Loader className="text-xs text-slate-500">
              Loading tax rates...
            </Loader>
          )}
        </form>
      </section>

      {/* Rent History */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Office Rent History
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              View and update previously recorded rent payments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => rentsQuery.refetch()}
            disabled={rentsQuery.loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <FaSyncAlt className={rentsQuery.loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <select
            aria-label="Filter rent by month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="all">All months</option>
            {[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].map((monthName, index) => (
              <option key={monthName} value={index + 1}>
                {monthName}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter rent by year"
            value={selectedYear}
            onChange={(event) => setSelectedYear(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {rentsQuery.loading && (
          <Loader message="Loading office rent history..." />
        )}

        {rentsQuery.error && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {String(rentsQuery.error)}
          </div>
        )}

        {!rentsQuery.loading && !rentsQuery.error && (
          <>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Rent (AFN)</th>
                    <th className="px-4 py-3 font-semibold">Tax (AFN)</th>
                    <th className="px-4 py-3 font-semibold">
                      Final Payment (AFN)
                    </th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredRents.map((rent) => {
                    const canEdit = isCurrentMonth(rent.date);

                    return (
                      <tr
                        key={rent.rent_id}
                        className="text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-4 py-4">
                          {rent.date}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 font-medium">
                          {formatNumber(rent.amount_af)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          {formatNumber(rent.tax_amount_af)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-900">
                          {formatNumber(rent.final_pay_af)}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              rent.paid
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {rent.paid ? "Paid" : "Unpaid"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedRent(rent)}
                            disabled={!canEdit}
                            title={
                              canEdit
                                ? "Edit office rent"
                                : "Only current-month records can be edited"
                            }
                            className="rounded-lg bg-yellow-500 px-3 py-1.5 text-sm text-white transition hover:bg-yellow-600/70 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredRents.length === 0 && (
                <div className="py-10 text-center text-sm text-slate-500">
                  No office rent records found for this period.
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
              Showing {filteredRents.length} rent record(s).
            </div>
          </>
        )}
      </section>

      {/* Edit Office Rent Modal */}
      <OfficeRentEditModal
        rent={selectedRent}
        isOpen={!!selectedRent}
        onClose={() => setSelectedRent(null)}
        onUpdated={async () => {
          setSelectedRent(null);
          await rentsQuery.refetch();
        }}
      />
    </div>
  );
};

export default OfficeRentPage;
