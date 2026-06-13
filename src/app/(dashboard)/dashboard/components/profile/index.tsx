"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
    id: string;
    username: string;
    display_name: string;
    bio: string;
    email: string;
    phone: string;
    website: string;
    twitter: string;
    linkedin: string;
    instagram: string;
};

function Field({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    prefix,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
    prefix?: string;
}) {
    return (
        <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                {label}
            </label>
            <div className={`flex items-center bg-neutral-100 rounded-2xl px-4 py-3 ${prefix ? "gap-1" : ""}`}>
                {prefix && <span className="text-neutral-400 text-sm font-medium shrink-0">{prefix}</span>}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="bg-transparent flex-1 text-sm text-neutral-900 font-medium outline-none placeholder:text-neutral-400 min-w-0"
                />
            </div>
        </div>
    );
}

export default function Profile() {
    const supabase = createClient();
    const router = useRouter();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from("profiles")
                    .select("id,username,display_name,bio,email,phone,website,twitter,linkedin,instagram")
                    .eq("id", user.id)
                    .single();

                if (error) throw error;
                setProfile(data as Profile);
            } catch (e) {
                console.error("Profile load error:", e);
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function set(key: keyof Profile, value: string) {
        setProfile((p) => p ? { ...p, [key]: value } : p);
    }

    async function logout() {
        await supabase.auth.signOut();
        router.push("/");
    }

    async function save() {
        if (!profile) return;
        setSaving(true);
        setError("");

        const res = await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: profile.username,
                display_name: profile.display_name,
                bio: profile.bio,
                phone: profile.phone,
                website: profile.website,
                twitter: profile.twitter,
                linkedin: profile.linkedin,
                instagram: profile.instagram,
            }),
        });

        const json = await res.json();
        setSaving(false);

        if (json.error) {
            setError(json.error);
            return;
        }

        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-40 bg-neutral-100 animate-pulse rounded-3xl" />
                <div className="h-64 bg-neutral-100 animate-pulse rounded-3xl" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="bg-red-50 rounded-2xl p-5 text-sm text-red-600 font-medium">
                Could not load your profile. Please refresh the page.
            </div>
        );
    }

    const initials = (profile.display_name || profile.username)
        .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

    const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

    return (
        <div className="space-y-4 pb-10">

            {/* HERO CARD */}
            <div className="bg-emerald-900 rounded-3xl px-6 pt-8 pb-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-900 flex items-center justify-center mb-4">
                    <span className="text-white font-black text-lg">{initials}</span>
                </div>
                <p className="text-white font-black text-xl leading-tight">
                    {profile.display_name || profile.username}
                </p>
                <p className="text-emerald-400 text-sm mt-0.5">@{profile.username}</p>

                <a
                    href={`/q/${profile.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 flex items-center justify-between bg-emerald-900 rounded-2xl px-4 py-3"
                >
                    <span className="text-emerald-300 text-xs font-bold truncate">
                        {siteUrl}/q/{profile.username}
                    </span>
                    <span className="text-emerald-400 ml-2 shrink-0">→</span>
                </a>
            </div>

            {/* IDENTITY */}
            <div className="bg-white rounded-3xl px-5 py-5 space-y-4">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Identity</p>

                <Field
                    label="Display Name"
                    value={profile.display_name || ""}
                    onChange={(v) => set("display_name", v)}
                    placeholder="Your name"
                />

                <Field
                    label="Username"
                    value={profile.username || ""}
                    onChange={(v) => set("username", v.toLowerCase())}
                    placeholder="yourname"
                    prefix="@"
                />

                <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                        Bio
                    </label>
                    <textarea
                        value={profile.bio || ""}
                        onChange={(e) => set("bio", e.target.value)}
                        placeholder="Tell people who you are..."
                        rows={3}
                        className="w-full bg-neutral-100 rounded-2xl px-4 py-3 text-sm text-neutral-900 font-medium outline-none placeholder:text-neutral-400 resize-none"
                    />
                </div>
            </div>

            {/* CONTACT */}
            <div className="bg-white rounded-3xl px-5 py-5 space-y-4">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Contact</p>

                <Field
                    label="Phone"
                    value={profile.phone || ""}
                    onChange={(v) => set("phone", v)}
                    placeholder="+27 ..."
                    type="tel"
                />

                <Field
                    label="Website"
                    value={profile.website || ""}
                    onChange={(v) => set("website", v)}
                    placeholder="https://..."
                    type="url"
                />
            </div>

            {/* SOCIALS */}
            <div className="bg-white rounded-3xl px-5 py-5 space-y-4">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Socials</p>

                <Field
                    label="X / Twitter"
                    value={profile.twitter || ""}
                    onChange={(v) => set("twitter", v.replace("@", ""))}
                    placeholder="handle"
                    prefix="@"
                />

                <Field
                    label="LinkedIn"
                    value={profile.linkedin || ""}
                    onChange={(v) => set("linkedin", v)}
                    placeholder="your-linkedin"
                    prefix="linkedin.com/in/"
                />

                <Field
                    label="Instagram"
                    value={profile.instagram || ""}
                    onChange={(v) => set("instagram", v.replace("@", ""))}
                    placeholder="handle"
                    prefix="@"
                />
            </div>

            {/* SAVE */}
            {error && (
                <p className="text-sm text-red-500 px-1">{error}</p>
            )}

            <button
                onClick={save}
                disabled={saving}
                className={`w-full py-4 rounded-2xl font-black text-sm transition-all ${
                    saved
                        ? "bg-emerald-500 text-white"
                        : "bg-emerald-900 text-white hover:bg-emerald-800"
                } disabled:opacity-50`}
            >
                {saved ? "Saved" : saving ? "Saving..." : "Save Profile"}
            </button>

            <button
                onClick={logout}
                className="w-full py-4 rounded-2xl font-bold text-sm text-red-500 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
                <LogOut size={15} />
                Log out
            </button>

        </div>
    );
}
