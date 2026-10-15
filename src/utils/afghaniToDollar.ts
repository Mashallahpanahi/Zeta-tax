/**
 * Converts Afghanis to US dollars.
 * exchangeRate - AFN value of 1 USD.
 *  amount - Amount in AFN.
 * returns Converted amount in USD, rounded to 2 decimal places.
 * afghaniToDollar (amount , exh_rate)
 */
import { formatNumber } from "./formatNumber";
export function afghaniToDollar(amount: number, exchangeRate: number): string {
    const result = Number((amount / exchangeRate).toFixed(2));
    return `${formatNumber(result)} $`;
}

