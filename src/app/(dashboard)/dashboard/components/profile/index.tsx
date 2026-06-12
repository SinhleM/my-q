/**
 * FILE: src/app/(dashboard)/dashboard/components/profile/index.tsx
 */

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Profile() {
    const supabase = createClient();

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        setProfile(data);
        setLoading(false);
    }

    async function updateProfile() {
        await supabase
            .from("profiles")
            .update({
                display_name: profile.display_name,
                bio: profile.bio,
                phone: profile.phone,
                email: profile.email,
            })
            .eq("id", profile.id);

        alert("Profile updated");
    }

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-black text-emerald-950">
                Profile
            </h1>

            <input
                className="w-full border p-2 rounded-xl"
                value={profile.display_name || ""}
                onChange={(e) =>
                    setProfile({ ...profile, display_name: e.target.value })
                }
                placeholder="Display Name"
            />

            <textarea
                className="w-full border p-2 rounded-xl"
                value={profile.bio || ""}
                onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                }
                placeholder="Bio"
            />

            <button
                onClick={updateProfile}
                className="bg-emerald-950 text-white px-4 py-2 rounded-xl"
            >
                Save Profile
            </button>

            <div className="pt-4 text-sm text-neutral-500">
                Public Link:
                <br />
                myq.co.za/q/{profile.username}
            </div>
        </div>
    );
}