// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setErrorMsg(error.message);
            setLoading(false);
        } else {
            router.refresh();
            router.push("/dashboard");
        }
    };

    return (
        <div className="min-h-screen bg-white text-neutral-900 px-6 py-12 flex flex-col justify-center items-center antialiased">
            <div className="w-full max-w-sm flex flex-col gap-8">

                {/* Simplified Header Logo */}
                <div className="flex flex-col items-center">
                    <Link href="/">
                        <Image
                            src="/myq-logo-removebg.png"
                            alt="logo"
                            width={40}
                            height={40}
                            className="object-contain"
                            priority
                        />
                    </Link>
                    <h1 className="text-2xl font-extrabold tracking-tight mt-4 text-center">
                        Welcome back
                    </h1>
                </div>

                {/* Input Interface Wrapper */}
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    {errorMsg && (
                        <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-2xl border border-red-100">
                            {errorMsg}
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 pl-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full bg-neutral-50 border border-neutral-200 focus:border-emerald-950/30 text-neutral-900 placeholder-neutral-400 font-medium px-4 py-3.5 rounded-2xl outline-none transition-all text-sm"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 pl-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-neutral-50 border border-neutral-200 focus:border-emerald-950/30 text-neutral-900 placeholder-neutral-400 font-medium px-4 py-3.5 rounded-2xl outline-none transition-all text-sm"
                        />
                    </div>

                    {/* Large, rounded forest green bubble action block */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-950 hover:bg-emerald-900 disabled:bg-neutral-200 text-white font-bold tracking-tight py-4 rounded-2xl transition-all duration-200 active:scale-98 text-center mt-2 shadow-md shadow-emerald-950/5 text-sm"
                    >
                        {loading ? "Signing in..." : "Sign in to my-q"}
                    </button>
                </form>

                {/* Alternate Auth Gateway Option */}
                <p className="text-sm font-semibold tracking-tight text-neutral-400 text-center">
                    New here?{" "}
                    <Link href="/register" className="text-emerald-950 hover:underline">
                        Create an identity →
                    </Link>
                </p>

            </div>
        </div>
    );
}