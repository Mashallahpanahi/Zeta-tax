import axios from "axios";
import { formatNumber } from "./formatNumber";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface TaxResult {
  originalAmount: string;
  taxRate: number;
  tax: string;
  amountAfterTax: string;
}

// Default tax rates
let rateUnder10k = 0;
let rateAbove10k = 0.1;
let rateAbove100k = 0.15;

/**
 * Fetches the latest tax rates from the backend.
 *
 * This function retrieves tax rates from the /table-tax endpoint
 * and updates the local tax rate variables.
 *
 * Call this function before using calculateTax() to ensure
 * the calculations use the latest available tax rates.
 *
 * @returns A Promise that resolves when the request finishes.
 */
export async function loadTaxRates() {
  try {
    const response = await axios.get(`${BASE_URL}/table-tax`);
    const taxData = response.data?.data?.[0];

    if (taxData) {
      rateUnder10k = Number(taxData.salary_range_under_10k) / 100;

      rateAbove10k = Number(taxData.salary_range_above_10k) / 100;

      rateAbove100k = Number(taxData.salary_range_above_100k) / 100;
    }
  } catch (error) {
    console.error("Failed to load tax rates:", error);
  }
}

/**
 * Calculates tax based on the provided amount and the loaded tax rates.
 *
 * Tax rate selection:
 * - Amount <= 10,000: uses rateUnder10k
 * - Amount > 10,000 and <= 100,000: uses rateAbove10k
 * - Amount > 100,000: uses rateAbove100k
 *
 * The tax and after-tax amount are rounded to two decimal places.
 * Amounts are formatted using formatNumber().
 *
 * IMPORTANT: Call and await loadTaxRates() before using this
 * function when the latest backend tax rates are required.
 *
 * @param amount - The original amount before tax.
 * @returns An object containing the original amount, tax rate,
 *          calculated tax, and amount remaining after tax.
 */
export function calculateTax(amount: number): TaxResult {
  let taxRate: number;

  if (amount <= 10000) {
    taxRate = rateUnder10k;
  } else if (amount <= 100000) {
    taxRate = rateAbove10k;
  } else {
    taxRate = rateAbove100k;
  }

  const tax = Number((amount * taxRate).toFixed(2));
  const amountAfterTax = Number((amount - tax).toFixed(2));

  return {
    originalAmount: formatNumber(amount),
    taxRate: taxRate * 100,
    tax: formatNumber(tax),
    amountAfterTax: formatNumber(amountAfterTax),
  };
}
