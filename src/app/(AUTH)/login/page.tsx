"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight } from "lucide-react";
import { ICON_PATHS } from "@/lib/avatar";

const decorIcons = [ICON_PATHS[1], ICON_PATHS[4], ICON_PATHS[7]];

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get("next") || "/dashboard";

    const supabase = createClient();
    const [step, setStep] = useState<"email" | "password">("email");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    async function handleLogin() {
        setLoading(true);
        setErrorMsg(null);

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setErrorMsg(
                error.message === "Invalid login credentials"
                    ? "Wrong email or password. Try again."
                    : error.message
            );
            setLoading(false);
            return;
        }

        // Guard: verify profile row exists
        const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", data.user.id)
            .maybeSingle();

        if (!profile) {
            await supabase.auth.signOut();
            setErrorMsg("No account found for this email. Please register first.");
            setLoading(false);
            return;
        }

        // Block unconfirmed accounts
        if (!data.user.email_confirmed_at) {
            await supabase.auth.signOut();
            setErrorMsg("Please confirm your email before signing in. Check your inbox.");
            setLoading(false);
            return;
        }

        router.refresh();
        router.push(next);
    }

    return (
        <div className="min-h-screen bg-white flex flex-col antialiased">
            {/* Progress bar */}
            <div className="w-full h-1 bg-neutral-100">
                <div
                    className="h-1 bg-emerald-900 transition-all duration-500"
                    style={{ width: step === "email" ? "50%" : "100%" }}
                />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm flex flex-col gap-8">

                    {/* MYQ wordmark */}
                    <Link href="/" className="text-2xl font-black italic tracking-tighter text-emerald-900 text-center block">
                        MYQ
                    </Link>

                    {/* Decorative profile icons */}
                    <div className="flex justify-center gap-3">
                        {decorIcons.map((src, i) => (
                            <Image
                                key={i}
                                src={src}
                                alt=""
                                width={44}
                                height={44}
                                className={`rounded-xl ring-2 ring-neutral-100 transition-transform ${i === 1 ? "scale-110" : "opacity-60"}`}
                            />
                        ))}
                    </div>

                    {/* STEP: email */}
                    {step === "email" && (
                        <div className="flex flex-col gap-6 text-center">
                            <div>
                                <p className="text-2xl font-black text-neutral-900 leading-snug">
                                    Welcome back
                                </p>
                                <p className="text-sm text-neutral-400 mt-1">Enter your email to continue.</p>
                            </div>
                            <input
                                autoFocus
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
                                placeholder="name@example.com"
                                onKeyDown={(e) => e.key === "Enter" && email && setStep("password")}
                                className="w-full bg-neutral-50 border border-neutral-200 focus:border-emerald-900 text-neutral-900 placeholder-neutral-300 font-medium px-4 py-3.5 rounded-2xl outline-none transition-all text-base text-center"
                            />
                            {errorMsg && <p className="text-xs text-red-500 font-medium">{errorMsg}</p>}
                            <button
                                onClick={() => { if (email) setStep("password"); else setErrorMsg("Enter your email first."); }}
                                className="w-full bg-emerald-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors"
                            >
                                Continue <ArrowRight size={16} />
                            </button>
                        </div>
                    )}

                    {/* STEP: password */}
                    {step === "password" && (
                        <div className="flex flex-col gap-6 text-center">
                            <div>
                                <p className="text-2xl font-black text-neutral-900 leading-snug">
                                    Enter your password
                                </p>
                                <p className="text-sm text-neutral-400 mt-1">
                                    Signing in as <span className="text-neutral-700 font-semibold">{email}</span>{" "}
                                    <button
                                        onClick={() => { setStep("email"); setErrorMsg(null); }}
                                        className="text-emerald-900 font-bold hover:underline text-xs"
                                    >
                                        Change
                                    </button>
                                </p>
                            </div>
                            <input
                                autoFocus
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setErrorMsg(null); }}
                                placeholder="••••••••"
                                onKeyDown={(e) => e.key === "Enter" && password && handleLogin()}
                                className="w-full bg-neutral-50 border border-neutral-200 focus:border-emerald-900 text-neutral-900 placeholder-neutral-300 font-medium px-4 py-3.5 rounded-2xl outline-none transition-all text-base text-center"
                            />
                            {errorMsg && <p className="text-xs text-red-500 font-medium">{errorMsg}</p>}
                            <button
                                onClick={handleLogin}
                                disabled={loading || !password}
                                className="w-full bg-emerald-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors disabled:opacity-40"
                            >
                                {loading ? "Signing in..." : <>Sign in <ArrowRight size={16} /></>}
                            </button>
                        </div>
                    )}

                    <p className="text-sm text-center text-neutral-400">
                        No account yet?{" "}
                        <Link href="/register" className="text-emerald-900 font-bold hover:underline">
                            Create one →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <LoginForm />
        </Suspense>
    );
}
