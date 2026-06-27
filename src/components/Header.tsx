"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Header() {
    const [loggedIn, setLoggedIn] = useState(false);
    const supabase = createClient();

    async function checkAuth() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoggedIn(false); return; }

        // Verify the profile row exists — no profile means the account is broken/unconfirmed
        const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();

        setLoggedIn(!!profile);
    }

    useEffect(() => {
        checkAuth();
        const { data: listener } = supabase.auth.onAuthStateChange(() => checkAuth());
        return () => listener.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <nav className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-100 px-6 py-3">
            <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
                <Link href="/" className="active:scale-95 transition-transform">
                    <span className="text-xl font-black italic tracking-tighter text-emerald-900">MYQ</span>
                </Link>

                <div className="flex items-center gap-6">
                    {loggedIn ? (
                        <Link
                            href="/dashboard"
                            className="text-sm font-bold tracking-tight bg-emerald-900 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-full transition-all duration-200 active:scale-95 shadow-sm"
                        >
                            Go to Dashboard
                        </Link>
                    ) : (
                        <Link
                            href="/dashboard"
                            className="text-sm font-bold tracking-tight bg-emerald-900 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-full transition-all duration-200 active:scale-95 shadow-sm"
                        >
                            Open Dashboard
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
