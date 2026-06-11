"use client";

export default function Payments() {
    const transactions = [
        { id: 1, title: "Service Fee", amount: "+R 450.00", date: "Jun 10, 2026", status: "Completed" },
        { id: 2, title: "Identity Verification", amount: "+R 150.00", date: "Jun 08, 2026", status: "Pending" },
    ];

    return (
        <div className="animate-in fade-in duration-500">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-emerald-950">
                Payments & Requests
            </h1>
            <p className="text-neutral-500 mt-2 text-sm md:text-base">
                Manage your incoming settlements and transaction history.
            </p>

            {/* Quick Action Bar */}
            <div className="mt-8">
                <button className="w-full md:w-auto bg-emerald-950 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-900 transition-all active:scale-95">
                    + Create New Request
                </button>
            </div>

            {/* Transaction List */}
            <div className="mt-8 space-y-4">
                <h3 className="font-bold text-emerald-950">Recent History</h3>
                {transactions.map((tx) => (
                    <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 bg-white border border-neutral-100 rounded-2xl shadow-sm"
                    >
                        <div>
                            <p className="font-bold text-emerald-950">{tx.title}</p>
                            <p className="text-xs text-neutral-400">{tx.date}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-emerald-900">{tx.amount}</p>
                            <p className={`text-[10px] font-bold uppercase ${tx.status === 'Completed' ? 'text-emerald-600' : 'text-amber-500'}`}>
                                {tx.status}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}