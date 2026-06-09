// src/components/qr/QRCard.tsx
"use client";

import Image from "next/image";

interface QRCardProps {
    dataUrl: string;
    username: string;
}

export default function QRCard({ dataUrl, username }: QRCardProps) {
    const downloadQR = () => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `myq-${username}-identity.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white border border-neutral-100 p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm">

            {/* Container holding the high-res generated canvas asset */}
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/40 relative group aspect-square w-48 h-48 flex items-center justify-center">
                <Image
                    src={dataUrl}
                    alt={`@${username} qr code`}
                    width={180}
                    height={180}
                    className="object-contain rounded-lg select-none pointer-events-none"
                    priority
                />
            </div>

            {/* Target handle descriptor text */}
            <div className="mt-4">
                <h3 className="font-bold text-neutral-900 tracking-tight">Your Primary QR</h3>
                <p className="text-xs font-semibold text-emerald-950 mt-0.5 bg-emerald-950/5 px-2.5 py-0.5 rounded-full">
                    my-q.co.za/q/{username}
                </p>
            </div>

            {/* Touch action zone for saving/exporting */}
            <button
                onClick={downloadQR}
                className="mt-6 w-full bg-emerald-950 hover:bg-emerald-900 text-white font-bold tracking-tight text-xs py-3.5 px-4 rounded-2xl transition-all duration-200 active:scale-98 text-center shadow-sm"
            >
                Download Code PNG
            </button>

        </div>
    );
}