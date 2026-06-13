"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Header() {
    const [loggedIn, setLoggedIn] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setLoggedIn(!!data.session);
        });
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setLoggedIn(!!session);
        });
        return () => listener.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <nav className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-100 px-6 py-4">
            <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
                <Link href="/" className="active:scale-95 transition-transform">
                    <span className="text-3xl font-black italic tracking-tighter text-emerald-950">MYQ</span>
                </Link>

                <div className="flex items-center gap-6">
                    {loggedIn ? (
                        <Link
                            href="/dashboard"
                            className="text-sm font-bold tracking-tight bg-emerald-950 hover:bg-emerald-900 text-white px-5 py-2.5 rounded-full transition-all duration-200 active:scale-95 shadow-sm"
                        >
                            Go to Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-sm font-semibold tracking-tight text-neutral-500 hover:text-neutral-900 transition-colors"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/register"
                                className="text-sm font-bold tracking-tight bg-emerald-950 hover:bg-emerald-900 text-white px-5 py-2.5 rounded-full transition-all duration-200 active:scale-95 shadow-sm"
                            >
                                Get started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
