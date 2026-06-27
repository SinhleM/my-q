import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { buildWhatsAppLink, buildWhatsAppMessageForFile } from "@/lib/transports";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    const { type, id } = await params;
    const supabase = createServiceClient();

    if (type === "file") {
        const { data: file, error } = await supabase
            .from("files")
            .select("id, file_name, storage_path, is_shared")
            .eq("id", id)
            .is("deleted_at", null)
            .single();

        if (error || !file) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        if (!file.is_shared) {
            return NextResponse.json({ error: "This file is not shared" }, { status: 403 });
        }

        const { data: signed } = await supabase.storage
            .from("user-files")
            .createSignedUrl(file.storage_path as string, 60 * 60 * 24);

        const fileUrl = signed?.signedUrl ?? "";
        const message = buildWhatsAppMessageForFile(file.file_name as string, fileUrl);
        const whatsappLink = buildWhatsAppLink(message);

        return NextResponse.redirect(whatsappLink);
    }

    return NextResponse.json({ error: "Unsupported payload type" }, { status: 400 });
}
