"use client";

import { useEffect, useState, useMemo } from "react";
import { ArrowLeft, Lock, ArrowUpDown } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { createTransaction } from "@/lib/accounts";

import { publicClient } from "@/utils/client";
import { CURRENCY_TOKENS } from "@/lib/currencies";
import { abi as fxOracleAbiArray } from "@/utils/fxOracleAbi.json";
import vaultAbiJson from "@/utils/vaultAbi.json";
import type { Abi } from 'viem';
import { useWalletClient } from "wagmi";

import { DEMO_PROFILES } from "@/lib/demoAccounts";

// --- ENVIRONMENT AND ABI SETUP (From New Version) ---
const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_VAULT_ADDRESS || "";
const FX_ORACLE_ADDRESS = process.env.NEXT_PUBLIC_FX_ORACLE_ADDRESS || "";

const sender = DEMO_PROFILES["Findy"];
const recipient = DEMO_PROFILES["Henry"];

export const vaultAbi = vaultAbiJson.abi as Abi;
// Minimal ERC20 ABI
const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
];

// Placeholder SliQ ID - Replace with actual recipient ID lookup
const RECIPIENT_SLIQ_ID = "@allan.sliq";

type NullableNumber = number | null;

export function RecipientInner() {
    const router = useRouter();
    const { data: wallet } = useWalletClient();
    
    // User Context and Account State (From Old Version)
    const { refreshAccount, account } = useUser();
    
    // Form and UI State
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState("");
    const [bankName, setBankName] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Params State (From Old Version)
    const [sendAmountParam, setSendAmountParam] = useState<string>("0");
    const [sendCurrencyParam, setSendCurrencyParam] = useState<string>("NGN");
    // NOTE: receiveAmountParam is now derived, initializing it here for URL compatibility
    const [receiveCurrencyParam, setReceiveCurrencyParam] = useState<string>("GHS");

    // Dynamic FX State (From New Version)
    const [rate, setRate] = useState<NullableNumber>(null);
    const [loadingTx, setLoadingTx] = useState(false);
    const [txError, setTxError] = useState<string | null>(null);

    // --- EFFECT: Load Query Params (From Old Version) ---
    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const url = new URL(window.location.href);
            const sp = url.searchParams;
            const sendAmt = sp.get("sendAmount") || "0";
            const sendCur = sp.get("sendCurrency") || "NGN";
            const recvCur = sp.get("receiveCurrency") || "GHS";
            
            setSendAmountParam(sendAmt);
            setSendCurrencyParam(sendCur);
            setReceiveCurrencyParam(recvCur);
            // We ignore the receiveAmountParam from URL since we calculate it dynamically
        } catch (e) {
            // ignore malformed URL
        }
    }, []);

    // --- EFFECT: Fetch Dynamic FX Rate (From New Version) ---
    useEffect(() => {
        async function fetchRate() {
            try {
                const tokenAddress = CURRENCY_TOKENS[sendCurrencyParam as keyof typeof CURRENCY_TOKENS];
                // Use a default address if FX_ORACLE_ADDRESS is not set for demo purposes, or skip
                if (!tokenAddress || !FX_ORACLE_ADDRESS) {
                    setRate(1500); // Fallback to hardcoded rate for demo if missing config
                    return;
                }

                const res = await publicClient.readContract({
                    address: FX_ORACLE_ADDRESS as `0x${string}`,
                    abi: fxOracleAbiArray as Abi,
                    functionName: "getRate",
                    args: [tokenAddress],
                });

                const n = typeof res === "bigint" ? Number(res) : Number(res || 0);
                setRate(Number.isFinite(n) ? n : null);
            } catch {
                setRate(null); // Set to null on error
            }
        }
        fetchRate();
    }, [sendCurrencyParam]);
    
    // --- COMPUTED VALUE: Dynamic Recipient Amount ---
    const { recipientAmount, exchangeRateDisplay } = useMemo(() => {
        const sendAmt = parseFloat(sendAmountParam || "0");
        let currentRate = rate;

        // Fallback for demo if rate fetching fails or is null
        if (currentRate === null) {
            // Using a simple hardcoded rate for UI display fallback if fetch fails
            currentRate = sendCurrencyParam === 'USD' && receiveCurrencyParam === 'NGN' ? 1500 : 1; 
        }

        const calculatedAmount = sendAmt * currentRate;
        
        // Final formatted amount for display
        const formattedAmount = Number.isFinite(calculatedAmount) 
            ? calculatedAmount.toFixed(2) 
            : "0.00";

        // Dynamic Display Rate (assuming 1 unit of sender currency buys X units of local currency)
        const rateDisplay = currentRate 
            ? `1 ${sendCurrencyParam} = ${currentRate.toFixed(2)} ${receiveCurrencyParam}`
            : "Loading Rate...";

        return {
            recipientAmount: formattedAmount,
            exchangeRateDisplay: rateDisplay
        };
    }, [sendAmountParam, rate, sendCurrencyParam, receiveCurrencyParam]);


    const formatAmount = (val: string) => {
        const num = Number(val.replace(/,/g, ""));
        if (Number.isNaN(num)) return "0.00";
        return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const recentRecipients = [
        { id: 1, name: "Musa Salamat", account: "0123456789", bank: "SAMPLE BANK" },
        { id: 2, name: "Musa Salamat", account: "0123456789", bank: "SAMPLE BANK" },
        { id: 3, name: "Musa Salamat", account: "0123456789", bank: "SAMPLE BANK" },
    ];

    // Validation rules
    const isAccountNumberValid = accountNumber.trim().length > 0 && /^\d+$/.test(accountNumber);
    const isAccountNameValid = accountName.trim().length > 0 && /^[A-Za-z ]+$/.test(accountName.trim());
    const isBankNameValid = bankName.trim().length > 0 && /^[A-Za-z ]+$/.test(bankName.trim());
    const isFormValid = isAccountNumberValid && isAccountNameValid && isBankNameValid;

    const handleSendMoney = () => {
        if (!isFormValid) return;
        // Open confirmation sheet/modal
        setShowConfirm(true);
    };

    // --- HYBRID TRANSFER LOGIC (Implements Web3 Payments) ---
    const handleConfirmTransfer = async () => {
        setTxError(null);
        setLoadingTx(true);
        const sendAmountNum = Number(sendAmountParam);

        try {
            // --- 1. Web3 Setup & Validation ---
            if (!wallet || !wallet.account) throw new Error("Wallet not connected");

            const tokenAddress = CURRENCY_TOKENS[sendCurrencyParam as keyof typeof CURRENCY_TOKENS];
            if (!TREASURY_ADDRESS) throw new Error("Treasury not configured");
            if (!tokenAddress) throw new Error("Unknown currency: " + sendCurrencyParam);
            
            if (!account?.sliqId) throw new Error("Missing Sender Sliq ID."); // Assuming sender's Sliq ID is available

            // NOTE: Ensure rawAmount is correctly scaled to the token's decimals (e.g., 18)
            // Since we don't know the token's decimals, we'll use 18 as the standard default.
            const rawAmount = BigInt(Math.floor(sendAmountNum * (10 ** 18))); 
            if (rawAmount <= BigInt(0)) throw new Error("Invalid amount");
            
            // Placeholder for the recipient's Sliq ID (since it's a bank/account number flow)
            // In a real app, you would look up the Sliq ID using the account/bank details.
            const SLIQ_RECIPIENT = RECIPIENT_SLIQ_ID; 

            const ZERO = "0x0000000000000000000000000000000000000000";

            // NATIVE TOKEN TRANSFER (e.g., sending ETH/MATIC/etc.)
            if (tokenAddress === ZERO) {
                
                // --- NATIVE LOGIC ---
                // Note: If you use native tokens, you MUST adjust the `routePaymentNative` call
                // to match your contract's exact signature. The old code was:
                // routePaymentNative([RECIPIENT_SLIQ_ID], { value: rawAmount })
                
                const { request } = await publicClient.simulateContract({
                    account: wallet.account,
                    address: TREASURY_ADDRESS as `0x${string}`,
                    abi: vaultAbi as Abi,
                    functionName: "routePaymentNative",
                    args: [SLIQ_RECIPIENT], // Assuming your contract takes Sliq ID
                    value: rawAmount,
                });

                await wallet.writeContract(request);

            }
            // ERC20 (Fiat Token) TRANSFER
            else {
                // --- ERC20 LOGIC: 1. Approve ---
                const { request: approveReq } = await publicClient.simulateContract({
                    account: wallet.account,
                    address: tokenAddress as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: "approve",
                    args: [TREASURY_ADDRESS, rawAmount],
                });

                // Execute Approval
                await wallet.writeContract(approveReq);

                // --- ERC20 LOGIC: 2. routePayment ---
                // This is the call that your friend suggested, but implemented with Viem's pattern.
                // Parameters expected: [recipientSliqId, tokenAddress, amount]
                const { request: routeReq } = await publicClient.simulateContract({
                    account: wallet.account,
                    address: TREASURY_ADDRESS as `0x${string}`,
                    abi: vaultAbi as Abi,
                    functionName: "routePayment",
                    args: [SLIQ_RECIPIENT, tokenAddress, rawAmount],
                });

                // Execute Payment Routing
                await wallet.writeContract(routeReq);
            }

            // --- 2. Local Transaction Record & UI Update ---
            if (account?.id) {
                await createTransaction({
                    accountId: account.id,
                    amount: sendAmountNum,
                    type: 'debit',
                    description: `Sent to ${accountName} (${accountNumber} - ${bankName}) via Web3`
                });
            }
            await refreshAccount(); 
            
            console.log("Transfer confirmed & Web3 call initiated", { accountNumber, accountName, bankName });
            
            setShowConfirm(false);
            setShowSuccess(true);

        } catch (error: any) {
            console.error("Transfer failed:", error);
            setTxError(error?.shortMessage || error?.message || "Transaction failed");
            setShowConfirm(false);
        } finally {
            setLoadingTx(false);
        }
    };


    // --- RENDER START (Preserving Old UI Structure) ---
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 bg-white border-b border-gray-100 z-10">
                <div className="flex items-center gap-4 px-4 py-4">
                    <button 
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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

                {/* Exchange Rate Display (Now Dynamic) */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-cyan-100 px-6 py-3 rounded-full">
                        <span className="text-sm font-semibold text-cyan-900">
                            {exchangeRateDisplay}
                        </span>
                    </div>
                </div>

                {/* Account Number */}
                {/* ... (Account Number input retained from Old Version) ... */}
                <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                        Account Number
                    </label>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="234567890"
                        value={accountNumber}
                        onChange={(e) => {
                            const digitsOnly = e.target.value.replace(/\D/g, "");
                            setAccountNumber(digitsOnly);
                        }}
                        className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                </div>

                {/* Account Name and Bank Name Row */}
                {/* ... (Account Name & Bank Name inputs retained from Old Version) ... */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-3">
                            Account Name
                        </label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={accountName}
                            onChange={(e) => {
                                const alphaOnly = e.target.value.replace(/[^A-Za-z ]/g, "");
                                setAccountName(alphaOnly);
                            }}
                            className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-3">
                            Bank Name
                        </label>
                        <input
                            type="text"
                            placeholder="United Bank Limited"
                            value={bankName}
                            onChange={(e) => {
                                const alphaOnly = e.target.value.replace(/[^A-Za-z ]/g, "");
                                setBankName(alphaOnly);
                            }}
                            className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Send Money Button */}
                <button
                    onClick={handleSendMoney}
                    disabled={!isFormValid || loadingTx}
                    className={`w-full font-semibold py-4 rounded-xl transition-all shadow-md mb-8 ${
                        isFormValid && !loadingTx
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                >
                    {loadingTx ? 'Processing...' : 'Send Money'}
                </button>
                {txError && (
                    <p className="text-sm text-center text-red-600 mb-4">{txError}</p>
                )}

                {/* Recents Section (Retained from Old Version) */}
                {/* ... (Recents UI retained from Old Version) ... */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Recents</h2>
                        <button className="text-sm font-semibold text-green-600 hover:text-green-700">
                            View All
                        </button>
                    </div>

                    {/* Recent Recipients List */}
                    <div className="space-y-3">
                        {recentRecipients.map((recipient) => (
                            <button
                                key={recipient.id}
                                onClick={() => {
                                    setAccountNumber(recipient.account);
                                    setAccountName(recipient.name);
                                    setBankName(recipient.bank);
                                }}
                                className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors text-left"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {recipient.name}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            {recipient.account} • {recipient.bank}
                                        </p>
                                    </div>
                                    <div className="ml-4">
                                        <Image
                                            src="/Sliqpay visual icon.png"
                                            alt="SliqPay logo"
                                            width={24}
                                            height={24}
                                            className="h-6 w-6 object-contain"
                                            priority
                                        />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        
        {/* Confirmation Overlay (Retained from Old Version) */}
        <div className={`fixed inset-0 z-50 ${showConfirm ? '' : 'pointer-events-none'}`} aria-hidden={!showConfirm}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${showConfirm ? 'opacity-100' : 'opacity-0'}`}
                onClick={() => setShowConfirm(false)}
            />

            {/* Panel */}
            <div
                className={[
                    'absolute left-0 right-0 bottom-0 mx-auto w-full max-w-md bg-white shadow-xl',
                    'rounded-t-2xl md:rounded-2xl',
                    'transition-all duration-300',
                    showConfirm ? 'translate-y-0 md:opacity-100 md:scale-100' : 'translate-y-full md:opacity-0 md:scale-95',
                    'md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
                ].join(' ')}
                role="dialog"
                aria-modal="true"
            >
                {/* Grab handle for mobile */}
                <div className="md:hidden flex justify-center pt-3">
                    <div className="h-1.5 w-12 rounded-full bg-gray-300" />
                </div>

                <div className="p-5 md:p-6">
                    <h2 className="text-center text-xl font-bold text-gray-900">Confirmation</h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Review all transfer details before you continue.<br className="hidden md:block" />
                        Transfers are final once completed and cannot be reversed.
                    </p>

                    {/* Details card */}
                    <div className="mt-5 rounded-xl bg-gray-50 p-4 md:p-5 border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Transaction Details</h3>

                        <dl className="space-y-3">
                            <div className="flex items-start justify-between gap-4">
                                <dt className="text-sm text-gray-700">Name</dt>
                                <dd className="text-sm font-semibold text-gray-900">{accountName || '—'}</dd>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                                <dt className="text-sm text-gray-700">Account No.</dt>
                                <dd className="text-sm font-semibold text-gray-900 tracking-wider">{accountNumber || '—'}</dd>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                                <dt className="text-sm text-gray-700">Bank</dt>
                                <dd className="text-sm font-semibold text-gray-900">{bankName || '—'}</dd>
                            </div>

                            <div className="flex items-start justify-between gap-4">
                                <dt className="text-sm text-gray-700">Amount</dt>
                                <dd className="relative space-y-2">
                                    {/* Top: Send amount */}
                                    <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-200 px-3 py-2 shadow-sm min-w-[220px]">
                                        <span className="font-extrabold text-gray-900">{formatAmount(sendAmountParam)}</span>
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-2.5 py-0.5">
                                            <span className="text-base leading-none">
                                                {sendCurrencyParam === 'NGN' ? '🇳🇬' : sendCurrencyParam === 'GHS' ? '🇬🇭' : '🏳️'}
                                            </span>
                                            <span className="text-xs font-semibold text-gray-700">{sendCurrencyParam}</span>
                                        </span>
                                    </div>

                                    {/* Switch icon between amounts */}
                                    <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                                        <div className="h-7 w-7 grid place-items-center rounded-lg bg-gray-700 text-white shadow">
                                            <ArrowUpDown size={14} />
                                        </div>
                                    </div>

                                    {/* Bottom: Receive amount (Now Dynamic) */}
                                    <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-200 px-3 py-2 shadow-sm min-w-[220px]">
                                        <span className="font-extrabold text-gray-900">{formatAmount(recipientAmount)}</span>
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-2.5 py-0.5">
                                            <span className="text-base leading-none">
                                                {receiveCurrencyParam === 'GHS' ? '🇬🇭' : receiveCurrencyParam === 'NGN' ? '🇳🇬' : '🏳️'}
                                            </span>
                                            <span className="text-xs font-semibold text-gray-700">{receiveCurrencyParam}</span>
                                        </span>
                                    </div>
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Fee note */}
                    <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-sm text-emerald-700">
                        You will be charged a total of <span className="font-semibold">{sendCurrencyParam} {formatAmount(sendAmountParam)}</span> including transaction fee
                    </div>

                    {/* Actions */}
                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="h-11 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmTransfer}
                            disabled={loadingTx}
                            className={`h-11 rounded-xl text-white font-semibold ${
                                loadingTx ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            {loadingTx ? 'Sending...' : 'Send Money'}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Success Overlay (Retained from Old Version) */}
        <div className={`fixed inset-0 z-50 ${showSuccess ? '' : 'pointer-events-none'}`} aria-hidden={!showSuccess}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${showSuccess ? 'opacity-100' : 'opacity-0'}`}
                onClick={() => setShowSuccess(false)}
            />

            {/* Panel */}
            <div
                className={[
                    'absolute left-0 right-0 bottom-0 mx-auto w-full max-w-md bg-white shadow-xl',
                    'rounded-t-2xl md:rounded-2xl',
                    'transition-all duration-300',
                    showSuccess ? 'translate-y-0 md:opacity-100 md:scale-100' : 'translate-y-full md:opacity-0 md:scale-95',
                    'md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
                ].join(' ')}
                role="dialog"
                aria-modal="true"
            >
                {/* Grab handle for mobile */}
                <div className="md:hidden flex justify-center pt-3">
                    <div className="h-1.5 w-12 rounded-full bg-gray-300" />
                </div>

                <div className="p-6">
                    {/* Success emblem */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Ring */}
                                <circle cx="48" cy="48" r="30" stroke="#16A34A" strokeWidth="6"/>
                                {/* Check */}
                                <path d="M36 50l9 9 16-20" stroke="#16A34A" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                                {/* Orbital dots (8 positions) */}
                                <circle cx="48" cy="8" r="3" fill="#A7F3D0"/>
                                <circle cx="76.3" cy="19.7" r="2.5" fill="#22C55E"/>
                                <circle cx="88" cy="48" r="3" fill="#A7F3D0"/>
                                <circle cx="76.3" cy="76.3" r="2.5" fill="#22C55E"/>
                                <circle cx="48" cy="88" r="3" fill="#A7F3D0"/>
                                <circle cx="19.7" cy="76.3" r="2.5" fill="#22C55E"/>
                                <circle cx="8" cy="48" r="3" fill="#A7F3D0"/>
                                <circle cx="19.7" cy="19.7" r="2.5" fill="#22C55E"/>
                            </svg>
                        </div>
                    </div>

                    {/* Amount and status */}
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <span className="text-emerald-600 font-extrabold text-xl">{formatAmount(sendAmountParam)}</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-2.5 py-0.5">
                            <span className="text-base leading-none">{sendCurrencyParam === 'NGN' ? '🇳🇬' : sendCurrencyParam === 'GHS' ? '🇬🇭' : '🏳️'}</span>
                            <span className="text-xs font-semibold text-gray-700">{sendCurrencyParam}</span>
                        </span>
                    </div>
                    <p className="mt-2 text-center text-base font-semibold text-gray-900">Sent Successfully</p>

                    {/* Details card */}
                    <div className="mt-5 rounded-xl bg-gray-50 p-4 border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Transaction Details</h3>
                        <dl className="space-y-3">
                            <div className="flex items-start justify-between gap-4">
                                <dt className="text-sm text-gray-700">Name</dt>
                                <dd className="text-sm font-semibold text-gray-900">{accountName || '—'}</dd>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                                <dt className="text-sm text-gray-700">Account No.</dt>
                                <dd className="text-sm font-semibold text-gray-900 tracking-wider">{accountNumber || '—'}</dd>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                                <dt className="text-sm text-gray-700">Bank</dt>
                                <dd className="text-sm font-semibold text-gray-900">{bankName || '—'}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 grid grid-cols-1">
                        <button
                            onClick={async () => {
                                await refreshAccount();
                                router.push('/dashboard');
                            }}
                            className="h-11 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}

export default function SendMoneyRecipientPage() {
    return <RecipientInner />;
}