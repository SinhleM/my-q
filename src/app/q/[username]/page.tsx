/**
 * FILE: src/app/q/[username]/page.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function QRProfilePage({
    params,
}: {
    params: { username: string };
}) {
    const supabase = await createClient();

    // 1. Fetch profile
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", params.username)
        .single();

    if (profileError || !profile) {
        return notFound();
    }

    // 2. Fetch ONLY shared files (public access layer)
    const { data: files } = await supabase
        .from("files")
        .select("*")
        .eq("owner_id", profile.id)
        .eq("is_shared", true)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

    // 3. Fetch ONLY active payment requests (public view)
    const { data: payments } = await supabase
        .from("payment_requests")
        .select("*")
        .eq("owner_id", profile.id)
        .eq("status", "pending")
        .or(`expires_at.is.null,expires_at.gt.now()`)
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen w-full bg-white flex flex-col items-center px-6 py-12">

            {/* ================= PROFILE CARD ================= */}
            <div className="w-full max-w-xl bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
                <h1 className="text-2xl font-extrabold text-neutral-900">
                    {profile.display_name || profile.username}
                </h1>

                <p className="text-sm text-neutral-500 mt-1">
                    @{profile.username}
                </p>

                {profile.bio && (
                    <p className="mt-4 text-neutral-700 text-sm leading-relaxed">
                        {profile.bio}
                    </p>
                )}

                {/* CONTACT INFO */}
                <div className="mt-6 grid gap-2 text-sm text-neutral-700">
                    {profile.email && <p>📧 {profile.email}</p>}
                    {profile.phone && <p>📱 {profile.phone}</p>}
                    {profile.website && <p>🌐 {profile.website}</p>}
                </div>

                {/* SOCIALS */}
                <div className="mt-4 flex gap-3 text-sm text-emerald-700">
                    {profile.twitter && <span>@{profile.twitter}</span>}
                    {profile.linkedin && <span>{profile.linkedin}</span>}
                    {profile.instagram && <span>@{profile.instagram}</span>}
                </div>
            </div>

            {/* ================= FILES ================= */}
            <div className="w-full max-w-xl mt-10">
                <h2 className="text-lg font-bold text-neutral-900 mb-4">
                    Shared Files
                </h2>

                {files && files.length > 0 ? (
                    <div className="space-y-3">
                        {files.map((file) => (
                            <a
                                key={file.id}
                                href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/qr-files/${file.storage_path}`}
                                target="_blank"
                                className="block p-4 border rounded-2xl hover:bg-neutral-50 transition"
                            >
                                <p className="font-medium text-neutral-900">
                                    {file.file_name}
                                </p>

                                <p className="text-xs text-neutral-500">
                                    {(Number(file.file_size) / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </a>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-neutral-500">
                        No shared files available
                    </p>
                )}
            </div>

            {/* ================= PAYMENTS ================= */}
            <div className="w-full max-w-xl mt-10">
                <h2 className="text-lg font-bold text-neutral-900 mb-4">
                    Payment Requests
                </h2>

                {payments && payments.length > 0 ? (
                    <div className="space-y-3">
                        {payments.map((payment) => (
                            <div
                                key={payment.id}
                                className="p-4 border rounded-2xl flex justify-between items-center"
                            >
                                <div>
                                    <p className="font-medium">
                                        {payment.description || "Payment request"}
                                    </p>

                                    <p className="text-xs text-neutral-500">
                                        R {payment.amount}
                                    </p>
                                </div>

                                <a
                                    href={`/payments/${payment.id}`}
                                    className="text-sm font-semibold text-emerald-700"
                                >
                                    Pay →
                                </a>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-neutral-500">
                        No payment requests
                    </p>
                )}
            </div>

        </div>
    );
}