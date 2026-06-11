/**
 * FILE: src/components/files/FileUploadSection.tsx
 */

"use client";

import { useState } from "react";

export default function FileUploadSection({
    ownerId,
}: {
    ownerId: string;
}) {
    const [uploading, setUploading] = useState(false);

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("ownerId", ownerId);

        setUploading(true);

        const res = await fetch("/api/files/upload", {
            method: "POST",
            body: formData,
        });

        setUploading(false);

        if (!res.ok) {
            alert("Upload failed");
            return;
        }

        alert("File uploaded successfully");
        window.location.reload();
    }

    return (
        <div className="p-4 border rounded-2xl">
            <input type="file" onChange={handleUpload} />

            {uploading && (
                <p className="text-sm text-neutral-500 mt-2">
                    Uploading...
                </p>
            )}
        </div>
    );
}