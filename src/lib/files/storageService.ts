/**
 * FILE: src/lib/files/storageService.ts
 */

import { createClient } from "@/lib/supabase/client";

/**
 * Deletes a file from Supabase Storage
 */
export async function deleteStorageFile(path: string) {
    const supabase = createClient();

    const { error } = await supabase.storage
        .from("qr-files")
        .remove([path]);

    if (error) throw error;
}

/**
 * Generates a signed download URL
 */
export async function getSignedDownloadUrl(path: string, expiresIn = 60) {
    const supabase = createClient();

    const { data, error } = await supabase.storage
        .from("qr-files")
        .createSignedUrl(path, expiresIn);

    if (error) throw error;

    return data.signedUrl;
}