/**
 * FILE: src/app/api/files/upload/route.ts
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const ownerId = formData.get("ownerId") as string | null;

    if (!file || !ownerId) {
        return NextResponse.json(
            { error: "Missing file or ownerId" },
            { status: 400 }
        );
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${randomUUID()}.${fileExt}`;
    const storagePath = `${ownerId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from("user-files")
        .upload(storagePath, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (uploadError) {
        return NextResponse.json(
            { error: uploadError.message },
            { status: 500 }
        );
    }

    const { data, error: dbError } = await supabase
        .from("files")
        .insert({
            owner_id: ownerId,
            sender_id: user?.id ?? null,
            storage_path: storagePath,
            file_name: file.name,
            file_size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            mime_type: file.type,
            is_shared: false,
        })
        .select()
        .single();

    if (dbError) {
        return NextResponse.json(
            { error: dbError.message },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        file: data,
    });
}