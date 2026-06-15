"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, Camera, X, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ICON_PATHS, getAvatarPath } from "@/lib/avatar";

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
    avatar_index: number | null;
    avatar_url: string | null;
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

function AvatarPicker({
    profile,
    onSelect,
    onUpload,
    onClose,
}: {
    profile: Profile;
    onSelect: (index: number) => void;
    onUpload: (url: string) => void;
    onClose: () => void;
}) {
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");

    async function handleFile(file: File) {
        setUploading(true);
        setUploadError("");
        const ext = file.name.split(".").pop();
        const path = `avatars/${profile.id}/${Date.now()}.${ext}`;

        const { error } = await supabase.storage
            .from("user-files")
            .upload(path, file, { contentType: file.type, upsert: true });

        if (error) {
            setUploadError(error.message);
            setUploading(false);
            return;
        }

        const { data } = supabase.storage.from("user-files").getPublicUrl(path);
        onUpload(data.publicUrl);
        setUploading(false);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0">
            <div className="w-full max-w-sm bg-white rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <p className="font-black text-neutral-900 text-base">Choose your avatar</p>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                {/* 9 icon grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {ICON_PATHS.map((src, i) => {
                        const isActive = profile.avatar_index === i && !profile.avatar_url;
                        return (
                            <button
                                key={i}
                                onClick={() => onSelect(i)}
                                className={`relative rounded-2xl overflow-hidden aspect-square cursor-pointer transition-all ${
                                    isActive ? "ring-3 ring-emerald-900 scale-95" : "ring-2 ring-transparent hover:ring-emerald-300"
                                }`}
                            >
                                <Image src={src} alt={`Avatar option ${i + 1}`} fill className="object-cover" />
                            </button>
                        );
                    })}
                </div>

                {/* Upload own photo */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-sm py-3 rounded-2xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                    <Upload size={15} />
                    {uploading ? "Uploading..." : "Upload your own photo"}
                </button>
                {uploadError && <p className="text-xs text-red-500 mt-2">{uploadError}</p>}
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
    const [pickerOpen, setPickerOpen] = useState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { loadProfile(); }, []);

    async function loadProfile() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("profiles")
                .select("id,username,display_name,bio,email,phone,website,twitter,linkedin,instagram,avatar_index,avatar_url")
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

    function set(key: keyof Profile, value: string | number | null) {
        setProfile((p) => p ? { ...p, [key]: value } : p);
    }

    async function logout() {
        await supabase.auth.signOut();
        router.push("/");
    }

    async function handleAvatarSelect(index: number) {
        setPickerOpen(false);
        set("avatar_index", index);
        set("avatar_url", null);
        await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ avatar_index: index, avatar_url: null }),
        });
    }

    async function handleAvatarUpload(url: string) {
        setPickerOpen(false);
        set("avatar_url", url);
        set("avatar_index", null);
        await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ avatar_url: url, avatar_index: null }),
        });
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

        if (json.error) { setError(json.error); return; }

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

    // Resolve avatar to display
    const avatarSrc = profile.avatar_url
        ? profile.avatar_url
        : profile.avatar_index != null
            ? ICON_PATHS[profile.avatar_index]
            : getAvatarPath(profile.username);

    const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

    return (
        <>
            {pickerOpen && (
                <AvatarPicker
                    profile={profile}
                    onSelect={handleAvatarSelect}
                    onUpload={handleAvatarUpload}
                    onClose={() => setPickerOpen(false)}
                />
            )}

            <div className="space-y-4 pb-10">

                {/* HERO CARD */}
                <div className="bg-emerald-900 rounded-3xl px-6 pt-8 pb-6">
                    {/* Clickable avatar */}
                    <button
                        onClick={() => setPickerOpen(true)}
                        className="relative w-16 h-16 rounded-2xl overflow-hidden mb-4 group cursor-pointer shrink-0"
                    >
                        <Image src={avatarSrc} alt="Your avatar" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                            <Camera size={18} className="text-white" />
                        </div>
                    </button>

                    <p className="text-white font-black text-xl leading-tight">
                        {profile.display_name || profile.username}
                    </p>
                    <p className="text-emerald-400 text-sm mt-0.5">@{profile.username}</p>

                    <a
                        href={`/q/${profile.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 flex items-center justify-between bg-emerald-800 rounded-2xl px-4 py-3 hover:bg-emerald-700 transition-colors"
                    >
                        <span className="text-emerald-200 text-xs font-bold truncate">
                            {siteUrl}/q/{profile.username}
                        </span>
                        <span className="text-white font-black ml-2 shrink-0 text-base">→</span>
                    </a>
                </div>

                {/* IDENTITY */}
                <div className="bg-white rounded-3xl px-5 py-5 space-y-4">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Identity</p>
                    <Field label="Display Name" value={profile.display_name || ""} onChange={(v) => set("display_name", v)} placeholder="Your name" />
                    <Field label="Username" value={profile.username || ""} onChange={(v) => set("username", v.toLowerCase())} placeholder="yourname" prefix="@" />
                    <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Bio</label>
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
                    <Field label="Phone" value={profile.phone || ""} onChange={(v) => set("phone", v)} placeholder="+27 ..." type="tel" />
                    <Field label="Website" value={profile.website || ""} onChange={(v) => set("website", v)} placeholder="https://..." type="url" />
                </div>

                {/* SOCIALS */}
                <div className="bg-white rounded-3xl px-5 py-5 space-y-4">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Socials</p>
                    <Field label="X / Twitter" value={profile.twitter || ""} onChange={(v) => set("twitter", v.replace("@", ""))} placeholder="handle" prefix="@" />
                    <Field label="LinkedIn" value={profile.linkedin || ""} onChange={(v) => set("linkedin", v)} placeholder="your-linkedin" prefix="linkedin.com/in/" />
                    <Field label="Instagram" value={profile.instagram || ""} onChange={(v) => set("instagram", v.replace("@", ""))} placeholder="handle" prefix="@" />
                </div>

                {error && <p className="text-sm text-red-500 px-1">{error}</p>}

                <button
                    onClick={save}
                    disabled={saving}
                    className={`w-full py-4 rounded-2xl font-black text-sm transition-all ${
                        saved ? "bg-emerald-500 text-white" : "bg-emerald-900 text-white hover:bg-emerald-800"
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
        </>
    );
}
