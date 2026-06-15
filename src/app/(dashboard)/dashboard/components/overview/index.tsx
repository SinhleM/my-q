"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ExternalLink, Share2 } from "lucide-react";
import WelcomeModal from "./welcome-modal";

export default function Overview() {
    const [username, setUsername] = useState("");
    const [qrUrl, setQrUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [userId, setUserId] = useState("");

    function dismissWelcome(userId: string) {
        localStorage.setItem(`myq_welcome_${userId}`, "1");
        setShowWelcome(false);
    }

    useEffect(() => {
        async function load() {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) { setError("Not authenticated"); return; }

                const { data: profile } = await supabase
                    .from("profiles")
                    .select("username, display_name, bio")
                    .eq("id", user.id)
                    .single();

                // Show welcome card once per user — keyed by user ID so each new account gets it
                const dismissed = localStorage.getItem(`myq_welcome_${user.id}`);
                setUserId(user.id);
                if (!dismissed) setShowWelcome(true);

                if (!profile?.username) { setError("Profile not found"); return; }

                setUsername(profile.username);

                const res = await fetch("/api/qr/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: profile.username }),
                });
                const qr = await res.json();
                setQrUrl(qr.qrDataURL);
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "Something went wrong");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    function copyLink() {
        const url = `${window.location.origin}/q/${username}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    async function shareProfile() {
        const url = `${window.location.origin}/q/${username}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${username} on MY-Q`,
                    text: `Check out my MY-Q profile`,
                    url,
                });
            } catch {
                // user cancelled share — ignore
            }
        } else {
            copyLink();
        }
    }

    function downloadQR() {
        const a = document.createElement("a");
        a.href = qrUrl;
        a.download = "myq-qr.png";
        a.click();
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-48 bg-neutral-100 animate-pulse rounded-3xl" />
                <div className="h-32 bg-neutral-100 animate-pulse rounded-3xl" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-5 bg-red-50 rounded-2xl text-red-600 text-sm font-medium">{error}</div>
        );
    }

    const profileUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/q/${username}`;

    return (
        <>
        {showWelcome && (
            <WelcomeModal username={username} onDismiss={() => dismissWelcome(userId)} />
        )}
        <div className="space-y-4 pb-10">

            {/* HERO — QR card */}
            <div className="bg-emerald-900 rounded-3xl px-6 pt-8 pb-6 flex flex-col items-center">
                <p className="text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 text-center">
                    Your QR Identity
                </p>

                {qrUrl && (
                    <div className="bg-white rounded-2xl p-4 shadow-lg">
                        <img src={qrUrl} alt="Your QR code" className="w-48 h-48" />
                    </div>
                )}

                <p className="text-white font-black text-lg mt-4">@{username}</p>
                <p className="text-emerald-300/70 text-xs mt-0.5 truncate max-w-full">{profileUrl}</p>

                <div className="mt-5 flex gap-3 w-full">
                    <button
                        onClick={downloadQR}
                        className="flex-1 bg-white text-emerald-950 font-bold py-3 rounded-2xl text-sm hover:bg-emerald-50 transition-colors"
                    >
                        Download QR
                    </button>
                    <button
                        onClick={copyLink}
                        className="flex-1 bg-emerald-800 text-white font-bold py-3 rounded-2xl text-sm hover:bg-emerald-700 transition-colors"
                    >
                        {copied ? "Copied" : "Copy Link"}
                    </button>
                </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="bg-white rounded-3xl px-5 py-5">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Quick Actions</p>
                <div className="grid grid-cols-2 gap-3">
                    <a
                        href={`/q/${username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 bg-neutral-50 hover:bg-emerald-50 rounded-2xl p-4 transition-colors text-emerald-800"
                    >
                        <ExternalLink size={22} />
                        <span className="text-xs font-bold text-neutral-700 text-center">View Public Page</span>
                    </a>
                    <button
                        onClick={shareProfile}
                        className="flex flex-col items-center gap-2 bg-neutral-50 hover:bg-emerald-50 rounded-2xl p-4 transition-colors cursor-pointer text-emerald-800"
                    >
                        <Share2 size={22} />
                        <span className="text-xs font-bold text-neutral-700 text-center">Share Profile</span>
                    </button>
                </div>
            </div>

        </div>
        </>
    );
}
