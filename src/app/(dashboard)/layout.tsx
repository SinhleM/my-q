// src/app/(dashboard)/layout.tsx
import Link from "next/link";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-white text-neutral-900 flex flex-col md:flex-row antialiased">

            {/* Sidebar navigation shell - Emerald-950 forest green on desktop */}
            <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-neutral-100 md:border-emerald-900 bg-white md:bg-emerald-950 px-6 py-5 flex flex-row md:flex-col justify-between md:justify-start gap-8 shrink-0 sticky top-0 z-40">

                {/* Brand Logo - Swapped to bold italicised text string */}
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 active:scale-98 transition-transform md:py-2 select-none"
                >
                    <span className="text-xl font-black tracking-tight text-emerald-950 md:text-white italic">
                        MYQ
                    </span>
                </Link>

                {/* Expanded Navigation Links Shell */}
                <nav className="flex flex-row md:flex-col gap-4 md:gap-1.5 w-full items-center md:items-start text-xs md:text-sm font-bold tracking-tight text-neutral-400 md:text-emerald-400/60 overflow-x-auto no-scrollbar md:overflow-x-visible">

                    <Link
                        href="/dashboard"
                        className="text-neutral-900 md:text-white md:bg-emerald-900/40 md:w-full md:px-4 md:py-2.5 md:rounded-xl transition-all shrink-0"
                    >
                        Overview
                    </Link>

                    <Link
                        href="/dashboard/identity"
                        className="hover:text-neutral-900 md:hover:text-white md:w-full md:px-4 md:py-2.5 md:rounded-xl transition-all shrink-0"
                    >
                        Identity Pillars
                    </Link>

                    <Link
                        href="/dashboard/analytics"
                        className="hover:text-neutral-900 md:hover:text-white md:w-full md:px-4 md:py-2.5 md:rounded-xl transition-all shrink-0"
                    >
                        Analytics
                    </Link>

                    <Link
                        href="/dashboard/billing"
                        className="hover:text-neutral-900 md:hover:text-white md:w-full md:px-4 md:py-2.5 md:rounded-xl transition-all shrink-0"
                    >
                        Billing (ZAR)
                    </Link>

                    <Link
                        href="/dashboard/settings"
                        className="hover:text-neutral-900 md:hover:text-white md:w-full md:px-4 md:py-2.5 md:rounded-xl transition-all shrink-0"
                    >
                        Settings
                    </Link>

                </nav>

            </aside>

            {/* Main content body panel */}
            <main className="flex-1 px-6 py-10 md:px-12 max-w-4xl">
                {children}
            </main>

        </div>
    );
}