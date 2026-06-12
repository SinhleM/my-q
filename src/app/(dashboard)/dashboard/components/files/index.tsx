/**
 * FILE: src/app/(dashboard)/dashboard/components/files/index.tsx
 */

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type FileItem = {
    id: string;
    name: string;
    size: string;
    uploaded: string;
    path: string;
};

export default function Files() {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const supabase = createClient();

    // -------------------------
    // LOAD FILES
    // -------------------------
    async function loadFiles() {
        setLoading(true);

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from("files")
            .select("*")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
            setLoading(false);
            return;
        }

        const formatted: FileItem[] =
            data?.map((file: any) => ({
                id: file.id,
                name: file.file_name, // FIXED
                size: `${(file.file_size / 1024 / 1024).toFixed(2)} MB`, // FIXED
                uploaded: new Date(file.created_at).toLocaleDateString(),
                path: file.storage_path, // FIXED
            })) || [];

        setFiles(formatted);
        setLoading(false);
    }

    useEffect(() => {
        loadFiles();
    }, []);

    // -------------------------
    // UPLOAD FILE
    // -------------------------
    async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setUploading(false);
            return;
        }

        const filePath = `${user.id}/${Date.now()}-${file.name}`;

        // 1. Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from("user-files")
            .upload(filePath, file);

        if (uploadError) {
            console.error(uploadError);
            setUploading(false);
            return;
        }

        // 2. Insert metadata into DB (FIXED SCHEMA)
        const { error: dbError } = await supabase.from("files").insert({
            owner_id: user.id,
            sender_id: user.id,
            storage_path: filePath, // FIXED
            file_name: file.name, // FIXED
            file_size: file.size, // FIXED (BIGINT in DB)
            mime_type: file.type,
            is_shared: false,
        });

        if (dbError) {
            console.error(dbError);
            setUploading(false);
            return;
        }

        // 3. Refresh list (NO PAGE RELOAD)
        await loadFiles();

        setUploading(false);
    }

    // -------------------------
    // DOWNLOAD FILE
    // -------------------------
    async function downloadFile(path: string) {
        const { data } = await supabase.storage
            .from("user-files")
            .createSignedUrl(path, 60);

        if (data?.signedUrl) {
            window.open(data.signedUrl, "_blank");
        }
    }

    // -------------------------
    // UI STATES
    // -------------------------
    if (loading) {
        return (
            <div className="h-40 animate-pulse bg-neutral-100 rounded-3xl" />
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            <h1 className="text-2xl md:text-3xl font-black text-emerald-950">
                Files & Documents
            </h1>

            <p className="text-neutral-500 mt-2 text-sm md:text-base">
                Manage your secure documents stored on MyQ.
            </p>

            {/* Upload Section */}
            <label className="mt-8 block border-2 border-dashed border-neutral-200 rounded-3xl p-10 text-center hover:border-emerald-500 cursor-pointer bg-neutral-50 transition-colors">
                <p className="font-bold text-neutral-600 hover:text-emerald-900">
                    {uploading ? "Uploading..." : "Click to upload or drag & drop"}
                </p>

                <p className="text-xs text-neutral-400 mt-1">
                    PDF, PNG, JPG up to 5MB
                </p>

                <input
                    type="file"
                    className="hidden"
                    onChange={uploadFile}
                    disabled={uploading}
                />
            </label>

            {/* File List */}
            <div className="mt-8 space-y-3">
                {files.length === 0 ? (
                    <p className="text-sm text-neutral-400">
                        No files uploaded yet.
                    </p>
                ) : (
                    files.map((file) => (
                        <div
                            key={file.id}
                            className="flex items-center justify-between p-4 bg-white border border-neutral-100 rounded-2xl shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-900 font-bold text-xs">
                                    {file.name.split(".").pop()?.toUpperCase()}
                                </div>

                                <div>
                                    <p className="font-bold text-emerald-950 text-sm">
                                        {file.name}
                                    </p>
                                    <p className="text-[10px] text-neutral-400">
                                        {file.uploaded} • {file.size}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => downloadFile(file.path)}
                                className="text-emerald-700 text-xs font-bold hover:underline"
                            >
                                Download
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}