"use client";

export default function Overview() {
    return (
        <div className= "animate-in fade-in duration-500" >
        <h1 className="text-3xl font-black tracking-tight" > Your Identity Code </h1>
            < p className = "text-neutral-500 mt-2" > Scan to connect instantly with your unique digital profile.</p>

                < div className = "mt-8 border border-neutral-100 bg-white p-8 rounded-3xl shadow-sm inline-block" >
                    <div className="w-48 h-48 bg-neutral-100 rounded-lg flex items-center justify-center" >
                        {/* QR Image Logic goes here */ }
                        < span className = "text-xs text-neutral-400" > QR CODE </span>
                            </div>
                            </div>
                            </div>
  );
}