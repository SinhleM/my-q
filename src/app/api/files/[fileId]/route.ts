/**
 * FILE: src/app/api/files/[fileId]/route.ts
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { fileId: string } }
) {
    const supabase = await createClient();

    // 1. Get file metadata from DB
    const { data: file, error } = await supabase
        .from("files")
        .select("*")
        .eq("id", params.fileId)
        .single();

    if (error || !file) {
        return NextResponse.json(
            { error: "File not found" },
            { status: 404 }
        );
    }

    // 2. Check if file is public or user owns it
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const isOwner = user?.id === file.owner_id;
    const isPublic = file.is_shared;

    if (!isOwner && !isPublic) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 403 }
        );
    }

    // 3. Generate signed URL
    const { data: signed, error: signError } = await supabase.storage
        .from("qr-files")
        .createSignedUrl(file.storage_path, 60);

    if (signError || !signed) {
        return NextResponse.json(
            { error: "Could not generate download link" },
            { status: 500 }
        );
    }

    return NextResponse.json({
        url: signed.signedUrl,
        fileName: file.file_name,
        size: file.file_size,
        mimeType: file.mime_type,
    });
}