"use client";

import Link from "next/link";
import { User, FileUp, CreditCard } from "lucide-react";

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
            {/* Hero Section */}
            <section className="w-full max-w-xl mx-auto px-6 pt-16 pb-20 flex flex-col items-center text-center">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 leading-[1.15] max-w-md">
                    One QR code.<br /> Everything you need to share.
                </h1>

                <p className="hidden sm:block mt-5 text-base text-neutral-500 max-w-sm leading-relaxed">
                    Share files, swap contact records, and accept payments natively from a single fluid scan link.
                </p>

                <div className="mt-8 w-full flex flex-col sm:flex-row items-center gap-3 justify-center">
                    <Link
                        href="/register"
                        className="w-full sm:w-auto bg-emerald-950 hover:bg-emerald-900 text-white font-bold tracking-tight px-8 py-4 rounded-2xl transition-all duration-200 active:scale-98 text-center shadow-md shadow-emerald-950/5"
                    >
                        Create your QR identity
                    </Link>
                    <Link
                        href="/login"
                        className="w-full sm:w-auto text-sm font-bold tracking-tight text-neutral-500 hover:text-neutral-900 transition-colors py-3 text-center"
                    >
                        Already have one? Log in →
                    </Link>
                </div>
            </section>

            {/* Feature Blocks Section */}
            <section className="w-full bg-neutral-50/60 border-t border-neutral-100/80 px-6 py-16">
                <div className="max-w-md mx-auto flex flex-col gap-5">
                    <div className="mb-2 text-center sm:text-left">
                        <h2 className="text-xl font-extrabold tracking-tight text-neutral-900">
                            No apps to install. No friction.
                        </h2>
                    </div>

                    {actions.map((item, idx) => (
                        <div
                            key={idx}
                            className="group bg-white border border-neutral-200/60 p-6 rounded-3xl transition-all duration-200 hover:border-emerald-950/20 active:scale-[0.99] shadow-sm flex gap-4 items-start"
                        >
                            {/* Updated Icon Container */}
                            <div className="w-10 h-10 rounded-2xl bg-emerald-950/5 text-emerald-950 flex items-center justify-center shrink-0">
                                <item.icon size={20} strokeWidth={2.5} />
                            </div>

                            <div className="flex flex-col gap-1">
                                <h3 className="font-bold text-neutral-900 tracking-tight group-hover:text-emerald-950 transition-colors">
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