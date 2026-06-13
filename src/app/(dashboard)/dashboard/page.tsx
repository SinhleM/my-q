// src/app/(dashboard)/dashboard/page.tsx

"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import Sidebar from "./components/sidebar";
import Overview from "./components/overview";
import Payments from "./components/payments";
import Inbox from "./components/inbox";
import Files from "./components/files";
import Settings from "./components/settings";
import Profile from "./components/profile";

import PaymentCheckoutModal from "./components/payments/checkout-modal";

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState("overview");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const searchParams = useSearchParams();
    const paymentId = searchParams.get("pay");

    return (
        <div className="flex flex-col md:flex-row md:h-screen md:overflow-hidden w-full bg-neutral-50 antialiased text-neutral-900">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => { setActiveTab(tab); setIsMobileMenuOpen(false); }}
                isOpen={isMobileMenuOpen}
                setIsOpen={setIsMobileMenuOpen}
            />

            {/* MOBILE HEADER */}
            <header className="md:hidden flex items-center justify-between px-5 py-4 bg-emerald-900 sticky top-0 z-30">
                <span className="text-white font-black italic text-2xl tracking-tight">MYQ</span>
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="text-white p-1 cursor-pointer"
                    aria-label="Open menu"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
            </header>

            <main className="flex-1 w-full px-4 py-6 md:px-12 md:py-10 bg-neutral-50 md:overflow-y-auto md:h-screen">
                {activeTab === "overview" && <Overview />}
                {activeTab === "payments" && <Payments />}
                {activeTab === "inbox" && <Inbox />}
                {activeTab === "files" && <Files />}
                {activeTab === "settings" && <Settings />}
                {activeTab === "profile" && <Profile />}
            </main>

            {/* PAYMENT MODAL TRIGGER */}
            {paymentId && (
                <PaymentCheckoutModal
                    paymentId={paymentId}
                    onClose={() => {
                        window.history.replaceState({}, "", "/dashboard");
                    }}
                />
            )}
        </div>
    );
}