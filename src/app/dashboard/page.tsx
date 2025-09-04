export default function DashboardHome() {
    const transactions = [
        {id: 1, label: "MTN Airtime", amount: "$5", date: "10-08-2025"},
        {id: 2, label: "DSTV", amount: "$15", date: "10-08-2025"},
        {id: 3, label: "Withdrawal", amount: "$30", date: "12-08-2025"},
        {id: 4, label: "IKEDC Electricity", amount: "$15", date: "20-08-2025"},
        {id: 1, label: "MTN Data", amount: "$20", date: "23-08-2025"}
    ]
    return(
        <div>
            <h1>My Dashboard</h1>
            {/* Card Balance */}
            <section>
                <h4>Balance:</h4>
                <p>$1,000,865</p>
                <div>
                    <button>Send</button>
                    <button>Deposit</button>
                </div>
            </section>

            {/* Recent Transactions */}
            <section>
                {transactions.map((t) => (
                    <ul>
                        <li key={transactions.id}>
                            {transactions.label} {transactions.amount} {transactions.date}
                        </li>
                    </ul>
                ))}
            </section>
        </div>
    )
}