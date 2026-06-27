"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, ArrowRight, Check, Mail } from "lucide-react";
import { ICON_PATHS } from "@/lib/avatar";

type Step = "name" | "username" | "email" | "password" | "confirm";

const STEPS: Step[] = ["name", "username", "email", "password"];

function isValidEmail(val: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

export default function RegisterPage() {
    const router = useRouter();
    const supabase = createClient();

    const [step, setStep] = useState<Step>("name");
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [checkingUsername, setCheckingUsername] = useState(false);

    const stepIndex = STEPS.indexOf(step as (typeof STEPS)[number]);
    const progress = step === "confirm" ? 100 : ((stepIndex + 1) / STEPS.length) * 100;

    const decorIcons = [ICON_PATHS[0], ICON_PATHS[3], ICON_PATHS[6]];

    function suggestUsername(name: string) {
        return name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
    }

    async function checkUsername(handle: string) {
        if (handle.length < 3) { setUsernameAvailable(null); return; }
        setCheckingUsername(true);
        const { data } = await supabase
            .from("profiles")
            .select("id")
            .eq("username", handle)
            .maybeSingle();
        setUsernameAvailable(!data);
        setCheckingUsername(false);
    }

    function advance() {
        setErrorMsg(null);
        const idx = STEPS.indexOf(step);
        if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
    }

    function goBack() {
        setErrorMsg(null);
        const idx = STEPS.indexOf(step);
        if (idx > 0) setStep(STEPS[idx - 1]);
    }

    function tryAdvanceEmail() {
        if (!email) { setErrorMsg("Email is required."); return; }
        if (!isValidEmail(email)) { setErrorMsg("Enter a valid email address."); return; }
        advance();
    }

    async function submit() {
        if (!email || !password) { setErrorMsg("Email and password are required."); return; }
        setLoading(true);
        setErrorMsg(null);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName || undefined } },
        });

        if (error) { setErrorMsg(error.message); setLoading(false); return; }

        // No session means Supabase requires email confirmation before login.
        if (!data.session) {
            setErrorMsg(null);
            setStep("confirm" as Step);
            setLoading(false);
            return;
        }

        // Session exists — user is immediately logged in (email confirmation disabled).
        if ((username || fullName) && data.user) {
            await supabase
                .from("profiles")
                .update({
                    ...(username ? { username } : {}),
                    ...(fullName ? { display_name: fullName } : {}),
                })
                .eq("id", data.user.id);
        }

        router.refresh();
        router.push("/dashboard");
    }

    return (
        <div className="min-h-screen bg-white flex flex-col antialiased">
            {/* Progress bar */}
            <div className="w-full h-1 bg-neutral-100">
                <div
                    className="h-1 bg-emerald-900 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm flex flex-col gap-8">

                    <Link href="/" className="text-2xl font-black italic tracking-tighter text-emerald-900 text-center block">
                        MYQ
                    </Link>

                    {/* Decorative profile icons */}
                    <div className="flex justify-center gap-2">
                        {decorIcons.map((src, i) => (
                            <Image
                                key={i}
                                src={src}
                                alt=""
                                width={40}
                                height={40}
                                className={`rounded-xl ring-2 ring-neutral-100 transition-transform ${i === 1 ? "scale-110" : "opacity-60"}`}
                            />
                        ))}
                    </div>

                    {/* STEP: name */}
                    {step === "name" && (
                        <div className="flex flex-col gap-6 text-center">
                            <div>
                                <p className="text-2xl font-black text-neutral-900 leading-snug">
                                    What should we call you?
                                </p>
                                <p className="text-sm text-neutral-400 mt-2">Your display name on your profile.</p>
                            </div>
                            <input
                                autoFocus
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                                onKeyDown={(e) => e.key === "Enter" && advance()}
                                className="w-full bg-neutral-50 border border-neutral-200 focus:border-emerald-900 text-neutral-900 placeholder-neutral-300 font-medium px-4 py-3.5 rounded-2xl outline-none transition-all text-base text-center"
                            />
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => {
                                        if (fullName) setUsername(suggestUsername(fullName));
                                        advance();
                                    }}
                                    className="w-full bg-emerald-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors"
                                >
                                    Continue <ArrowRight size={16} />
                                </button>
                                <button
                                    onClick={advance}
                                    className="w-full text-sm font-medium text-neutral-400 hover:text-neutral-600 py-2 transition-colors"
                                >
                                    Skip for now
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP: username */}
                    {step === "username" && (
                        <div className="flex flex-col gap-6 text-center">
                            <div>
                                <p className="text-2xl font-black text-neutral-900 leading-snug">
                                    Pick your MY-Q handle
                                </p>
                                <p className="text-sm text-neutral-400 mt-2">Your unique link: <span className="text-neutral-600 font-semibold">myq.app/q/yourhandle</span></p>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-sm">@</span>
                                <input
                                    autoFocus
                                    type="text"
                                    value={username}
                                    onChange={(e) => {
                                        const v = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
                                        setUsername(v);
                                        checkUsername(v);
                                    }}
                                    onKeyDown={(e) => e.key === "Enter" && !checkingUsername && advance()}
                                    placeholder="yourhandle"
                                    maxLength={30}
                                    className={`w-full bg-neutral-50 border text-neutral-900 placeholder-neutral-300 font-medium pl-8 pr-10 py-3.5 rounded-2xl outline-none transition-all text-base text-center ${
                                        usernameAvailable === true ? "border-emerald-500" :
                                        usernameAvailable === false ? "border-red-400" :
                                        "border-neutral-200 focus:border-emerald-900"
                                    }`}
                                />
                                {checkingUsername && (
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300 text-xs">...</span>
                                )}
                                {!checkingUsername && usernameAvailable === true && (
                                    <Check size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                                )}
                            </div>
                            {usernameAvailable === false && (
                                <p className="text-xs text-red-500 font-medium -mt-4">That handle is taken.</p>
                            )}
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={advance}
                                    disabled={usernameAvailable === false || checkingUsername}
                                    className="w-full bg-emerald-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors disabled:opacity-40"
                                >
                                    Continue <ArrowRight size={16} />
                                </button>
                                <button
                                    onClick={() => { setUsername(""); advance(); }}
                                    className="w-full text-sm font-medium text-neutral-400 hover:text-neutral-600 py-2 transition-colors"
                                >
                                    Skip for now
                                </button>
                            </div>
                            <button onClick={goBack} className="flex items-center justify-center gap-1 text-sm text-neutral-400 hover:text-neutral-600 transition-colors mx-auto">
                                <ArrowLeft size={14} /> Back
                            </button>
                        </div>
                    )}

                    {/* STEP: email */}
                    {step === "email" && (
                        <div className="flex flex-col gap-6 text-center">
                            <div>
                                <p className="text-2xl font-black text-neutral-900 leading-snug">
                                    What&apos;s your email?
                                </p>
                                <p className="text-sm text-neutral-400 mt-2">Used to sign in and recover your account.</p>
                            </div>
                            <input
                                autoFocus
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
                                placeholder="name@example.com"
                                onKeyDown={(e) => e.key === "Enter" && isValidEmail(email) && tryAdvanceEmail()}
                                className={`w-full bg-neutral-50 border focus:border-emerald-900 text-neutral-900 placeholder-neutral-300 font-medium px-4 py-3.5 rounded-2xl outline-none transition-all text-base text-center ${
                                    errorMsg ? "border-red-400" : "border-neutral-200"
                                }`}
                            />
                            {errorMsg && <p className="text-xs text-red-500 font-medium -mt-4">{errorMsg}</p>}
                            <button
                                onClick={tryAdvanceEmail}
                                disabled={!isValidEmail(email)}
                                className="w-full bg-emerald-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Continue <ArrowRight size={16} />
                            </button>
                            <button onClick={goBack} className="flex items-center justify-center gap-1 text-sm text-neutral-400 hover:text-neutral-600 transition-colors mx-auto">
                                <ArrowLeft size={14} /> Back
                            </button>
                        </div>
                    )}

                    {/* STEP: password */}
                    {step === "password" && (
                        <div className="flex flex-col gap-6 text-center">
                            <div>
                                <p className="text-2xl font-black text-neutral-900 leading-snug">
                                    Set a password
                                </p>
                                <p className="text-sm text-neutral-400 mt-2">At least 8 characters.</p>
                            </div>
                            <input
                                autoFocus
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                onKeyDown={(e) => e.key === "Enter" && password.length >= 8 && submit()}
                                className="w-full bg-neutral-50 border border-neutral-200 focus:border-emerald-900 text-neutral-900 placeholder-neutral-300 font-medium px-4 py-3.5 rounded-2xl outline-none transition-all text-base text-center"
                            />
                            {errorMsg && <p className="text-xs text-red-500 font-medium">{errorMsg}</p>}
                            <button
                                onClick={submit}
                                disabled={loading || password.length < 8}
                                className="w-full bg-emerald-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors disabled:opacity-40"
                            >
                                {loading ? "Creating identity..." : <>Claim identity <ArrowRight size={16} /></>}
                            </button>
                            <button onClick={goBack} className="flex items-center justify-center gap-1 text-sm text-neutral-400 hover:text-neutral-600 transition-colors mx-auto">
                                <ArrowLeft size={14} /> Back
                            </button>
                        </div>
                    )}

                    {/* STEP: confirm (email confirmation required) */}
                    {step === "confirm" && (
                        <div className="flex flex-col gap-6 text-center">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                    <Mail size={28} className="text-emerald-900" />
                                </div>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-neutral-900 leading-snug">
                                    Check your email
                                </p>
                                <p className="text-sm text-neutral-400 mt-2">
                                    We sent a confirmation link to{" "}
                                    <span className="text-neutral-700 font-semibold">{email}</span>.
                                    Click it to activate your account.
                                </p>
                            </div>
                            <Link
                                href="/login"
                                className="w-full bg-emerald-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors"
                            >
                                Go to login <ArrowRight size={16} />
                            </Link>
                        </div>
                    )}

                    {step !== "confirm" && (
                    <p className="text-sm text-center text-neutral-400">
                        Already have an account?{" "}
                        <Link href="/login" className="text-emerald-900 font-bold hover:underline">
                            Log in →
                        </Link>
                    </p>
                    )}
                </div>
            </div>
        </div>
    );
}
