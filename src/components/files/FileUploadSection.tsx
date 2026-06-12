/**
 * FILE: src/components/files/FileUploadSection.tsx
 */

"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";

export default function FileUploadSection({
    ownerId,
    onUploadComplete,
}: {
    ownerId: string;
    onUploadComplete?: () => void;
}) {
    const [uploading, setUploading] = useState(false);
    const { showToast } = useToast();

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        showToast("Uploading file...", "info");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("ownerId", ownerId);

        try {
            const res = await fetch("/api/files/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                showToast(data?.error || "Upload failed", "error");
                return;
            }

            showToast("File uploaded successfully 🎉", "success");

            // refresh file list WITHOUT reload
            onUploadComplete?.();

        } catch (err) {
            showToast("Network error during upload", "error");
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="p-4 border rounded-2xl bg-white">
            <input type="file" onChange={handleUpload} />

            {uploading && (
                <p className="text-sm text-neutral-500 mt-2">
                    Uploading...
                </p>
            )}
        </div>
    );
}