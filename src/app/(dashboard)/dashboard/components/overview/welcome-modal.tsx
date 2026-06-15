"use client";

import { useEffect, useRef } from "react";
import { UserRound, AtSign, FileText, X } from "lucide-react";

const STEPS = [
    { icon: UserRound, label: "Add your name",       desc: "So people know who they're looking at." },
    { icon: AtSign,    label: "Lock in your handle", desc: "Your unique link: myq.app/q/yourhandle" },
    { icon: FileText,  label: "Write a short bio",   desc: "One line is enough. Keep it real." },
];

export default function WelcomeModal({
    username,
    onDismiss,
}: {
    username: string;
    onDismiss: () => void;
}) {
    const firedRef = useRef(false);

    useEffect(() => {
        if (firedRef.current) return;
        firedRef.current = true;

        // Dynamically import so it doesn't break SSR
        import("canvas-confetti").then(({ default: confetti }) => {
            // Two bursts from the sides
            confetti({
                particleCount: 60,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.6 },
                colors: ["#064e3b", "#10b981", "#6ee7b7", "#fff", "#fbbf24"],
            });
            confetti({
                particleCount: 60,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.6 },
                colors: ["#064e3b", "#10b981", "#6ee7b7", "#fff", "#fbbf24"],
            });
        });
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-black/40 backdrop-blur-sm">
            <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">

                {/* Emerald header strip */}
                <div className="bg-emerald-900 px-6 pt-8 pb-6 text-center">
                    <button
                        onClick={onDismiss}
                        className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                    <p className="text-4xl mb-3">🎉</p>
                    <p className="text-white font-black text-2xl leading-tight">
                        You&apos;re in, @{username}!
                    </p>
                    <p className="text-emerald-200/70 text-sm mt-2 leading-relaxed">
                        Your QR identity is live. Do these 3 things and it&apos;ll be ready to share.
                    </p>
                </div>

                {/* Steps */}
                <div className="px-5 py-5 space-y-3">
                    {STEPS.map(({ icon: Icon, label, desc }, i) => (
                        <div key={label} className="flex items-center gap-3 bg-neutral-50 rounded-2xl px-4 py-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-900/8 flex items-center justify-center text-emerald-900 shrink-0 text-xs font-black">
                                {i + 1}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                                    <Icon size={13} className="text-emerald-700 shrink-0" />
                                    {label}
                                </p>
                                <p className="text-xs text-neutral-400 mt-0.5">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="px-5 pb-5 space-y-2">
                    <a
                        href="/dashboard?tab=profile"
                        onClick={onDismiss}
                        className="block w-full bg-emerald-900 text-white font-bold text-sm py-4 rounded-2xl text-center hover:bg-emerald-800 transition-colors"
                    >
                        Set up my profile →
                    </a>
                    <button
                        onClick={onDismiss}
                        className="block w-full text-sm text-neutral-400 hover:text-neutral-600 py-2 transition-colors cursor-pointer"
                    >
                        I&apos;ll do it later
                    </button>
                </div>
            </div>
        </div>
    );
}
