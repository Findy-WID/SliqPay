export default function History() {
    return(
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
                <p className="text-gray-600 mt-2">View your transaction history and payment records</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                </div>
                <div className="p-6">
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by making your first payment.</p>
                        <div className="mt-6">
                            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                Make a Payment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 