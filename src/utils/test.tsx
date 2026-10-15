import React, { useState } from "react";
import { dollarToAfghani } from "../utils/dollarToAfghani";
import { afghaniToDollar } from "../utils/afghaniToDollar";
import { calculateTax } from "../utils/calculateTax";

const HomePage = () => {
    const [amount, setAmount] = useState("100");
    const [rate, setRate] = useState("60");

    const dollarAmount = Number(amount);
    const exchangeRate = Number(rate);

    const isValid =
        amount.trim() !== "" &&
        rate.trim() !== "" &&
        Number.isFinite(dollarAmount) &&
        dollarAmount >= 0 &&
        Number.isFinite(exchangeRate) &&
        exchangeRate > 0;

    const afn = isValid
        ? dollarToAfghani(dollarAmount, exchangeRate)
        : "";

    const afnNumber = isValid ? dollarAmount * exchangeRate : 0;

    const usd = isValid
        ? afghaniToDollar(afnNumber, exchangeRate)
        : "";

    const taxResult = isValid ? calculateTax(afnNumber) : null;

    return (
        <div className="m-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">
                Currency Conversion and Tax Calculator
            </h2>

            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm">Amount (USD)</label>
                    <input
                        type="number"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full rounded-lg border p-2"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm">
                        Exchange Rate (AFN per USD)
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        className="w-full rounded-lg border p-2"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <p>USD to AFN: <strong>{afn || "—"}</strong></p>
                <p>AFN to USD: <strong>{usd || "—"}</strong></p>
                <hr className="my-4" />
                <p>Salary in AFN: <strong>{taxResult?.originalAmount ?? "—"} AFN</strong></p>
                <p>Tax Rate: <strong>{taxResult ? `${taxResult.taxRate}%` : "—"}</strong></p>
                <p>Tax Amount: <strong>{taxResult?.tax ?? "—"} AFN</strong></p>
                <p>Salary After Tax: <strong>{taxResult?.amountAfterTax ?? "—"} AFN</strong></p>
            </div>
        </div>
    );
};

export default HomePage;