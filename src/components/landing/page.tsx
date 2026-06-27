"use client";

import Link from "next/link";
import Image from "next/image";
import { User, FileUp, CreditCard } from "lucide-react";
import { ICON_PATHS } from "@/lib/avatar";

// Hardcoded scatter layout — avoids Math.random() SSR hydration mismatch
// Each entry: [top%, left%, rotation-deg, size-px, opacity, mobileHide]
const SCATTER: [number, number, number, number, number, boolean][] = [
    [8,   5,  -18, 52, 0.18, false],
    [5,  72,   12, 44, 0.15, false],
    [18, 88,  -25, 60, 0.17, true],
    [38,  2,   20, 48, 0.14, false],
    [55, 80,  -10, 56, 0.16, true],
    [70, 15,   30, 40, 0.14, true],
    [80, 60,  -20, 64, 0.18, false],
    [62, 45,   15, 44, 0.13, true],
    [25, 50,  -30, 50, 0.15, true],
];

export default function Landing() {
    const actions = [
        {
            title: "Share contacts",
            desc: "Phone, email, and social profiles — instantly added to any device's address book with a single tap.",
            icon: User,
        },
        {
            title: "Transfer files",
            desc: "Anyone can drop files directly onto your profile or grab shared assets. Zero app sign-up required for them.",
            icon: FileUp,
        },
        {
            title: "Receive payments",
            desc: "Generate secure billing requests instantly and collect funds cleanly through your PayFast gateway link.",
            icon: CreditCard,
        },
    ];

    return (
        <div className="w-full flex flex-col items-center">

            {/* Hero Section — white background, floating icons as subtle decoration */}
            <section className="w-full px-6 pt-20 pb-24 flex flex-col items-center text-center bg-white relative overflow-hidden">

                {/* Scattered floating profile icons */}
                {SCATTER.map(([top, left, rotate, size, opacity, mobileHide], i) => (
                    <div
                        key={i}
                        className={`absolute pointer-events-none ${mobileHide ? "hidden sm:block" : ""}`}
                        style={{
                            top: `${top}%`,
                            left: `${left}%`,
                            transform: `rotate(${rotate}deg)`,
                            opacity,
                        }}
                    >
                        <Image
                            src={ICON_PATHS[i % ICON_PATHS.length]}
                            alt=""
                            width={size}
                            height={size}
                            className="rounded-2xl"
                        />
                    </div>
                ))}

                <h1 className="relative text-4xl sm:text-6xl font-black tracking-tight text-neutral-900 leading-[1.1] max-w-lg">
                    One QR code.<br />
                    Everything you need.
                </h1>

                <p className="relative mt-5 text-base text-neutral-500 max-w-sm leading-relaxed font-medium">
                    Share files, swap contacts, and accept payments from a single scan.
                </p>

                <div className="relative mt-10 w-full max-w-xs flex flex-col gap-3">
                    <Link
                        href="/dashboard"
                        className="w-full bg-emerald-900 text-white font-bold tracking-tight px-8 py-4 rounded-2xl transition-all duration-200 active:scale-[0.98] text-center hover:bg-emerald-800"
                    >
                        Open Dashboard →
                    </Link>
                </div>
            </section>

            {/* Feature Blocks Section */}
            <section className="w-full bg-neutral-50 px-6 py-16">
                <div className="max-w-md mx-auto flex flex-col gap-5">
                    <div className="mb-2 text-center">
                        <h2 className="text-xl font-extrabold tracking-tight text-neutral-900">
                            No apps to install. No friction.
                        </h2>
                    </div>

                    {actions.map((item, idx) => (
                        <div
                            key={idx}
                            className="group bg-white border border-neutral-200/60 p-6 rounded-3xl transition-all duration-200 hover:border-emerald-900/20 active:scale-[0.99] shadow-sm flex gap-4 items-start"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-emerald-900/5 text-emerald-900 flex items-center justify-center shrink-0">
                                <item.icon size={20} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h3 className="font-bold text-neutral-900 tracking-tight group-hover:text-emerald-900 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-neutral-500 leading-relaxed font-medium">
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
