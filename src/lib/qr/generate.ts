// src/lib/qr/generate.ts
import QRCode from "qrcode";

/**
 * Generates a clean, high-contrast QR code base64 Data URL for a user's public profile link.
 * Tailored with dark forest green pixels matching the platform's brand framework.
 */
export async function generateQRDataURL(username: string): Promise<string> {
    // Construct the absolute deployment route URL path
    const host = process.env.NEXT_PUBLIC_APP_URL || "https://myq.co.za";
    const publicProfileUrl = `${host}/q/${username}`;

    try {
        const dataUrl = await QRCode.toDataURL(publicProfileUrl, {
            width: 600,
            margin: 2,
            errorCorrectionLevel: "H",
            color: {
                dark: "#022c22",  // Your emerald-950 forest green value
                light: "#ffffff", // Pure crisp white background
            },
        });
        return dataUrl;
    } catch (error) {
        console.error("Failed to generate profile identification QR string:", error);
        throw new Error("QR Generation engine failure");
    }
}