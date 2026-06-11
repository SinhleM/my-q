"use client";

import { useRouter } from "next/navigation";
import { Home } from "lucide-react"; // Ensure lucide-react is installed

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: SidebarProps) {
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
            <div className="text-xl font-black italic text-white mb-10 text-center cursor-pointer px-6">
                MYQ
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
                                /* Width, Spacing, and Alignment */
                                w-[calc(100%-1.5rem)] ml-6 py-3 font-bold text-sm text-left transition-all duration-200
                                
                                /* Rounded Corners: 
                                   Default pill (l-xl, r-xl)
                                   Hover/Active flat right (r-none)
                                */
                                rounded-l-xl 
                                ${isActive || "hover:rounded-r-none"} 
                                ${isActive ? "rounded-r-none" : "rounded-r-xl"}

                                /* Colors */
                                ${isActive
                                    ? "text-white bg-emerald-900"
                                    : "text-emerald-400/60 hover:text-white hover:bg-emerald-900/50"
                                }
                            `}
                        >
                            <span className="pl-4">{i.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Bottom Centered Home Button */}
            <div className="mt-auto flex justify-center pb-4">
                <button
                    onClick={() => router.push("/")}
                    className="text-emerald-400/60 hover:text-white transition-colors p-2"
                    title="Return to Home"
                >
                    <Home size={24} />
                </button>
            </div>
        </aside>
    );
}