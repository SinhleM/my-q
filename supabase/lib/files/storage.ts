// lib/files/storage.ts
import { createServiceClient } from '@/lib/supabase/server'

const BUCKET = 'qr-files'

// storage path: {owner_id}/{uuid}-{filename}
export function buildStoragePath(ownerId: string, fileName: string): string {
    const uuid = crypto.randomUUID()
    const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    return `${ownerId}/${uuid}-${safe}`
}

export async function uploadFile(
    ownerId: string,
    file: File
): Promise<{ path: string; error: string | null }> {
    const supabase = createServiceClient()
    const path = buildStoragePath(ownerId, file.name)

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
            contentType: file.type || 'application/octet-stream',
            upsert: false,
        })

    if (error) return { path: '', error: error.message }
    return { path, error: null }
}

export async function getSignedDownloadUrl(
    storagePath: string,
    expiresInSeconds = 3600
): Promise<string | null> {
    const supabase = createServiceClient()
    const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(storagePath, expiresInSeconds)

    if (error || !data) return null
    return data.signedUrl
}

export async function deleteStorageFile(storagePath: string): Promise<boolean> {
    const supabase = createServiceClient()
    const { error } = await supabase.storage
        .from(BUCKET)
        .remove([storagePath])
    return !error
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}