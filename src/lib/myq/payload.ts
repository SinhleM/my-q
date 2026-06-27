export type MyQPayloadType = "file" | "contact" | "card";
export type MyQDestination = "whatsapp";

export function createMyQPayload({
    type,
    id,
}: {
    type: MyQPayloadType;
    id: string;
    destination: MyQDestination;
}): { payloadUrl: string; qrValue: string } {
    // Prefer the canonical public URL so QR codes work on phones (not localhost)
    const baseUrl = (
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")
        || process.env.NEXT_PUBLIC_APP_URL
    );

    if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_APP_URL must be set");
    }

    const payloadUrl = `${baseUrl}/api/myq/${type}/${id}`;

    return {
        payloadUrl,
        qrValue: payloadUrl,
    };
}
