import QRCode from "qrcode";

/**
 * Generates QR code for user profile
 */
export async function generateQRDataURL(username: string): Promise<string> {
    const host = process.env.NEXT_PUBLIC_APP_URL;

    if (!host) {
        throw new Error(
            "NEXT_PUBLIC_APP_URL is missing. Set it in Vercel environment variables."
        );
    }

    const publicProfileUrl = `${host}/q/${username}`;

    return await QRCode.toDataURL(publicProfileUrl, {
        width: 600,
        margin: 2,
        errorCorrectionLevel: "H",
        color: {
            dark: "#022c22",
            light: "#ffffff",
        },
    });
}