// lib/qr/generate.ts
import QRCode from 'qrcode'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export function getPublicProfileUrl(username: string): string {
    return `${BASE_URL}/q/${username}`
}

export async function generateQRDataURL(username: string): Promise<string> {
    const url = getPublicProfileUrl(username)
    return QRCode.toDataURL(url, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 400,
        color: {
            dark: '#000000',
            light: '#ffffff',
        },
    })
}

export async function generateQRSVGString(username: string): Promise<string> {
    const url = getPublicProfileUrl(username)
    return QRCode.toString(url, {
        type: 'svg',
        errorCorrectionLevel: 'M',
        margin: 2,
    })
}