"use client";

import { useState } from "react";
import { X, Copy, Check, QrCode } from "lucide-react";
import Image from "next/image";

interface ShareModalProps {
    fileName: string;
    payloadUrl: string;
    qrDataUrl: string;
    onClose: () => void;
}

export default function ShareModal({
    fileName,
    payloadUrl,
    qrDataUrl,
    onClose,
}: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    function copyLink() {
        navigator.clipboard.writeText(payloadUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <QrCode size={18} className="text-emerald-800" />
                        <p className="font-black text-neutral-900 text-base">Share via WhatsApp</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* File name pill */}
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Sharing</p>
                <p className="text-sm font-bold text-neutral-800 truncate mb-5 bg-neutral-100 rounded-xl px-3 py-2">
                    {fileName}
                </p>

                {/* QR Code */}
                <div className="flex flex-col items-center bg-emerald-950 rounded-2xl py-6 px-4">
                    <div className="bg-white p-3 rounded-xl">
                        <Image
                            src={qrDataUrl}
                            alt="Share QR code"
                            width={180}
                            height={180}
                            className="block"
                            unoptimized
                        />
                    </div>
                    <p className="text-emerald-300 text-xs font-bold mt-4 tracking-wider uppercase">
                        Scan to open WhatsApp
                    </p>
                    <p className="text-emerald-400/60 text-[11px] mt-1 text-center leading-relaxed">
                        Opens WhatsApp with your file link pre-filled
                    </p>
                </div>

                {/* Copy fallback */}
                <button
                    onClick={copyLink}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-sm py-3.5 rounded-2xl transition-colors cursor-pointer"
                >
                    {copied ? (
                        <>
                            <Check size={15} className="text-emerald-600" />
                            <span className="text-emerald-600">Link copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy size={15} />
                            Copy share link
                        </>
                    )}
                </button>

            </div>
        </div>
    );
}
