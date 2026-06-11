"use client";

export default function Analytics() {
    const stats = [
        { label: "Total Profile Views", value: "1,248" },
        { label: "Unique Scans", value: "852" },
        { label: "Conversion Rate", value: "12.4%" },
    ];

    return (
        <div className="animate-in fade-in duration-500">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-emerald-950">
                Analytics
            </h1>
            <p className="text-neutral-500 mt-2 text-sm md:text-base">
                Your digital reach and engagement metrics.
            </p>

            {/* Mobile-first summary cards */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="p-6 bg-white border border-neutral-100 rounded-3xl shadow-sm">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-3xl font-black text-emerald-950 mt-2">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Placeholder for Data Visualization */}
            <div className="mt-8 p-6 md:p-8 bg-neutral-50 border border-neutral-100 rounded-3xl">
                <h3 className="font-bold text-emerald-950 mb-4">Weekly Trend</h3>
                <div className="h-48 flex items-end justify-center gap-2">
                    {[40, 60, 45, 80, 55, 90, 70].map((height, i) => (
                        <div
                            key={i}
                            className="w-full max-w-[40px] bg-emerald-900/20 rounded-t-lg transition-all hover:bg-emerald-900"
                            style={{ height: `${height}%` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}