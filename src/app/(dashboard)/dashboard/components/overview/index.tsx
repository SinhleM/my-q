/**
 * FILE: src/app/(dashboard)/dashboard/components/overview/index.tsx
 */

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function Overview() {
    const [data, setData] = useState<{
        username: string;
        qrUrl: string;
    } | null>(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadIdentity() {
            const supabase = createClient();

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            const { data: profile } = await supabase
                .from("profiles")
                .select("username")
                .eq("id", user.id)
                .single();

            if (!profile?.username) {
                setLoading(false);
                return;
            }

            // CALL QR API (clean separation)
            const res = await fetch("/api/qr/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: profile.username,
                }),
            });

            const qr = await res.json();

            setData({
                username: profile.username,
                qrUrl: qr.qrDataURL,
            });

            setLoading(false);
        }

        loadIdentity();
    }, []);

    if (loading)
        return (
            <div className="animate-pulse h-64 bg-neutral-100 rounded-3xl" />
        );

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
                        myq.co.za/q/{data?.username}
                    </p>
                </div>
            </div>

            <div className="mt-8 flex gap-4">
                <button className="bg-emerald-950 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-900 transition-colors">
                    Download QR
                </button>

                <button className="bg-neutral-100 text-neutral-900 px-6 py-3 rounded-xl font-bold hover:bg-neutral-200 transition-colors">
                    Copy Link
                </button>
            </div>
        </div>
    );
}