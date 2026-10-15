/**
 * Converts Afghanis to US dollars.
 * exchangeRate - AFN value of 1 USD.
 *  amount - Amount in AFN.
 * returns Converted amount in USD, rounded to 2 decimal places.
 * afghaniToDollar (amount , exh_rate)
 */
<<<<<<< HEAD

import { formatNumber } from "./formatNumber";

export function afghaniToDollar(amount: number, exchangeRate: number): string {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Amount must be a non-negative number.");
  }

  if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
    throw new Error("Exchange rate must be a positive number.");
  }

  return String(formatNumber(Number((amount / exchangeRate).toFixed(2))) + "$");
=======
import { formatNumber } from "./formatNumber";
export function afghaniToDollar(amount: number, exchangeRate: number): string {
    const result = Number((amount / exchangeRate).toFixed(2));
    return `${formatNumber(result)} $`;
>>>>>>> origin/Hamida3-utils-function
}
