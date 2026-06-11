/**
 * FILE: src/app/api/qr/generate/route.ts
 */

import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function POST(req: NextRequest) {
    try {
        const { username } = await req.json();

        if (!username) {
            return NextResponse.json(
                { error: "Username required" },
                { status: 400 }
            );
        }

        const baseUrl =
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

        const url = `${baseUrl}/q/${username}`;

        const qrDataURL = await QRCode.toDataURL(url, {
            width: 300,
            margin: 2,
        });

        return NextResponse.json({
            qrDataURL,
            url,
        });
    } catch (err) {
        return NextResponse.json(
            { error: "QR generation failed" },
            { status: 500 }
        );
    }
}