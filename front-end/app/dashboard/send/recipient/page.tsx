"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Lock, ArrowUpDown } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

function RecipientInner() {
    const router = useRouter();
    const { refreshAccount } = useUser();
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState("");
    const [bankName, setBankName] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Values from previous page (query params) - parsed on client to avoid Suspense requirement
    const [sendAmountParam, setSendAmountParam] = useState<string>("0");
    const [sendCurrencyParam, setSendCurrencyParam] = useState<string>("NGN");
    const [receiveAmountParam, setReceiveAmountParam] = useState<string>("0.00");
    const [receiveCurrencyParam, setReceiveCurrencyParam] = useState<string>("GHS");

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const url = new URL(window.location.href);
            const sp = url.searchParams;
            const sendAmt = sp.get("sendAmount") || "0";
            const sendCur = sp.get("sendCurrency") || "NGN";
            const recvAmt = sp.get("receiveAmount") || "0.00";
            const recvCur = sp.get("receiveCurrency") || "GHS";
            setSendAmountParam(sendAmt);
            setSendCurrencyParam(sendCur);
            setReceiveAmountParam(recvAmt);
            setReceiveCurrencyParam(recvCur);
        } catch (e) {
            // ignore malformed URL
        }
    }, []);

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

    const handleConfirmTransfer = () => {
        // TODO: integrate real transfer submission
        console.log("Transfer confirmed", { accountNumber, accountName, bankName });
        setShowConfirm(false);
        setShowSuccess(true);
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

                {/* Account Number */}
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
                    disabled={!isFormValid}
                    className={`w-full font-semibold py-4 rounded-xl transition-all shadow-md mb-8 ${
                        isFormValid
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                >
                    Send Money
                </button>

                {/* Recents Section */}
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
        
        {/* Confirmation Overlay: mobile bottom sheet, desktop centered modal */}
        <div className={`fixed inset-0 z-50 ${showConfirm ? '' : 'pointer-events-none'}`} aria-hidden={!showConfirm}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${showConfirm ? 'opacity-100' : 'opacity-0'}`}
                onClick={() => setShowConfirm(false)}
            />

            {/* Panel: mobile bottom, desktop centered */}
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

                                    {/* Bottom: Receive amount */}
                                    <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-200 px-3 py-2 shadow-sm min-w-[220px]">
                                        <span className="font-extrabold text-gray-900">{formatAmount(receiveAmountParam)}</span>
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
                            className="h-11 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700"
                        >
                            Send Money
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Success Overlay: mobile bottom sheet, desktop centered modal */}
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

