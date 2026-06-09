// src/lib/files/storage.ts

/**
 * Converts a raw byte count into a clean, human-readable file size string.
 * e.g., 2548239 -> "2.4 MB"
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    // Calculate index position based on log math
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    // Return formatted string capped cleanly to 1 decimal place
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}