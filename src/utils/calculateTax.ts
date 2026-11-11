import axios from "axios";
import { formatNumber } from "./formatNumber";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
export interface TaxResult {
  originalAmount: string;
  taxRate: number;
  tax: string;
  amountAfterTax: string;
}

// Default salary tax rates
let rateUnder10k = 0;
let rateAbove10k = 0.1;
let rateAbove100k = 0.15;

// Default office rent tax rates
let rentRateUnder10k = 0;
let rentRateAbove10k = 0.1;
let rentRateAbove100k = 0.15;

/**
 * Fetches salary and rent tax rates from the backend.
 * If no configuration exists, the default rates remain unchanged.
 */
export async function loadTaxRates() {
  try {
    const response = await axios.get(`${BASE_URL}/table-tax`);
    const taxData = response.data?.data?.[0];

    if (taxData) {
      // Salary tax rates
      rateUnder10k = Number(taxData.salary_range_under_10k) / 100;
      rateAbove10k = Number(taxData.salary_range_above_10k) / 100;
      rateAbove100k = Number(taxData.salary_range_above_100k) / 100;

      // Office rent tax rates
      rentRateUnder10k = Number(taxData.rent_under_10k) / 100;
      rentRateAbove10k = Number(taxData.rent_above_10k) / 100;
      rentRateAbove100k = Number(taxData.rent_above_100k) / 100;
    }
  } catch (error) {
    console.error("Failed to load tax rates:", error);
  }
}

/**
 * Calculates salary tax using salary tax rates.
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

/**
 * Calculates office rent tax using rent tax rates.
 */
export function calculateRentTax(amount: number): TaxResult {
  let taxRate: number;

  if (amount <= 10000) {
    taxRate = rentRateUnder10k;
  } else if (amount <= 100000) {
    taxRate = rentRateAbove10k;
  } else {
    taxRate = rentRateAbove100k;
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
