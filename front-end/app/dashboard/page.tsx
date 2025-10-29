"use client";
import { useMemo, useState, useEffect } from "react";
import { SendIcon, ReceiveIcon, ConvertIcon, AirtimeIcon, BillsIcon } from "@/components/icons";
import { Menu, Bell, Eye, EyeOff, RefreshCw, Home, Receipt, Repeat, Wallet, Settings, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Skeleton component for loading state
function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-6 animate-pulse">
            {/* Skeleton Header */}
            <header className="px-4 py-4 flex items-center justify-between sticky top-0 z-10 bg-gradient-to-b from-gray-50 to-white">
                <div className="space-y-1.5">
                    <div className="w-7 h-0.5 bg-gray-300 rounded-full"></div>
                    <div className="w-7 h-0.5 bg-gray-300 rounded-full"></div>
                    <div className="w-7 h-0.5 bg-gray-300 rounded-full"></div>
                </div>
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-teal-200/40 via-cyan-200/30 to-teal-300/40 flex items-center justify-center">
                    <div className="absolute inset-0.5 bg-gradient-to-b from-gray-50 to-white rounded-full"></div>
                    <div className="w-5 h-5 bg-gray-300 rounded relative z-10"></div>
                </div>
            </header>

            <div className="px-4 space-y-5 mt-5">
                {/* Skeleton Balance Section */}
                <section className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl p-6 shadow-md">
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-6 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="text-center mb-3">
                        <div className="w-20 h-3 bg-gray-200 rounded mx-auto mb-5"></div>
                        <div className="w-64 h-12 bg-gray-200 rounded-lg mx-auto mb-5"></div>
                        <div className="w-32 h-8 bg-gray-200 rounded-full mx-auto mb-6"></div>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="bg-gray-200 rounded-2xl py-4 h-20"></div>
                        ))}
                    </div>
                </section>

                {/* Skeleton Exchange Rate */}
                <section className="bg-white rounded-3xl p-5 shadow-md">
                    <div className="flex items-center justify-between mb-5">
                        <div className="w-32 h-5 bg-gray-200 rounded"></div>
                        <div className="w-40 h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
                        <div className="w-6 h-6 bg-gray-200 rounded"></div>
                        <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
                    </div>
                    <div className="w-48 h-4 bg-gray-200 rounded mb-5"></div>
                    <div className="w-full h-12 bg-gray-200 rounded-xl"></div>
                </section>

                {/* Skeleton Transaction History */}
                <section className="bg-white rounded-3xl p-5 shadow-md">
                    <div className="flex items-center justify-between mb-5">
                        <div className="w-40 h-5 bg-gray-200 rounded"></div>
                        <div className="w-16 h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex items-start gap-3 p-3">
                                <div className="h-12 w-12 rounded-full bg-gray-200 flex-shrink-0"></div>
                                <div className="flex-1">
                                    <div className="w-40 h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="w-24 h-3 bg-gray-200 rounded"></div>
                                </div>
                                <div className="text-right">
                                    <div className="w-20 h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="w-16 h-5 bg-gray-200 rounded-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default function DashboardHome() {
    const router = useRouter();
    const [currency, setCurrency] = useState("NGN");
    const [showBalance, setShowBalance] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [accountsOpen, setAccountsOpen] = useState(false);

    const balance = useMemo(() => 25000, []);
    const wallet = "0x4A8C...E52B";

    // Simulate data loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500); // Simulate 1.5s loading time
        
        return () => clearTimeout(timer);
    }, []);

    // Map currency codes to their flag emoji
    const currencyFlag = (code: string) => {
        switch (code) {
            case "NGN":
                return "🇳🇬";
            case "GHS":
                return "🇬🇭";
            case "USD":
                return "🇺🇸";
            case "EUR":
                return "🇪🇺";
            case "BTC":
                return "₿";
            case "SOL":
                return "◎";
            case "ETH":
                return "Ξ";
            default:
                return "🏳️";
        }
    };

    const quickActions = [
        { label: "Send", icon: <SendIcon size={20} />, onClick: () => router.push("/dashboard/send") },
        { label: "Receive", icon: <ReceiveIcon size={20} />, onClick: () => {} },
        { label: "Convert", icon: <ConvertIcon size={20} />, onClick: () => {} },
        { label: "Buy Airtime", icon: <AirtimeIcon size={20} />, onClick: () => {} },
        { label: "Pay Bills", icon: <BillsIcon size={20} />, onClick: () => {} },
    ];

    const transactions = [
        { id: 1, title: "Received from @Allan", amount: "3,000 KES", status: "Successful", time: "Sep 26th, 18:11:32", type: "receive" },
        { id: 2, title: "Withdrew to NGN bank account", amount: "$25", status: "Successful", time: "Sep 26th, 18:11:32", type: "withdraw" },
    ];

    const menuItems = [
        { icon: Home, label: "Home", href: "/dashboard" },
        { icon: Receipt, label: "Transactions", href: "/dashboard/transactions" },
        { icon: Repeat, label: "Convert", href: "/dashboard/convert" },
        { icon: Wallet, label: "Wallets", href: "/dashboard/wallets" },
        { icon: Settings, label: "Settings", href: "/dashboard/settings" },
        { icon: Receipt, label: "Pay Bills", href: "/dashboard/bills" },
        { icon: SendIcon, label: "Send & Receive", href: "/dashboard/send-receive" },
    ];

    // Show skeleton while loading
    if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-6">
            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <Image 
                                src="/Sliqpay visual black(1).png" 
                                alt="Sliqpay" 
                                width={120} 
                                height={40}
                                className="h-8 w-auto"
                            />
                            <button 
                                onClick={() => setSidebarOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>
                        
                        {/* User Profile */}
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-green-700 flex items-center justify-center text-white text-xl font-bold">
                                OJ
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">Olubukunmi Joy</h3>
                                <span className="inline-block mt-1 px-3 py-1 bg-cyan-100 text-cyan-700 text-xs font-medium rounded-full">
                                    0x4A8C...E52B
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex-1 overflow-y-auto py-4">
                        {menuItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={index}
                                    className="w-full flex items-center gap-4 px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors"
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon size={22} strokeWidth={1.5} />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </aside>
            

            <div className="px-4 space-y-5 mt-5">
                {/* Balance section */}
                <section className="bg-gradient-to-br from-green-50 via-cyan-50 to-teal-50 rounded-3xl p-6 shadow-md">
                {/* Mobile Header */}
            <header className="px-4 py-4 flex items-center justify-between sticky top-0 z-10 ">
                {/* Hamburger Menu - Custom 3 bars */}
                <button 
                    className="p-1 hover:opacity-70 transition-opacity"
                    onClick={() => setSidebarOpen(true)}
                >
                    <div className="space-y-1.5">
                        <div className="w-7 h-0.5 bg-gray-800 rounded-full"></div>
                        <div className="w-5 h-0.5 bg-gray-800 rounded-full"></div>
                        <div className="w-7 h-0.5 bg-gray-800 rounded-full"></div>
                    </div>
                </button>
               
                {/* Notification Bell with Gradient Circle */}
                <button className="relative p-2 rounded-full bg-gradient-to-br from-teal-200/60 via-cyan-200/50 to-teal-300/60 hover:from-teal-200 hover:via-cyan-200 hover:to-teal-300 transition-all">
                    <div className="absolute inset-0.5 bg-gradient-to-b from-gray-50 to-white rounded-full"></div>
                    <Bell size={22} className="text-gray-800 relative z-10" strokeWidth={2} />
                </button>
            </header>
                    <div className="flex items-center justify-center mb-6">
                        <button
                            type="button"
                            onClick={() => setAccountsOpen(true)}
                            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs shadow-sm border border-gray-100 hover:bg-gray-50"
                            aria-haspopup="dialog"
                            aria-expanded={accountsOpen}
                            aria-controls="accounts-modal"
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span title={currency} aria-label={`${currency} flag`} className="text-lg">{currencyFlag(currency)}</span>
                            <span className="text-sm font-semibold text-gray-800">{currency}</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" className="text-gray-600" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                    </div>

                    <div>
                        <p className="text-xs text-gray-600 mb-3 text-center font-medium">Your Balance</p>
                        <div className="flex items-center justify-center gap-4 mb-5">
                            <button className="h-11 w-11 rounded-xl bg-cyan-200 text-green-600 flex items-center justify-center text-2xl font-light hover:bg-cyan-300 transition-colors">
                                +
                            </button>
                            <p className="text-5xl font-bold text-green-600 tracking-tight">
                                {showBalance ? `₦${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "•••••••"}
                            </p>
                            <button 
                                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                                onClick={() => setShowBalance((v) => !v)}
                            >
                                {showBalance ? <Eye size={20} className="text-gray-600" /> : <EyeOff size={20} className="text-gray-600" />}
                            </button>
                        </div>

                        <div className="flex justify-center mb-6">
                            <button className="inline-flex items-center gap-1.5 rounded-full bg-cyan-100/70 px-4 py-2 text-xs font-medium text-gray-700 shadow-sm hover:bg-cyan-100 transition-colors">
                                {wallet}
                            </button>
                        </div>

                        <div className="grid grid-cols-5 gap-2">
                            {quickActions.map((a) => (
                                <button 
                                    key={a.label} 
                                    onClick={a.onClick}
                                    className="flex flex-col items-center gap-2 rounded-2xl bg-white/80 backdrop-blur-sm py-4 hover:bg-white hover:shadow-md transition-all"
                                >
                                    <span className="text-gray-700">{a.icon}</span>
                                    <span className="text-[10px] text-gray-700 leading-tight text-center font-medium">{a.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Exchange Rate */}
                <section className="bg-white rounded-3xl p-5 shadow-md">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-base text-gray-900">Exchange Rate</h3>
                        <div className="flex items-center gap-2 text-xs text-cyan-600">
                            <span className="font-medium">Last updated: 01:38 AM</span>
                            <button className="p-1.5 hover:bg-cyan-50 rounded-lg transition-colors">
                                <RefreshCw size={14} className="text-cyan-600" />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 flex-1 border border-gray-100">
                            <span className="text-xl">🇪🇺</span>
                            <select className="flex-1 bg-transparent outline-none text-sm font-semibold text-gray-800">
                                <option>EUR</option>
                                <option>USD</option>
                                <option>GBP</option>
                                <option>BTC</option>
                            </select>
                        </div>
                        <div className="text-gray-900">
                            <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
                                <path d="M28 7H6l4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M4 17h22l-4 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 flex-1 border border-gray-100">
                            <span className="text-xl">🇳🇬</span>
                            <select className="flex-1 bg-transparent outline-none text-sm font-semibold text-gray-800">
                                <option>NGN</option>
                                <option>GHS</option>
                                <option>KES</option>
                            </select>
                        </div>
                    </div>
                    <p className="text-sm text-gray-700 font-semibold mb-5">1.00 EUR = 1,667.649 NGN</p>
                    <button className="w-full rounded-xl bg-white py-3.5 text-cyan-600 font-semibold text-sm hover:green-500 shadow-md transition-all border-4 border-cyan-500">
                        Convert Currencies
                    </button>
                </section>

                {/* Transaction History */}
                <section className="bg-white rounded-3xl p-5 shadow-md">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-base text-gray-900">Transaction History</h3>
                        <button className="text-xs text-cyan-600 font-semibold hover:underline">View all</button>
                    </div>

                    {transactions.length > 0 ? (
                        <div className="space-y-4">
                            {transactions.map((t) => (
                                <div key={t.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        t.type === 'receive' ? 'bg-green-50' : 'bg-cyan-50'
                                    }`}>
                                        {t.type === 'receive' ? (
                                            <ReceiveIcon size={22} className="text-green-600" strokeWidth={2.5} />
                                        ) : (
                                            <SendIcon size={22} className="text-cyan-600" strokeWidth={2.5} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{t.title}</p>
                                        <p className="text-xs text-gray-500 mt-1">{t.time}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-bold text-gray-900">{t.amount}</p>
                                        <span className="inline-block mt-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
                                            {t.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl bg-gray-50 text-center py-14">
                            <p className="font-semibold text-gray-900">Nothing here</p>
                            <p className="text-sm text-gray-500 mt-2">Please make a transaction to get started</p>
                        </div>
                    )}
                </section>
            </div>

            {/* Accounts modal */}
            <div id="accounts-modal" className={`fixed inset-0 z-50 ${accountsOpen ? '' : 'pointer-events-none'}`} aria-hidden={!accountsOpen}>
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${accountsOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setAccountsOpen(false)}
                />

                {/* Panel */}
                <div
                    className={[
                        'absolute left-0 right-0 bottom-0 mx-auto w-full max-w-md bg-white shadow-2xl',
                        'rounded-t-2xl md:rounded-2xl',
                        'transition-all duration-300',
                        accountsOpen ? 'translate-y-0 md:opacity-100 md:scale-100' : 'translate-y-full md:opacity-0 md:scale-95',
                        'md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
                    ].join(' ')}
                    role="dialog"
                    aria-modal="true"
                >
                    {/* Grab handle */}
                    <div className="md:hidden flex justify-center pt-3">
                        <div className="h-1.5 w-12 rounded-full bg-gray-300" />
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 pt-4 pb-3">
                        <h3 className="text-base font-bold text-gray-900">Accounts</h3>
                        <div className="flex items-center gap-2">
                           
                            <button onClick={() => setAccountsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X size={18} className="text-gray-700" />
                            </button>
                        </div>
                    </div>

                    <div className="px-5 pb-6 max-h-[70vh] overflow-y-auto">
                        {/* FIAT */}
                        <p className="text-[10px] font-semibold text-gray-500 tracking-wider mb-3">FIAT</p>
                        <div className="space-y-2">
                            {[
                                { code: 'NGN', name: 'Nigerian Naira' },
                                { code: 'GHS', name: 'Ghanian  Cedi' },
                                { code: 'USD', name: 'US Dollar' },
                            ].map((f) => (
                                <button
                                    key={f.code}
                                    onClick={() => { setCurrency(f.code); setAccountsOpen(false); }}
                                    className="w-full flex items-center justify-between rounded-2xl px-3 py-3 hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-white border flex items-center justify-center text-xl">
                                            {currencyFlag(f.code)}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-semibold text-gray-900">{f.name}</p>
                                            <p className="text-[11px] text-gray-500">₦25,000.00</p>
                                        </div>
                                    </div>
                                    <div className="h-6 w-6">
                                        {currency === f.code && (
                                            <div className="h-6 w-6 rounded-full bg-cyan-100 text-cyan-600 grid place-items-center">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* CRYPTO */}
                        <div className="mt-5 flex items-center justify-between">
                            <p className="text-[10px] font-semibold text-gray-500 tracking-wider">CRYPTO</p>
                            <p className="text-[10px] font-semibold text-emerald-600">CONNECTED WALLET: {wallet}</p>
                        </div>
                        <div className="mt-2 space-y-2">
                            {[
                                { code: 'SOL', name: 'Solana' },
                                { code: 'BTC', name: 'Bitcoin' },
                                { code: 'ETH', name: 'Ethereum' },
                            ].map((c) => (
                                <div key={c.code} className="w-full flex items-center justify-between rounded-2xl px-3 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-white border flex items-center justify-center text-xl">
                                            {currencyFlag(c.code)}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                                            <p className="text-[11px] text-gray-500">₦25,000.00</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

