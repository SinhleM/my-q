/**
 * FILE: src/app/(dashboard)/profile/page.tsx
 */

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
    id: string;
    username: string;
    display_name: string | null;
    bio: string | null;
    phone: string | null;
    website: string | null;
    twitter: string | null;
    linkedin: string | null;
    instagram: string | null;
};

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            const supabase = createClient();

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (!error && data) {
                setProfile(data as Profile);
            }

            setLoading(false);
        }

        loadProfile();
    }, []);

    if (loading) {
        return (
            <div className="p-6">
                <div className="h-6 w-40 bg-neutral-200 rounded animate-pulse" />
                <div className="mt-6 space-y-3">
                    <div className="h-20 bg-neutral-100 rounded-2xl animate-pulse" />
                    <div className="h-20 bg-neutral-100 rounded-2xl animate-pulse" />
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="p-6 text-neutral-500">
                No profile found. Please sign in again.
            </div>
        );
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-neutral-900">
                Profile
            </h1>
            <p className="text-neutral-500 mt-1">
                Manage your QR identity information.
            </p>

            <div className="mt-8 space-y-4">
                <div className="border rounded-2xl p-5 bg-white shadow-sm">
                    <p className="text-sm text-neutral-500">Username</p>
                    <p className="font-semibold">@{profile.username}</p>
                </div>

                <div className="border rounded-2xl p-5 bg-white shadow-sm">
                    <p className="text-sm text-neutral-500">
                        Display Name
                    </p>
                    <p className="font-semibold">
                        {profile.display_name ?? "Not set"}
                    </p>
                </div>

                <div className="border rounded-2xl p-5 bg-white shadow-sm">
                    <p className="text-sm text-neutral-500">Bio</p>
                    <p className="text-sm">
                        {profile.bio ?? "No bio yet"}
                    </p>
                </div>

                <div className="border rounded-2xl p-5 bg-white shadow-sm">
                    <p className="text-sm text-neutral-500">Contact</p>
                    <div className="text-sm space-y-1 mt-2">
                        <p>Phone: {profile.phone ?? "-"}</p>
                        <p>Website: {profile.website ?? "-"}</p>
                    </div>
                </div>

                <div className="border rounded-2xl p-5 bg-white shadow-sm">
                    <p className="text-sm text-neutral-500">
                        Social Links
                    </p>
                    <div className="text-sm space-y-1 mt-2">
                        <p>Twitter: {profile.twitter ?? "-"}</p>
                        <p>LinkedIn: {profile.linkedin ?? "-"}</p>
                        <p>Instagram: {profile.instagram ?? "-"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}