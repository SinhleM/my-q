"use client";

export default function Files() {
    return (
        <div className= "animate-in fade-in duration-500" >
        <h1 className="text-3xl font-black tracking-tight" > Files & Documents </h1>
            < p className = "text-neutral-500 mt-2" > Upload and manage resources accessible via your profile.</p>

                < div className = "mt-8 border-2 border-dashed border-neutral-200 rounded-3xl p-12 text-center hover:border-emerald-500 transition-colors cursor-pointer" >
                    <p className="font-bold text-neutral-600" > Drag & drop files here </p>
                        < p className = "text-sm text-neutral-400 mt-1" > or click to browse your computer </p>
                            </div>

                            < div className = "mt-8 bg-neutral-50 p-6 rounded-3xl border border-neutral-100" >
                                <h3 className="font-bold mb-2" > Stored Assets </h3>
                                    < p className = "text-sm text-neutral-400" > Your cloud repository is currently empty.</p>
                                        </div>
                                        </div>
  );
}