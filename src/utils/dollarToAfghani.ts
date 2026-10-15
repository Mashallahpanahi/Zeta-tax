/**
 * Converts US dollars to Afghanis.
 *  exchangeRate - AFN value of 1 USD.
 *  amount - Amount in USD.
 * returns Converted amount in AFN, rounded to 2 decimal places.
 */
import { formatNumber } from "./formatNumber";
export function dollarToAfghani(amount: number, exchangeRate: number): string {
    const result = Number((amount * exchangeRate).toFixed(2));
    return `${formatNumber(result)} AFN`;

}
