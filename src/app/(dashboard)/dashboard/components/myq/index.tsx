"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, FileText, Share2, X, Copy, Check, QrCode } from "lucide-react";
import Image from "next/image";

type FileItem = {
    id: string;
    name: string;
    ext: string;
    size: string;
    uploaded: string;
    path: string;
    is_shared: boolean;
};

type QRState = {
    fileId: string;
    qrDataUrl: string;
    payloadUrl: string;
};

function formatSize(bytes: number): string {
    if (!bytes || bytes === 0) return "—";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function MYQShare() {
    const supabase = createClient();
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [authed, setAuthed] = useState(true);
    const [qr, setQr] = useState<QRState | null>(null);
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState("");

    async function loadFiles() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setAuthed(false);
            setLoading(false);
            return;
        }

        const { data } = await supabase
            .from("files")
            .select("id, file_name, file_size, storage_path, is_shared, created_at")
            .eq("owner_id", user.id)
            .is("deleted_at", null)
            .order("created_at", { ascending: false });

        setFiles(
            (data ?? []).map((f) => ({
                id: f.id as string,
                name: f.file_name as string,
                ext: (f.file_name as string).split(".").pop()?.toUpperCase() ?? "FILE",
                size: formatSize(f.file_size as number),
                uploaded: new Date(f.created_at as string).toLocaleDateString(),
                path: f.storage_path as string,
                is_shared: f.is_shared as boolean,
            }))
        );
        setLoading(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { loadFiles(); }, []);

    async function handleFileTap(file: FileItem) {
        // Toggle off
        if (qr?.fileId === file.id) {
            setQr(null);
            return;
        }

        setGeneratingId(file.id);
        setQr(null);
        setCopied(false);

        // Auto-enable sharing so the redirect route can serve it
        if (!file.is_shared) {
            await supabase.from("files").update({ is_shared: true }).eq("id", file.id);
            setFiles((prev) =>
                prev.map((f) => (f.id === file.id ? { ...f, is_shared: true } : f))
            );
        }

        try {
            const res = await fetch("/api/qr/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "file", id: file.id, destination: "whatsapp" }),
            });

            const data = await res.json();

            if (!res.ok || !data.qr) {
                showToast("QR generation failed");
                return;
            }

            setQr({ fileId: file.id, qrDataUrl: data.qr, payloadUrl: data.url });
        } catch {
            showToast("Something went wrong");
        } finally {
            setGeneratingId(null);
        }
    }

    async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setUploading(false); return; }

        const filePath = `${user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
            .from("user-files")
            .upload(filePath, file);

        if (uploadError) {
            showToast("Upload failed");
            setUploading(false);
            return;
        }

        await supabase.from("files").insert({
            owner_id: user.id,
            sender_id: user.id,
            storage_path: filePath,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            is_shared: false,
        });

        await loadFiles();
        setUploading(false);
        showToast("Uploaded — tap it to share");
    }

    function copyLink() {
        if (!qr) return;
        navigator.clipboard.writeText(qr.payloadUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function showToast(msg: string) {
        setToast(msg);
        setTimeout(() => setToast(""), 2500);
    }

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-[72px] bg-neutral-100 animate-pulse rounded-2xl" />
                ))}
            </div>
        );
    }

    if (!authed) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center mb-4">
                    <QrCode size={28} className="text-emerald-800" />
                </div>
                <p className="font-black text-xl text-neutral-900 mb-2">Sign in to use MYQ</p>
                <p className="text-sm text-neutral-400 mb-6 max-w-xs">
                    Tap any file to instantly generate a QR code. Scan it on any phone and WhatsApp opens with your file already attached.
                </p>
                <a
                    href="/login"
                    className="bg-emerald-900 text-white font-bold px-6 py-3.5 rounded-2xl text-sm hover:bg-emerald-800 transition-colors"
                >
                    Sign in →
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-10">

            {/* HERO */}
            <div className="bg-emerald-900 rounded-3xl px-6 pt-8 pb-6">
                <p className="text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">MYQ Share</p>
                <p className="text-white font-black text-2xl leading-tight">
                    Tap a file.<br />
                    <span className="text-emerald-400">WhatsApp opens.</span>
                </p>
                <p className="text-emerald-200/50 text-sm mt-2">
                    One tap → instant QR → scan → message sent. No steps.
                </p>

                <label
                    className={`mt-5 flex items-center justify-center gap-3 bg-emerald-800 hover:bg-emerald-700 transition-colors rounded-2xl py-4 cursor-pointer select-none ${uploading ? "opacity-60 pointer-events-none" : ""}`}
                >
                    <Upload size={16} className="text-white" />
                    <span className="text-white font-bold text-sm">
                        {uploading ? "Uploading..." : "Upload a file to share"}
                    </span>
                    <input type="file" className="hidden" onChange={uploadFile} disabled={uploading} />
                </label>
            </div>

            {/* How it works — shown only when no files selected */}
            {!qr && files.length > 0 && (
                <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                        <QrCode size={15} className="text-emerald-800" />
                    </div>
                    <p className="text-xs text-neutral-500 font-medium">
                        <span className="text-neutral-800 font-bold">Tap any file below</span> to instantly generate a WhatsApp QR code.
                    </p>
                </div>
            )}

            {/* FILE LIST */}
            <div className="space-y-2">
                {files.length === 0 ? (
                    <div className="bg-white rounded-3xl p-10 flex flex-col items-center text-center">
                        <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mb-3">
                            <FileText size={24} className="text-neutral-300" />
                        </div>
                        <p className="font-bold text-neutral-500 text-sm">No files yet</p>
                        <p className="text-xs text-neutral-400 mt-1">Upload a file above to get started</p>
                    </div>
                ) : (
                    files.map((file) => {
                        const isSelected = qr?.fileId === file.id;
                        const isGenerating = generatingId === file.id;
                        const isDisabled = !!generatingId && generatingId !== file.id;

                        return (
                            <div key={file.id} className="overflow-hidden rounded-2xl">

                                {/* File row */}
                                <button
                                    onClick={() => handleFileTap(file)}
                                    disabled={isDisabled}
                                    className={`w-full flex items-center gap-4 px-4 py-4 transition-all duration-200 cursor-pointer text-left
                                        ${isSelected
                                            ? "bg-emerald-900"
                                            : isDisabled
                                                ? "bg-white opacity-40"
                                                : "bg-white hover:bg-emerald-50 active:scale-[0.99]"
                                        }
                                        ${isSelected ? "" : "rounded-2xl"}
                                    `}
                                >
                                    {/* Extension badge */}
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-[11px] shrink-0
                                        ${isSelected ? "bg-emerald-700 text-white" : "bg-emerald-50 text-emerald-800"}
                                    `}>
                                        {file.ext.slice(0, 4)}
                                    </div>

                                    {/* Name + meta */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-bold text-sm truncate leading-snug
                                            ${isSelected ? "text-white" : "text-neutral-900"}
                                        `}>
                                            {file.name}
                                        </p>
                                        <p className={`text-[11px] mt-0.5
                                            ${isSelected ? "text-emerald-300/80" : "text-neutral-400"}
                                        `}>
                                            {file.size} · {file.uploaded}
                                        </p>
                                    </div>

                                    {/* Action indicator */}
                                    <div className="shrink-0 w-8 flex justify-center">
                                        {isGenerating ? (
                                            <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                        ) : isSelected ? (
                                            <X size={18} className="text-emerald-300" />
                                        ) : (
                                            <Share2 size={18} className="text-emerald-500" />
                                        )}
                                    </div>
                                </button>

                                {/* Inline QR panel — expands directly below the tapped file */}
                                {isSelected && qr && (
                                    <div className="bg-emerald-950 px-5 pb-6 pt-4">
                                        <div className="flex flex-col items-center">

                                            {/* QR code */}
                                            <div className="bg-white rounded-2xl p-4 shadow-xl">
                                                <Image
                                                    src={qr.qrDataUrl}
                                                    alt="WhatsApp share QR"
                                                    width={220}
                                                    height={220}
                                                    unoptimized
                                                    priority
                                                    className="block"
                                                />
                                            </div>

                                            {/* Label */}
                                            <div className="mt-4 text-center">
                                                <p className="text-white font-black text-base tracking-tight">
                                                    Scan to open WhatsApp
                                                </p>
                                                <p className="text-emerald-400/60 text-xs mt-1">
                                                    Your file link is already in the message
                                                </p>
                                            </div>

                                            {/* WhatsApp visual hint */}
                                            <div className="mt-4 w-full bg-emerald-900/60 rounded-xl px-4 py-3">
                                                <p className="text-[11px] text-emerald-300/70 font-bold uppercase tracking-wider mb-1">
                                                    Pre-filled message
                                                </p>
                                                <p className="text-emerald-200 text-xs leading-relaxed font-medium">
                                                    Hey 👋  I&apos;ve shared a file with you via MYQ:<br />
                                                    <span className="text-emerald-400 font-bold break-all">{qr.payloadUrl}</span>
                                                </p>
                                            </div>

                                            {/* Copy fallback */}
                                            <button
                                                onClick={copyLink}
                                                className="mt-3 w-full flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 rounded-xl transition-colors cursor-pointer"
                                            >
                                                {copied ? (
                                                    <>
                                                        <Check size={14} className="text-emerald-300" />
                                                        <span className="text-emerald-300">Link copied!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy size={14} />
                                                        Copy link instead
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 bg-emerald-950 text-white rounded-2xl text-sm font-bold shadow-lg z-50 whitespace-nowrap">
                    {toast}
                </div>
            )}
        </div>
    );
}
