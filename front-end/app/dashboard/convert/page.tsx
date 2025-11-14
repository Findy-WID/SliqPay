"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export default function ConvertMoney() {
  const router = useRouter();
  const { balance, refreshAccount } = useUser();
  const [fromAmount, setFromAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("NGN");
  const [toCurrency, setToCurrency] = useState("GHS");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const conversionFee = 100.00;
  const exchangeRate = 1441.625; // Example rate: 1 NGN = 1441.625 GHS

  // Currency options with flags
  const currencies = [
    { code: "NGN", name: "Nigerian Naira", flag: "🇳🇬" },
    { code: "GHS", name: "Ghanaian Cedi", flag: "🇬🇭" },
    { code: "USD", name: "US Dollar", flag: "🇺🇸" },
    { code: "EUR", name: "Euro", flag: "🇪🇺" },
    { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  ];

  const getCurrencyFlag = (code: string) => {
    return currencies.find(c => c.code === code)?.flag || "🏳️";
  };

  // Calculate converted amount
  const calculateConversion = () => {
    if (!fromAmount || isNaN(Number(fromAmount))) return 0;
    const amount = Number(fromAmount);
    if (amount <= 0) return 0;
    
    const amountAfterFee = Math.max(0, amount - conversionFee);
    const converted = amountAfterFee * exchangeRate;
    return converted;
  };

  const amountToConvert = fromAmount && !isNaN(Number(fromAmount)) && Number(fromAmount) > 0
    ? Math.max(0, Number(fromAmount) - conversionFee)
    : 0;

  const receivedAmount = calculateConversion();

  const isFormValid = fromAmount && !isNaN(Number(fromAmount)) && Number(fromAmount) > conversionFee && Number(fromAmount) <= balance;

  const handleConvert = async () => {
    if (!isFormValid) return;
    
    // TODO: Implement actual conversion API call
    alert(`Converting ${fromCurrency} ${fromAmount} to ${toCurrency} ${receivedAmount.toFixed(2)}`);
    
    // Refresh balance before redirecting
    await refreshAccount();
    router.push("/dashboard");
  };

  const CurrencyDropdown = ({
    selectedCurrency,
    onSelect,
    isOpen,
    setIsOpen
  }: {
    selectedCurrency: string;
    onSelect: (code: string) => void;
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
  }) => (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded transition-colors"
      >
        <span className="text-lg">{getCurrencyFlag(selectedCurrency)}</span>
        <span className="text-sm font-semibold text-gray-700">{selectedCurrency}</span>
        <ChevronDown size={16} className="text-gray-500" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
            {currencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => {
                  onSelect(currency.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors text-left ${
                  selectedCurrency === currency.code ? 'bg-green-50' : ''
                }`}
              >
                <span className="text-lg">{currency.flag}</span>
                <span className="text-sm font-medium text-gray-900">{currency.code}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-6">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-100 z-10">
        <div className="flex items-center gap-4 px-4 py-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-900" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Convert Money</h1>
        </div>
      </header>

      <div className="px-4 py-6 max-w-md mx-auto">
        <p className="text-sm text-gray-600 mb-6">
          Enter the amount and Currency you would like convert from and to.
        </p>

        {/* Amount to convert */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Amount to convert
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              placeholder="Enter amount"
              value={fromAmount}
              onChange={(e) => {
                const value = e.target.value;
                // Allow numbers and decimal point
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setFromAmount(value);
                }
              }}
              className="w-full px-4 py-4 pr-24 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <CurrencyDropdown
                selectedCurrency={fromCurrency}
                onSelect={setFromCurrency}
                isOpen={showFromDropdown}
                setIsOpen={setShowFromDropdown}
              />
            </div>
          </div>
          <p className="mt-1.5 text-xs text-gray-500">
            Bal: ₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Conversion Details */}
        <div className="mb-6 bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Conversion Fee</span>
            <span className="text-sm font-semibold text-gray-900">
              ₦{conversionFee.toFixed(2)}
            </span>
          </div>
          <div className="h-px bg-gray-200"></div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Today's rate</span>
            <span className="text-sm font-semibold text-gray-900">
              ×{exchangeRate.toLocaleString()}
            </span>
          </div>
          <div className="h-px bg-gray-200"></div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Amount we'll convert</span>
            <span className="text-sm font-bold text-gray-900">
              ₦{amountToConvert.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Amount you will receive */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Amount you will receive
          </label>
          <div className="relative bg-gray-200 rounded-xl p-6 flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">
              {receivedAmount.toFixed(2)}
            </span>
            <div className="absolute right-4">
              <CurrencyDropdown
                selectedCurrency={toCurrency}
                onSelect={setToCurrency}
                isOpen={showToDropdown}
                setIsOpen={setShowToDropdown}
              />
            </div>
          </div>
        </div>

        {/* Convert Button */}
        <button
          onClick={handleConvert}
          disabled={!isFormValid}
          className={`w-full font-semibold py-4 rounded-xl transition-all shadow-md ${
            isFormValid
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Convert Money
        </button>
      </div>
    </div>
  );
}
