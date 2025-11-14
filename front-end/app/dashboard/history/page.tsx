"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ArrowDownLeft, Loader2, RefreshCw } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { getTransactionsByAccount, Transaction } from "@/lib/accounts";

export default function History() {
    const router = useRouter();
    const { account, balance } = useUser();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchTransactions = async () => {
        if (!account?.id) return;
        
        setIsLoading(true);
        setError("");
        
        try {
            const { transactions: data } = await getTransactionsByAccount(account.id);
            // Sort by date, newest first
            const sorted = data.sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            setTransactions(sorted);
        } catch (err: any) {
            console.error("Failed to fetch transactions:", err);
            setError("Failed to load transactions. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [account?.id]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const isToday = date.toDateString() === today.toDateString();
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (isToday) {
            return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (isYesterday) {
            return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    const getTransactionIcon = (type: string) => {
        if (type === 'credit') {
            return (
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <ArrowDownLeft className="text-green-600" size={20} />
                </div>
            );
        } else {
            return (
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <ArrowUpRight className="text-red-600" size={20} />
                </div>
            );
        }
    };

    return(
        <div className="space-y-6 pb-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
                    <p className="text-gray-600 mt-2">View your transaction history and payment records</p>
                </div>
                <button
                    onClick={fetchTransactions}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Balance Summary */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white shadow-lg">
                <p className="text-sm opacity-90 mb-2">Current Balance</p>
                <h2 className="text-4xl font-bold">
                    ₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
                <p className="text-sm opacity-75 mt-2">{account?.currency || 'NGN'}</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Recent Transactions {!isLoading && transactions.length > 0 && (
                            <span className="text-sm font-normal text-gray-500">({transactions.length})</span>
                        )}
                    </h2>
                </div>
                
                <div className="divide-y divide-gray-100">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="p-6 text-center">
                            <div className="text-red-500 mb-2">⚠️</div>
                            <p className="text-sm text-red-600">{error}</p>
                            <button 
                                onClick={fetchTransactions}
                                className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="p-6">
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions yet</h3>
                                <p className="mt-1 text-sm text-gray-500">Get started by making your first payment.</p>
                                <div className="mt-6 flex gap-3 justify-center">
                                    <button 
                                        onClick={() => router.push('/dashboard/send')}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        Send Money
                                    </button>
                                    <button 
                                        onClick={() => router.push('/dashboard/utilities')}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        Pay Bills
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        transactions.map((transaction) => (
                            <div 
                                key={transaction.id}
                                className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        {getTransactionIcon(transaction.type)}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                {transaction.description || `${transaction.type === 'credit' ? 'Received' : 'Sent'} Money`}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatDate(transaction.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className={`text-sm font-bold ${
                                            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {transaction.type === 'credit' ? '+' : '-'}₦{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1 capitalize">
                                            {transaction.type}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
} 