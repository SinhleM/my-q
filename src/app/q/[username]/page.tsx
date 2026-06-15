import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Mail, Phone, Globe, FileText, AtSign, Link2, Camera } from "lucide-react";
import SaveContactButton from "./save-contact-button";
import FileUploadSection from "./file-upload-section";

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

    const { data: files } = await supabase
        .from("files")
        .select("*")
        .eq("owner_id", profile.id)
        .eq("is_shared", true)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

    // Only show public (untargeted) pending payment requests
    const { data: payments } = await supabase
        .from("payment_requests")
        .select("*")
        .eq("owner_id", profile.id)
        .eq("status", "pending")
        .is("payer_id", null)
        .or(`expires_at.is.null,expires_at.gt.now()`)
        .order("created_at", { ascending: false });

    const initials = (profile.display_name || profile.username)
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="min-h-screen bg-neutral-100">

            {/* HERO CARD */}
            <div className="bg-emerald-950 px-6 pt-14 pb-10 rounded-b-[2.5rem]">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-2xl bg-emerald-900 flex items-center justify-center mb-4">
                    <span className="text-white font-black text-xl">{initials}</span>
                </div>

                <h1 className="text-white text-2xl font-black leading-tight">
                    {profile.display_name || profile.username}
                </h1>
                <p className="text-emerald-400 text-sm mt-1">@{profile.username}</p>

                {profile.bio && (
                    <p className="text-emerald-200/70 text-sm mt-3 leading-relaxed">
                        {profile.bio}
                    </p>
                )}

                {/* Save contact CTA */}
                <div className="mt-6">
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

                {/* SOCIALS */}
                {(profile.twitter || profile.linkedin || profile.instagram) && (
                    <div className="bg-white rounded-3xl p-5 space-y-3">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Socials</p>
                        {profile.twitter && (
                            <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                                <span className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500"><AtSign size={16} /></span>
                                @{profile.twitter}
                            </a>
                        )}
                        {profile.linkedin && (
                            <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                                <span className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Link2 size={16} /></span>
                                {profile.linkedin}
                            </a>
                        )}
                        {profile.instagram && (
                            <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                                <span className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500"><Camera size={16} /></span>
                                @{profile.instagram}
                            </a>
                        )}
                    </div>
                )}

                {/* PAYMENT REQUESTS */}
                {payments && payments.length > 0 && profile.accept_payments && (
                    <div className="bg-white rounded-3xl p-5">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Pay</p>
                        <div className="space-y-3">
                            {payments.map((payment) => (
                                <a
                                    key={payment.id}
                                    href={`/payments/${payment.id}`}
                                    className="flex items-center justify-between bg-emerald-950 rounded-2xl px-4 py-3"
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
                {files && files.length > 0 && profile.accept_files && (
                    <div className="bg-white rounded-3xl p-5">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Files</p>
                        <div className="space-y-2">
                            {files.map((file) => (
                                <a
                                    key={file.id}
                                    href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/qr-files/${file.storage_path}`}
                                    target="_blank"
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

                <p className="text-center text-xs text-neutral-400 pt-2 pb-6">
                    Powered by MY-Q · <a href="/" className="underline">Get your own</a>
                </p>

            </div>
        </div>
    );
}
