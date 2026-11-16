export type IncomeForm = {
  date: string;
  amount: string;
  currency: string;
  recorded_by: string;
  received_from: string;
  income_type: string;
  description: string;
};
import { formatNumber } from "../../utils/formatNumber";

export const createEmptyForm = (): IncomeForm => ({
  date: new Date().toISOString().slice(0, 10),
  amount: "",
  currency: "USD",
  recorded_by: "",
  received_from: "",
  income_type: "Monthly",
  description: "",
});

const fieldClass = () =>
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

interface Props {
  form: IncomeForm;
  onChange: (field: keyof IncomeForm, value: string) => void;
}

export default function IncomeFormFields({ form, onChange }: Props) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => onChange("date", e.target.value)}
            required
            className={fieldClass()}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={
              form.amount && !form.amount.includes(",")
                ? formatNumber(Number(form.amount))
                : form.amount
            }
            onChange={(e) => {
              const value = e.target.value.replace(/,/g, "");
              if (value === "") {
                onChange("amount", "");
                return;
              }
              const [integerPart, decimalPart] = value.split(".");
              const formattedValue = value.includes(".")
                ? `${integerPart ? formatNumber(Number(integerPart)) : ""}.${decimalPart ?? ""}`
                : formatNumber(Number(value));

              onChange("amount", formattedValue);
            }}
            placeholder="Enter amount"
            required
            className={fieldClass()}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Currency
          </label>
          <select
            value={form.currency}
            onChange={(e) => onChange("currency", e.target.value)}
            required
            className={fieldClass()}
          >
            <option value="USD">USD</option>
            <option value="AFN">AFN</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Recorded By
          </label>
          <input
            type="text"
            value={form.recorded_by}
            onChange={(e) => onChange("recorded_by", e.target.value)}
            placeholder="Enter name"
            required
            className={fieldClass()}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Received From
          </label>
          <input
            type="text"
            value={form.received_from}
            onChange={(e) => onChange("received_from", e.target.value)}
            placeholder="Enter client or source"
            required
            className={fieldClass()}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Income Type
          </label>
          <select
            value={form.income_type}
            onChange={(e) => onChange("income_type", e.target.value)}
            required
            className={fieldClass()}
          >
            <option value="Monthly">Monthly</option>
            <option value="Salary">Bonus</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div className="mt-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => onChange("description", e.target.value)}
          rows={3}
          placeholder="Enter transaction description"
          className={fieldClass()}
        />
      </div>
    </>
  );
}
