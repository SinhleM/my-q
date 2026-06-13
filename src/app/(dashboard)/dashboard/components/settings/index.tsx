"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function Toggle({
    checked,
    onChange,
    disabled,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <button
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 ${
                checked ? "bg-emerald-900" : "bg-neutral-200"
            } disabled:opacity-50 cursor-pointer`}
        >
            <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    checked ? "translate-x-6" : "translate-x-0"
                }`}
            />
        </button>
    );
}

function SettingRow({
    title,
    description,
    checked,
    onChange,
    saving,
}: {
    title: string;
    description: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    saving: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-4 border-b border-neutral-100 last:border-b-0">
            <div className="min-w-0">
                <p className="text-sm font-bold text-neutral-900">{title}</p>
                <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{description}</p>
            </div>
            <Toggle checked={checked} onChange={onChange} disabled={saving} />
        </div>
    );
}

export default function Settings() {
    const supabase = createClient();

    const [acceptPayments, setAcceptPayments] = useState(true);
    const [acceptFiles, setAcceptFiles] = useState(true);
    const [maxFileMb, setMaxFileMb] = useState(25);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState("");
    const [username, setUsername] = useState("");

    useEffect(() => { loadSettings(); }, []);

    async function loadSettings() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from("profiles")
            .select("username, accept_payments, accept_files, max_file_size_mb")
            .eq("id", user.id)
            .single();

        if (data) {
            setAcceptPayments(data.accept_payments);
            setAcceptFiles(data.accept_files);
            setMaxFileMb(data.max_file_size_mb);
            setUsername(data.username);
        }
        setLoading(false);
    }

    async function patch(updates: Record<string, unknown>) {
        setSaving(true);
        const res = await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
        });
        const json = await res.json();
        setSaving(false);

        if (json.error) {
            showToast(json.error);
        } else {
            showToast("Saved");
        }
    }

    function showToast(msg: string) {
        setToast(msg);
        setTimeout(() => setToast(""), 2000);
    }

    async function togglePayments(v: boolean) {
        setAcceptPayments(v);
        await patch({ accept_payments: v });
    }

    async function toggleFiles(v: boolean) {
        setAcceptFiles(v);
        await patch({ accept_files: v });
    }

    async function saveMaxFile() {
        await patch({ max_file_size_mb: maxFileMb });
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-32 bg-neutral-100 animate-pulse rounded-3xl" />
                <div className="h-48 bg-neutral-100 animate-pulse rounded-3xl" />
            </div>
        );
    }

    const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

    return (
        <div className="space-y-4 pb-10">

            {/* HERO */}
            <div className="bg-emerald-900 rounded-3xl px-6 py-6">
                <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Your QR Identity</p>
                <p className="text-white font-black text-lg mt-1">@{username}</p>
                <a
                    href={`/q/${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-between bg-emerald-900 rounded-2xl px-4 py-3"
                >
                    <span className="text-emerald-300 text-xs font-bold truncate">
                        {siteUrl}/q/{username}
                    </span>
                    <span className="text-emerald-400 ml-2 shrink-0">→</span>
                </a>
            </div>

            {/* QR IDENTITY VISIBILITY */}
            <div className="bg-white rounded-3xl px-5 py-2">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider pt-4 pb-2">
                    What people can do on your page
                </p>
                <SettingRow
                    title="Accept Payments"
                    description="Show your payment requests when someone scans your QR."
                    checked={acceptPayments}
                    onChange={togglePayments}
                    saving={saving}
                />
                <SettingRow
                    title="Accept Files"
                    description="Allow people to upload files to your profile via QR."
                    checked={acceptFiles}
                    onChange={toggleFiles}
                    saving={saving}
                />
            </div>

            {/* FILE LIMITS */}
            <div className="bg-white rounded-3xl px-5 py-5 space-y-3">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">File Limits</p>
                <p className="text-xs text-neutral-400">Max file size people can upload to your profile.</p>

                <div className="flex items-center gap-3">
                    {[5, 10, 25, 50].map((mb) => (
                        <button
                            key={mb}
                            onClick={() => setMaxFileMb(mb)}
                            className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                                maxFileMb === mb
                                    ? "bg-emerald-900 text-white"
                                    : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                            }`}
                        >
                            {mb}MB
                        </button>
                    ))}
                </div>

                <button
                    onClick={saveMaxFile}
                    disabled={saving}
                    className="w-full py-3 rounded-2xl bg-neutral-100 text-neutral-700 font-bold text-sm hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save Limit"}
                </button>
            </div>

            {/* TOAST */}
            {toast && (
                <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl text-sm font-bold shadow-lg z-50 ${
                    toast === "Saved" ? "bg-emerald-900 text-white" : "bg-red-500 text-white"
                }`}>
                    {toast}
                </div>
            )}

        </div>
    );
}
