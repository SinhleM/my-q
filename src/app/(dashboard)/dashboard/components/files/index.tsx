"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, FolderOpen, Download, Trash2 } from "lucide-react";

type FileItem = {
    id: string;
    name: string;
    ext: string;
    size: string;
    uploaded: string;
    path: string;
    is_shared: boolean;
};

export default function Files() {
    const supabase = createClient();
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState("");

    useEffect(() => { loadFiles(); }, []);

    async function loadFiles() {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data } = await supabase
            .from("files")
            .select("*")
            .eq("owner_id", user.id)
            .is("deleted_at", null)
            .order("created_at", { ascending: false });

        setFiles(
            (data ?? []).map((f: any) => ({
                id: f.id,
                name: f.file_name,
                ext: f.file_name.split(".").pop()?.toUpperCase() ?? "FILE",
                size: `${(f.file_size / 1024 / 1024).toFixed(2)} MB`,
                uploaded: new Date(f.created_at).toLocaleDateString(),
                path: f.storage_path,
                is_shared: f.is_shared,
            }))
        );
        setLoading(false);
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
        showToast("Uploaded");
    }

    async function toggleShared(fileId: string, current: boolean) {
        await supabase.from("files").update({ is_shared: !current }).eq("id", fileId);
        setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, is_shared: !current } : f));
    }

    async function downloadFile(path: string) {
        const { data } = await supabase.storage.from("user-files").createSignedUrl(path, 60);
        if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    }

    async function deleteFile(fileId: string, path: string) {
        await supabase.from("files").update({ deleted_at: new Date().toISOString() }).eq("id", fileId);
        await supabase.storage.from("user-files").remove([path]);
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
        showToast("Deleted");
    }

    function showToast(msg: string) {
        setToast(msg);
        setTimeout(() => setToast(""), 2000);
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-40 bg-neutral-100 animate-pulse rounded-3xl" />
                <div className="h-48 bg-neutral-100 animate-pulse rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-10">

            {/* HERO — upload zone */}
            <div className="bg-emerald-900 rounded-3xl px-6 pt-8 pb-6">
                <p className="text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">Files & Documents</p>
                <p className="text-white font-black text-xl">Your secure storage</p>
                <p className="text-emerald-200/60 text-sm mt-1">{files.length} file{files.length !== 1 ? "s" : ""} stored</p>

                <label className={`mt-5 flex items-center justify-center gap-3 bg-emerald-800 hover:bg-emerald-700 transition-colors rounded-2xl py-4 cursor-pointer ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
                    <Upload size={18} className="text-white" />
                    <span className="text-white font-bold text-sm">
                        {uploading ? "Uploading..." : "Upload a file"}
                    </span>
                    <input type="file" className="hidden" onChange={uploadFile} disabled={uploading} />
                </label>
            </div>

            {/* FILE LIST */}
            <div className="bg-white rounded-3xl px-5 py-5">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Your Files</p>

                {files.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-center">
                        <FolderOpen size={40} className="text-neutral-300 mb-3" />
                        <p className="text-sm font-bold text-neutral-500">No files yet</p>
                        <p className="text-xs text-neutral-400 mt-1">Upload a file above to get started</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {files.map((file) => (
                            <div key={file.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-2xl">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-800 font-black text-xs shrink-0">
                                    {file.ext.slice(0, 4)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-neutral-900 text-sm truncate">{file.name}</p>
                                    <p className="text-[10px] text-neutral-400 mt-0.5">{file.uploaded} · {file.size}</p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => toggleShared(file.id, file.is_shared)}
                                        className={`text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer transition-colors ${
                                            file.is_shared
                                                ? "bg-emerald-100 text-emerald-700"
                                                : "bg-neutral-200 text-neutral-500"
                                        }`}
                                        title={file.is_shared ? "Visible on your QR page — click to hide" : "Hidden — click to share publicly"}
                                    >
                                        {file.is_shared ? "Shared" : "Private"}
                                    </button>
                                    <button
                                        onClick={() => downloadFile(file.path)}
                                        className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
                                        title="Download"
                                    >
                                        <Download size={15} />
                                    </button>
                                    <button
                                        onClick={() => deleteFile(file.id, file.path)}
                                        className="text-neutral-300 hover:text-red-500 cursor-pointer transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* TOAST */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 bg-emerald-950 text-white rounded-2xl text-sm font-bold shadow-lg z-50">
                    {toast}
                </div>
            )}
        </div>
    );
}
