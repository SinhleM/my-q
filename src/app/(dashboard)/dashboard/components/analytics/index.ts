"use client";

export default function Analytics() {
    return (
        <div className= "animate-in fade-in duration-500" >
        <h1 className="text-3xl font-black tracking-tight" > Analytics </h1>
            < p className = "text-neutral-500 mt-2" > Monitor your digital engagement and reach.</p>

                < div className = "mt-8 grid grid-cols-1 md:grid-cols-2 gap-6" >
                    <div className="p-6 bg-white border border-neutral-100 rounded-3xl shadow-sm" >
                        <p className="text-sm font-bold text-neutral-400 uppercase tracking-wider" > Total Scans </p>
                            < p className = "text-4xl font-black mt-2" > 0 </p>
                                </div>
                                < div className = "p-6 bg-white border border-neutral-100 rounded-3xl shadow-sm" >
                                    <p className="text-sm font-bold text-neutral-400 uppercase tracking-wider" > Conversion Rate </p>
                                        < p className = "text-4xl font-black mt-2" > 0 % </p>
                                            </div>
                                            </div>
                                            </div>
  );
}