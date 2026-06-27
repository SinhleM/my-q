import { createClient, createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Mail, Phone, Globe, FileText } from "lucide-react";
import { getAvatarPath } from "@/lib/avatar";
import SaveContactButton from "./save-contact-button";
import FileUploadSection from "./file-upload-section";
import SocialsDropdown from "./socials-dropdown";

export default async function QRProfilePage({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;
    const supabase = await createClient();

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

    if (profileError || !profile) return notFound();

    const serviceClient = createServiceClient();

    const { data: rawFiles } = await supabase
        .from("files")
        .select("id, storage_path, file_name, file_size, created_at")
        .eq("owner_id", profile.id)
        .eq("is_shared", true)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

    // Generate signed URLs so file downloads work whether the bucket is public or private
    const storagePaths = (rawFiles ?? []).map((f) => f.storage_path as string);
    const { data: signedData } = storagePaths.length
        ? await serviceClient.storage.from("user-files").createSignedUrls(storagePaths, 3600)
        : { data: [] };

    const signedUrlMap = new Map(
        (signedData ?? []).map((s: { path: string; signedUrl: string | Record<string, never> }) => [
            s.path,
            typeof s.signedUrl === "string" ? s.signedUrl : null,
        ])
    );

    const files = (rawFiles ?? []).map((f) => ({
        ...f,
        signedUrl: (signedUrlMap.get(f.storage_path as string) ?? null) as string | null,
    }));

    // C-4: use service client filtered by owner — avoids the overly broad RLS policy
    const { data: payments } = await serviceClient
        .from("payment_requests")
        .select("id, description, amount")
        .eq("owner_id", profile.id)
        .eq("status", "pending")
        .is("payer_id", null)
        .or(`expires_at.is.null,expires_at.gt.now()`)
        .order("created_at", { ascending: false });

    const avatarPath = getAvatarPath(profile.username);

    return (
        <div className="min-h-screen bg-neutral-100">

            {/* HERO CARD */}
            <div className="bg-emerald-900 px-6 pt-14 pb-10 rounded-b-[2.5rem] flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-2xl overflow-hidden mb-4 ring-4 ring-white/10">
                    <Image
                        src={avatarPath}
                        alt={profile.display_name || profile.username}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                    />
                </div>

                <h1 className="text-white text-2xl font-black leading-tight">
                    {profile.display_name || profile.username}
                </h1>
                <p className="text-emerald-400 text-sm mt-1">@{profile.username}</p>

                {profile.bio && (
                    <p className="text-emerald-200/70 text-sm mt-3 leading-relaxed max-w-xs">
                        {profile.bio}
                    </p>
                )}

                <div className="mt-6 w-full max-w-xs">
                    <SaveContactButton
                        displayName={profile.display_name || profile.username}
                        username={profile.username}
                        email={profile.email}
                        phone={profile.phone}
                        website={profile.website}
                        twitter={profile.twitter}
                        linkedin={profile.linkedin}
                        instagram={profile.instagram}
                        bio={profile.bio}
                    />
                </div>
            </div>

            <div className="px-5 py-6 space-y-4 max-w-lg mx-auto">

                {/* CONTACT DETAILS */}
                {(profile.email || profile.phone || profile.website) && (
                    <div className="bg-white rounded-3xl p-5 space-y-3">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Contact</p>
                        {profile.email && (
                            <a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                                <span className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700"><Mail size={16} /></span>
                                {profile.email}
                            </a>
                        )}
                        {profile.phone && (
                            <a href={`tel:${profile.phone}`} className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                                <span className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700"><Phone size={16} /></span>
                                {profile.phone}
                            </a>
                        )}
                        {profile.website && (
                            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                                <span className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700"><Globe size={16} /></span>
                                {profile.website.replace(/^https?:\/\//, "")}
                            </a>
                        )}
                    </div>
                )}

                {/* SOCIALS — collapsible dropdown */}
                <SocialsDropdown
                    twitter={profile.twitter}
                    linkedin={profile.linkedin}
                    instagram={profile.instagram}
                />

                {/* PAYMENT REQUESTS */}
                {payments && payments.length > 0 && profile.accept_payments && (
                    <div className="bg-white rounded-3xl p-5">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Pay</p>
                        <div className="space-y-3">
                            {payments.map((payment: { id: string; description: string | null; amount: number }) => (
                                <a
                                    key={payment.id}
                                    href={`/payments/${payment.id}`}
                                    className="flex items-center justify-between bg-emerald-900 rounded-2xl px-4 py-3"
                                >
                                    <div>
                                        <p className="text-white font-bold text-sm">{payment.description || "Payment request"}</p>
                                        <p className="text-emerald-400 text-xs mt-0.5">R {payment.amount}</p>
                                    </div>
                                    <span className="text-emerald-400 font-black text-lg">→</span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* FILES */}
                {files && files.length > 0 && (
                    <div className="bg-white rounded-3xl p-5">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Files</p>
                        <div className="space-y-2">
                            {files.map((file) => (
                                <a
                                    key={file.id}
                                    href={file.signedUrl ?? "#"}
                                    target="_blank"
                                    download={file.file_name}
                                    className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                                >
                                    <span className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0"><FileText size={16} /></span>
                                    <div className="min-w-0">
                                        <p className="font-medium text-neutral-900 text-sm truncate">{file.file_name}</p>
                                        <p className="text-xs text-neutral-400">{(Number(file.file_size) / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* FILE UPLOAD */}
                {profile.accept_files && (
                    <FileUploadSection
                        ownerUsername={profile.username}
                        maxFileMb={profile.max_file_size_mb ?? 25}
                    />
                )}

                {/* CTA Footer */}
                <div className="pt-2 pb-8 flex flex-col items-center gap-1 text-center">
                    <a
                        href="/register"
                        className="text-neutral-900 font-black text-base tracking-tight hover:text-emerald-900 transition-colors"
                    >
                        Get your own MY-Q profile →
                    </a>
                    <p className="text-xs text-neutral-400">Share files, contacts &amp; payments from one link. Free.</p>
                    <p className="text-[11px] text-neutral-300 mt-1">Powered by MY-Q</p>
                </div>

            </div>
        </div>
    );
}
