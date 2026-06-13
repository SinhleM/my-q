"use client";

import { useRouter } from "next/navigation";
import { Home, X } from "lucide-react";

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const items = [
    { id: "overview", label: "Overview" },
    { id: "payments", label: "Payments & Requests" },
    { id: "contacts", label: "Contacts" },
    { id: "files", label: "Files & Documents" },
    { id: "settings", label: "Settings" },
    { id: "profile", label: "Profile" },
];

function NavItems({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (t: string) => void }) {
    return (
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
                            cursor-pointer
                            ${isActive ? "rounded-r-none" : "rounded-r-xl"}
                            ${isActive
                                ? "bg-emerald-800 text-white"
                                : "text-emerald-200/60 hover:text-white hover:bg-emerald-800/50"
                            }
                        `}
                    >
                        <span className="pl-4">{i.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: SidebarProps) {
    const router = useRouter();

    return (
        <>
            {/* DESKTOP SIDEBAR */}
            <aside className="hidden md:flex flex-col w-64 border-r border-emerald-800 bg-emerald-900 h-screen sticky top-0 py-8 overflow-hidden">
                <div
                    onClick={() => router.push("/")}
                    className="text-center mb-10 cursor-pointer select-none"
                >
                    <span className="text-3xl font-black italic tracking-tight text-white">MYQ</span>
                </div>

                <NavItems activeTab={activeTab} setActiveTab={setActiveTab} />

                <div className="mt-auto flex justify-center pb-4">
                    <button
                        onClick={() => router.push("/")}
                        title="Return to Home"
                        className="text-emerald-400/60 hover:text-white transition-colors p-2 cursor-pointer"
                    >
                        <Home size={24} />
                    </button>
                </div>
            </aside>

            {/* MOBILE OVERLAY */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* MOBILE DRAWER — slides in from right */}
            <div className={`
                fixed top-0 right-0 h-full w-72 bg-emerald-900 z-50 flex flex-col py-8
                transition-transform duration-300 ease-in-out md:hidden
                ${isOpen ? "translate-x-0" : "translate-x-full"}
            `}>
                <div className="flex items-center justify-between px-6 mb-10">
                    <span className="text-2xl font-black italic tracking-tight text-white">MYQ</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-emerald-400 hover:text-white cursor-pointer transition-colors"
                    >
                        <X size={22} />
                    </button>
                </div>

                <NavItems activeTab={activeTab} setActiveTab={setActiveTab} />

                <div className="mt-auto flex justify-center pb-4">
                    <button
                        onClick={() => router.push("/")}
                        title="Return to Home"
                        className="text-emerald-400/60 hover:text-white transition-colors p-2 cursor-pointer"
                    >
                        <Home size={24} />
                    </button>
                </div>
            </div>
        </>
    );
}
