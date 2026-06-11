"use client";

import { useState } from "react";

export default function Files() {
    const [files] = useState([
        { id: 1, name: "ID_Document_Final.pdf", size: "2.4 MB", uploaded: "Jun 09, 2026" },
        { id: 2, name: "Proof_of_Address.png", size: "1.1 MB", uploaded: "Jun 05, 2026" },
    ]);

    return (
        <div className="animate-in fade-in duration-500">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-emerald-950">
                Files & Documents
            </h1>
            <p className="text-neutral-500 mt-2 text-sm md:text-base">
                Manage your verified documents and secure assets.
            </p>

            {/* Upload Zone */}
            <div className="mt-8 border-2 border-dashed border-neutral-200 rounded-3xl p-8 md:p-12 text-center hover:border-emerald-500 transition-colors cursor-pointer group bg-neutral-50">
                <p className="font-bold text-neutral-600 group-hover:text-emerald-900 transition-colors">
                    Click to upload or drag & drop
                </p>
                <p className="text-xs text-neutral-400 mt-1">PDF, PNG, JPG up to 5MB</p>
            </div>

            {/* File List */}
            <div className="mt-8">
                <h3 className="font-bold text-emerald-950 mb-4">Your Documents</h3>
                <div className="space-y-3">
                    {files.map((file) => (
                        <div
                            key={file.id}
                            className="flex items-center justify-between p-4 bg-white border border-neutral-100 rounded-2xl shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-900 font-bold text-xs">
                                    {file.name.split('.').pop()?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-emerald-950 text-sm">{file.name}</p>
                                    <p className="text-[10px] text-neutral-400">{file.uploaded} • {file.size}</p>
                                </div>
                            </div>
                            <button className="text-emerald-700 text-xs font-bold hover:underline">Download</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}