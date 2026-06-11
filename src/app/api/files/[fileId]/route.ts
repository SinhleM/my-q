/**
 * FILE: src/app/api/files/[fileId]/route.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/files/[fileId]
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ fileId: string }> }
) {
    const { fileId } = await context.params;

    const supabase = await createClient();

    const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("id", fileId)
        .single();

    if (error || !data) {
        return NextResponse.json(
            { error: "File not found" },
            { status: 404 }
        );
    }

    return NextResponse.json({
        url: data.storage_path,
        fileName: data.file_name,
        size: data.file_size,
        mimeType: data.mime_type,
    });
}