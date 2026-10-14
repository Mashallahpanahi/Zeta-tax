/**
   Calculates salary tax using the defined tax brackets.
   amount - Original salary amount.
   returns Original salary, tax rate, tax amount, and salary after tax.
    0 - 10,000af → 0% tax
    10,001af - 100,000af  → 10% tax
    More than 100,001af → 15% tax
*/

export interface TaxResult {
    originalAmount: number;
    taxRate: number;
    tax: number;
    amountAfterTax: number;
}

export function calculateTax(amount: number): TaxResult {
    if (!Number.isFinite(amount) || amount < 0) {
        throw new Error("Salary must be a non-negative number.");
    }
    let taxRate: number;
    if (amount <= 10000) {
        taxRate = 0;
    } else if (amount <= 100000) {
        taxRate = 0.10;
    } else {
        taxRate = 0.15;
    }

    const tax = Number((amount * taxRate).toFixed(2));
    const amountAfterTax = Number((amount - tax).toFixed(2));

    return {
        originalAmount: amount,
        taxRate: taxRate * 100,
        tax,
        amountAfterTax,
    };
}
