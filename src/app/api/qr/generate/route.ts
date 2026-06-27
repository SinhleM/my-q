import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { createMyQPayload } from "@/lib/myq/payload";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // MYQ payload flow — file/contact/card share
        if (body.type && body.id && body.destination) {
            const { payloadUrl } = createMyQPayload({
                type: body.type,
                id: body.id,
                destination: body.destination,
            });

            const qr = await QRCode.toDataURL(payloadUrl, {
                width: 600,
                margin: 2,
                errorCorrectionLevel: "H",
                color: {
                    dark: "#022c22",
                    light: "#ffffff",
                },
            });

            return NextResponse.json({ qr, url: payloadUrl });
        }

        // Profile QR flow — existing behaviour
        const { username } = body;

        if (!username) {
            return NextResponse.json(
                { error: "username or (type + id + destination) required" },
                { status: 400 }
            );
        }

        const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL ||
            process.env.NEXT_PUBLIC_SITE_URL ||
            "http://localhost:3000";

        const url = `${baseUrl}/q/${username}`;

        const qrDataURL = await QRCode.toDataURL(url, {
            width: 600,
            margin: 2,
            errorCorrectionLevel: "H",
            color: {
                dark: "#022c22",
                light: "#ffffff",
            },
        });

        return NextResponse.json({ qrDataURL, url });
    } catch (err) {
        console.error("QR generation error:", err);
        return NextResponse.json(
            { error: "QR generation failed" },
            { status: 500 }
        );
    }
}
