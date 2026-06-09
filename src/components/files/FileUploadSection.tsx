// components/files/FileUploadSection.tsx
'use client'

import { useRef, useState } from 'react'
import { formatFileSize } from '@/lib/files/storage'

type SharedFile = {
    id: string
    file_name: string
    file_size: number
    mime_type: string | null
}

export default function FileUploadSection({
    ownerUsername,
    sharedFiles,
}: {
    ownerUsername: string
    sharedFiles: SharedFile[]
}) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [done, setDone] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        setError(null)
        setDone(false)

        const formData = new FormData()
        formData.append('file', file)
        formData.append('owner_username', ownerUsername)

        const res = await fetch('/api/files/upload', { method: 'POST', body: formData })
        const data = await res.json()

        setUploading(false)

        if (data.error) {
            setError(data.error)
        } else {
            setDone(true)
        }
    }

    async function handleDownload(fileId: string) {
        const res = await fetch(`/api/files/${fileId}`)
        const data = await res.json()
        if (data.data?.url) window.open(data.data.url, '_blank')
    }

    return (
        <section className="flex flex-col gap-4">
            <h2 className="text-xs text-gray-400 uppercase tracking-wide">Files</h2>

            {/* Upload */}
            <div
                onClick={() => inputRef.current?.click()}
                className="border border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-brand transition-colors"
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    onChange={handleUpload}
                />
                {uploading ? (
                    <p className="text-sm text-gray-400">Uploading…</p>
                ) : done ? (
                    <p className="text-sm text-brand">File sent ✓</p>
                ) : (
                    <>
                        <p className="text-sm text-gray-500">Tap to send a file</p>
                        <p className="text-xs text-gray-300 mt-1">Any format accepted</p>
                    </>
                )}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Shared files available for download */}
            {sharedFiles.length > 0 && (
                <div className="flex flex-col gap-2">
                    <p className="text-xs text-gray-400">Available to download</p>
                    {sharedFiles.map(f => (
                        <div
                            key={f.id}
                            className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3"
                        >
                            <div className="min-w-0">
                                <p className="text-sm truncate">{f.file_name}</p>
                                <p className="text-xs text-gray-400">{formatFileSize(f.file_size)}</p>
                            </div>
                            <button
                                onClick={() => handleDownload(f.id)}
                                className="text-xs text-brand hover:underline shrink-0 ml-4"
                            >
                                Download
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}