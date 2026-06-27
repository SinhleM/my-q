"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Inbox,
    CreditCard,
    FolderOpen,
    UsersRound,
    CircleUser,
    SlidersHorizontal,
    Home,
    X,
    QrCode,
} from "lucide-react";

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const items = [
    { id: "myq",       label: "MYQ Share",           Icon: QrCode,           highlight: true },
    { id: "overview",  label: "Overview",             Icon: LayoutDashboard,  highlight: false },
    { id: "inbox",     label: "Inbox",                Icon: Inbox,            highlight: false },
    { id: "payments",  label: "Payments & Requests",  Icon: CreditCard,       highlight: false },
    { id: "files",     label: "Files & Documents",    Icon: FolderOpen,       highlight: false },
    { id: "network",   label: "Network",              Icon: UsersRound,       highlight: false },
    { id: "profile",   label: "Profile",              Icon: CircleUser,       highlight: false },
    { id: "settings",  label: "Settings",             Icon: SlidersHorizontal, highlight: false },
];

function NavItems({
    activeTab,
    setActiveTab,
    inboxCount,
}: {
    activeTab: string;
    setActiveTab: (t: string) => void;
    inboxCount: number;
}) {
    return (
        <nav className="flex flex-col gap-0.5 w-full">
            {items.map(({ id, label, Icon, highlight }) => {
                const isActive = activeTab === id;
                const badge = id === "inbox" && inboxCount > 0 ? inboxCount : 0;
                const isMYQ = id === "myq";

                return (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`
                            w-[calc(100%-1.5rem)]
                            ml-6
                            py-2.5
                            flex items-center gap-3
                            font-bold text-sm
                            transition-all duration-150
                            rounded-l-xl cursor-pointer
                            ${isActive ? "rounded-r-none" : "rounded-r-xl"}
                            ${isActive
                                ? "bg-emerald-800 text-white"
                                : isMYQ
                                    ? "text-emerald-300 hover:text-white hover:bg-emerald-800/50"
                                    : "text-emerald-200/60 hover:text-white hover:bg-emerald-800/50"
                            }
                        `}
                    >
                        <span className="pl-4 shrink-0">
                            <Icon size={16} strokeWidth={2.5} />
                        </span>
                        <span className="flex-1 text-left">{label}</span>
                        {isMYQ && !isActive && (
                            <span className="mr-3 bg-emerald-400 text-emerald-950 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                                New
                            </span>
                        )}
                        {badge > 0 && (
                            <span className="mr-3 min-w-[20px] h-5 flex items-center justify-center bg-white text-emerald-900 text-[10px] font-black rounded-full px-1.5">
                                {badge > 99 ? "99+" : badge}
                            </span>
                        )}
                    </button>
                );
            })}
        </nav>
    );
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: SidebarProps) {
    const router = useRouter();
    const [inboxCount, setInboxCount] = useState(0);

    useEffect(() => {
        async function fetchCount() {
            try {
                const res = await fetch("/api/inbox/count");
                const json = await res.json();
                setInboxCount(json.count ?? 0);
            } catch {
                // silently ignore
            }
        }
        fetchCount();
        // refresh every 60s
        const interval = setInterval(fetchCount, 60_000);
        return () => clearInterval(interval);
    }, []);

    // Re-fetch when switching away from inbox (items may have been actioned)
    useEffect(() => {
        if (activeTab !== "inbox") {
            fetch("/api/inbox/count")
                .then((r) => r.json())
                .then((j) => setInboxCount(j.count ?? 0))
                .catch(() => {});
        }
    }, [activeTab]);

    return (
        <>
            {/* DESKTOP SIDEBAR */}
            <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-emerald-800 bg-emerald-900 h-screen overflow-y-auto py-8">
                <div
                    onClick={() => router.push("/")}
                    className="text-center mb-10 cursor-pointer select-none"
                >
                    <span className="text-3xl font-black italic tracking-tighter text-white">MYQ</span>
                </div>

                <NavItems activeTab={activeTab} setActiveTab={setActiveTab} inboxCount={inboxCount} />

                <div className="mt-auto flex justify-center pb-4">
                    <button
                        onClick={() => router.push("/")}
                        title="Return to Home"
                        className="text-emerald-400/60 hover:text-white transition-colors p-2 cursor-pointer"
                    >
                        <Home size={20} />
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

            {/* MOBILE DRAWER */}
            <div className={`
                fixed top-0 right-0 h-full w-72 bg-emerald-900 z-50 flex flex-col py-8
                transition-transform duration-300 ease-in-out md:hidden
                ${isOpen ? "translate-x-0" : "translate-x-full"}
            `}>
                <div className="flex items-center justify-between px-6 mb-10">
                    <span className="text-2xl font-black italic tracking-tighter text-white">MYQ</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-emerald-400 hover:text-white cursor-pointer transition-colors"
                    >
                        <X size={22} />
                    </button>
                </div>

                <NavItems activeTab={activeTab} setActiveTab={setActiveTab} inboxCount={inboxCount} />

                <div className="mt-auto flex justify-center pb-4">
                    <button
                        onClick={() => router.push("/")}
                        title="Return to Home"
                        className="text-emerald-400/60 hover:text-white transition-colors p-2 cursor-pointer"
                    >
                        <Home size={20} />
                    </button>
                </div>
            </div>
        </>
    );
}
