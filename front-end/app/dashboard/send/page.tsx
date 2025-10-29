"use client";
import { useState } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SendMoneyPage() {
    const router = useRouter();
    const [sendAmount, setSendAmount] = useState("");
    const [sendCurrency, setSendCurrency] = useState("NGN");
    const [receiveCurrency, setReceiveCurrency] = useState("GHS");
    const [remark, setRemark] = useState("");

    // Exchange rate calculation
    const exchangeRate = 1500; // 1 USD = 1500 NGN (example)
    const transactionFee = 100;
    const ourFee = 100;
    const totalDeducted = transactionFee + ourFee;
    const feePercentage = 0.69;

    const recipientAmount = sendAmount ? (parseFloat(sendAmount) * 0.6).toFixed(2) : "0.00";

    const currencyFlag = (code: string) => {
        switch (code) {
            case "NGN":
                return "🇳🇬";
            case "USD":
                return "🇺🇸";
            case "GHS":
                return "🇬🇭";
            case "EUR":
                return "🇪🇺";
            default:
                return "🏳️";
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 bg-white border-b border-gray-100 z-10">
                <div className="flex items-center gap-4 px-4 py-4">
                    <button 
                        onClick={() => router.back()}
                        className="p-2 ml-12 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} className="text-gray-900" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Send Money</h1>
                </div>
            </header>

            <div className="px-4 py-6 max-w-md mx-auto">
                {/* Rate Guaranteed Badge */}
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Lock size={18} className="text-gray-700" />
                    <span className="text-sm font-medium text-gray-700">Rate guaranteed</span>
                </div>

                {/* Exchange Rate Display */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-cyan-100 px-6 py-3 rounded-full">
                        <span className="text-sm font-semibold text-cyan-900">
                            1 USD = 1500 NGN
                        </span>
                    </div>
                </div>

                {/* Send Amount Section */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                        Send amount
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            placeholder="Enter amount"
                            value={sendAmount}
                            onChange={(e) => setSendAmount(e.target.value)}
                            className="w-full px-4 py-4 pr-32 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                                <span className="text-base">{currencyFlag(sendCurrency)}</span>
                                <select
                                    value={sendCurrency}
                                    onChange={(e) => setSendCurrency(e.target.value)}
                                    className="bg-transparent outline-none text-sm font-semibold text-gray-900 cursor-pointer"
                                >
                                    <option value="NGN">NGN</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GHS">GHS</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recipient Gets Section */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                        Recipient gets
                    </label>
                    <div className="relative">
                        <div className="w-full px-4 py-4 pr-32 bg-gray-200 border border-gray-300 rounded-xl text-gray-600 font-medium">
                            {recipientAmount}
                        </div>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                                <span className="text-base">{currencyFlag(receiveCurrency)}</span>
                                <select
                                    value={receiveCurrency}
                                    onChange={(e) => setReceiveCurrency(e.target.value)}
                                    className="bg-transparent outline-none text-sm font-semibold text-gray-900 cursor-pointer"
                                >
                                    <option value="GHS">GHS</option>
                                    <option value="NGN">NGN</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Remark Section */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                        Remark
                    </label>
                    <textarea
                        placeholder="Whats this for?"
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                </div>

                {/* Fee Breakdown */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Transaction Fee</span>
                            <span className="font-semibold text-gray-900">₦{transactionFee.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Our Fee</span>
                            <span className="font-semibold text-gray-900">₦{ourFee.toFixed(2)}</span>
                        </div>
                        <div className="pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-900">
                                    Total deducted fee ({feePercentage}%)
                                </span>
                                <span className="text-base font-bold text-gray-900">
                                    ₦{totalDeducted.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Next Button */}
                <button
                    onClick={() => {
                        const url = new URL(window.location.origin + "/dashboard/send/recipient");
                        url.searchParams.set("sendAmount", sendAmount || "0");
                        url.searchParams.set("sendCurrency", sendCurrency);
                        url.searchParams.set("receiveAmount", recipientAmount || "0.00");
                        url.searchParams.set("receiveCurrency", receiveCurrency);
                        router.push(url.pathname + "?" + url.searchParams.toString());
                    }}
                    className={`w-full font-semibold py-4 rounded-xl transition-all ${
                        sendAmount && parseFloat(sendAmount) > 0 && remark.trim()
                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!sendAmount || parseFloat(sendAmount) <= 0 || !remark.trim()}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
