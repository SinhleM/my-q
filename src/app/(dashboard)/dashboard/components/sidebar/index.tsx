/**
 * FILE: src/app/(dashboard)/dashboard/components/sidebar/index.tsx
 */

"use client";

import { useRouter } from "next/navigation";
import { Home } from "lucide-react";

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function Sidebar({
    activeTab,
    setActiveTab,
}: SidebarProps) {
    const router = useRouter();

    const items = [
        { id: "overview", label: "Overview" },
        { id: "analytics", label: "Analytics" },
        { id: "payments", label: "Payments & Requests" },
        { id: "files", label: "Files & Documents" },
        { id: "settings", label: "Settings" },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 border-r border-emerald-900 bg-emerald-950 h-screen sticky top-0 py-8 overflow-hidden">

            {/* Logo */}
            <div
                onClick={() => router.push("/")}
                className="text-center mb-10 cursor-pointer select-none"
            >
                <span className="text-3xl font-black italic tracking-tight text-white">
                    MYQ
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1 w-full">
                {items.map((i) => {
                    const isActive = activeTab === i.id;

                    return (
                        <button
                            key={i.id}
                            onClick={() => setActiveTab(i.id)}
                            className={`
                                w-[calc(100%-1.5rem)]
                                ml-6
                                py-3
                                text-left
                                font-bold
                                text-sm
                                transition-all
                                duration-200
                                rounded-l-xl
                                ${isActive || "hover:rounded-r-none"}
                                ${isActive ? "rounded-r-none" : "rounded-r-xl"}
                                ${isActive
                                    ? "bg-emerald-900 text-white"
                                    : "text-emerald-400/60 hover:text-white hover:bg-emerald-900/50"
                                }
                            `}
                        >
                            <span className="pl-4">
                                {i.label}
                            </span>
                        </button>
                    );
                })}
            </nav>

            {/* Bottom Home Button */}
            <div className="mt-auto flex justify-center pb-4">
                <button
                    onClick={() => router.push("/")}
                    title="Return to Home"
                    className="text-emerald-400/60 hover:text-white transition-colors p-2"
                >
                    <Home size={24} />
                </button>
            </div>

        </aside>
    );
}