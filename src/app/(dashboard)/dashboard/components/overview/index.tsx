/**
 * FILE: src/app/(dashboard)/dashboard/components/overview/index.tsx
 */

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

type OverviewData = {
    username: string;
    qrUrl: string;
};

export default function Overview() {
    const [data, setData] = useState<OverviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadIdentity() {
            try {
                const supabase = createClient();

                const {
                    data: { user },
                    error: userError,
                } = await supabase.auth.getUser();

                if (userError || !user) {
                    setError("User not authenticated");
                    setLoading(false);
                    return;
                }

                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("username")
                    .eq("id", user.id)
                    .single();

                if (profileError || !profile?.username) {
                    setError("Profile not found");
                    setLoading(false);
                    return;
                }

                // Call QR API (only when needed)
                const res = await fetch("/api/qr/generate", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: profile.username,
                    }),
                });

                if (!res.ok) {
                    throw new Error("Failed to generate QR code");
                }

                const qr = await res.json();

                setData({
                    username: profile.username,
                    qrUrl: qr.qrDataURL,
                });

            } catch (err: any) {
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        }

        loadIdentity();
    }, []);

    if (loading) {
        return (
            <div className="animate-pulse h-64 bg-neutral-100 rounded-3xl" />
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-medium">
                {error}
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            <h1 className="text-3xl font-black tracking-tight text-emerald-950">
                Identity Code
            </h1>

            <p className="text-neutral-500 mt-2">
                Scan to connect instantly.
            </p>

            <div className="mt-8 bg-white border border-neutral-100 p-8 rounded-3xl shadow-sm inline-block">
                {data?.qrUrl && (
                    <Image
                        src={data.qrUrl}
                        alt="MyQ QR Code"
                        width={200}
                        height={200}
                        className="rounded-lg"
                    />
                )}

                <div className="mt-4 text-center">
                    <p className="font-bold text-lg">
                        @{data?.username}
                    </p>

                    <p className="text-xs text-neutral-400">
                        {process.env.NEXT_PUBLIC_APP_URL}/q/{data?.username}
                    </p>
                </div>
            </div>

            <div className="mt-8 flex gap-4">
                <button
                    onClick={() => {
                        if (!data?.qrUrl) return;

                        const link = document.createElement("a");
                        link.href = data.qrUrl;
                        link.download = "myq-qr.png";
                        link.click();
                    }}
                    className="bg-emerald-950 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-900 transition-colors"
                >
                    Download QR
                </button>

                <button
                    onClick={() => {
                        if (!data?.username) return;

                        const url = `${process.env.NEXT_PUBLIC_APP_URL}/q/${data.username}`;
                        navigator.clipboard.writeText(url);
                    }}
                    className="bg-neutral-100 text-neutral-900 px-6 py-3 rounded-xl font-bold hover:bg-neutral-200 transition-colors"
                >
                    Copy Link
                </button>
            </div>
        </div>
    );
}