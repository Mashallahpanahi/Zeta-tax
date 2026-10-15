/**
 * Converts US dollars to Afghanis.
 *  exchangeRate - AFN value of 1 USD.
 *  amount - Amount in USD.
 * returns Converted amount in AFN, rounded to 2 decimal places.
 */
import { formatNumber } from "./formatNumber";
export function dollarToAfghani(amount: number, exchangeRate: number): string {
    const result = Number((amount * exchangeRate).toFixed(2));
    return `${formatNumber(result)} $`;

<<<<<<< HEAD
export function dollarToAfghani(amount: number, exchangeRate: number): string {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Amount must be a non-negative number.");
  }

  if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
    throw new Error("Exchange rate must be a positive number.");
  }

  return String((amount * exchangeRate).toFixed(2) + " AFN");
=======
>>>>>>> origin/Hamida3-utils-function
}
