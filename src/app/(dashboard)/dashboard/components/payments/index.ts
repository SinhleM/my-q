"use client";

export default function Payments() {
    return (
        <div className= "animate-in fade-in duration-500" >
        <h1 className="text-3xl font-black tracking-tight" > Payments & Requests </h1>
            < p className = "text-neutral-500 mt-2" > Manage your incoming and outgoing settlement requests.</p>

                < div className = "mt-8 grid gap-4" >
                    <button className="bg-emerald-950 text-white px-6 py-4 rounded-2xl font-bold hover:bg-emerald-900 transition-colors" >
                        + Create New Request
                            </button>

                            < div className = "mt-6 border border-neutral-100 rounded-3xl p-8 bg-neutral-50" >
                                <h3 className="font-bold mb-4" > Transaction History </h3>
                                    < p className = "text-sm text-neutral-400" > No recent payment activity found.</p>
                                        </div>
                                        </div>
                                        </div>
  );
}