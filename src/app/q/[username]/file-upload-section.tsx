"use client";

import { useRef, useState } from "react";
import { Upload, CheckCircle, XCircle, FileText } from "lucide-react";

export default function FileUploadSection({
    ownerUsername,
    maxFileMb,
}: {
    ownerUsername: string;
    maxFileMb: number;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<"success" | "error" | null>(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [fileName, setFileName] = useState("");

    async function upload(file: File) {
        if (file.size > maxFileMb * 1024 * 1024) {
            setResult("error");
            setErrorMsg(`File exceeds the ${maxFileMb}MB limit`);
            return;
        }
        setUploading(true);
        setResult(null);
        setErrorMsg("");
        setFileName(file.name);

        const form = new FormData();
        form.append("file", file);
        form.append("owner_username", ownerUsername);

        const res = await fetch("/api/public/upload", { method: "POST", body: form });
        const json = await res.json();
        setUploading(false);

        if (json.error) {
            setResult("error");
            setErrorMsg(json.error);
        } else {
            setResult("success");
        }
    }

    function handleFiles(files: FileList | null) {
        if (!files || files.length === 0) return;
        upload(files[0]);
    }

    return (
        <div className="bg-white rounded-3xl p-5">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                Send a file or document
            </p>

            {result === "success" ? (
                <div className="flex flex-col items-center py-6 text-center">
                    <CheckCircle size={36} className="text-emerald-600 mb-2" />
                    <p className="font-bold text-neutral-900 text-sm">Uploaded successfully</p>
                    <p className="text-xs text-neutral-400 mt-1 truncate max-w-[220px]">{fileName}</p>
                    <button
                        onClick={() => { setResult(null); setFileName(""); }}
                        className="mt-4 text-xs font-bold text-emerald-700 underline cursor-pointer"
                    >
                        Upload another
                    </button>
                </div>
            ) : (
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                    onClick={() => inputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl py-8 px-4 cursor-pointer transition-colors ${
                        dragging
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-neutral-200 hover:border-emerald-400 hover:bg-neutral-50"
                    }`}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
                        onChange={(e) => handleFiles(e.target.files)}
                    />

                    {uploading ? (
                        <>
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <FileText size={20} className="text-emerald-700 animate-pulse" />
                            </div>
                            <p className="text-sm font-bold text-neutral-600">Uploading...</p>
                            <p className="text-xs text-neutral-400 truncate max-w-[220px]">{fileName}</p>
                        </>
                    ) : (
                        <>
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <Upload size={20} className="text-emerald-700" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-neutral-700">Tap to upload</p>
                                <p className="text-xs text-neutral-400 mt-0.5">or drag and drop · max {maxFileMb}MB</p>
                            </div>
                        </>
                    )}
                </div>
            )}

            {result === "error" && (
                <div className="mt-3 flex items-start gap-2 bg-red-50 rounded-2xl px-4 py-3">
                    <XCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
                </div>
            )}
        </div>
    );
}
