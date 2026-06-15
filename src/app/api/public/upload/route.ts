import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// POST /api/public/upload — anyone can upload a file to a profile (if accept_files is on)
export async function POST(request: Request) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ error: "Server misconfiguration: service role key missing" }, { status: 500 });
    }

    // Use service client throughout — profile lookup is fine (profiles are public data)
    const supabase = createServiceClient();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const ownerUsername = formData.get("owner_username") as string | null;

    if (!file || !ownerUsername) {
        return NextResponse.json({ error: "file and owner_username are required" }, { status: 400 });
    }

    const { data: owner } = await supabase
        .from("profiles")
        .select("id, accept_files, max_file_size_mb")
        .eq("username", ownerUsername)
        .single();

    if (!owner) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    if (!owner.accept_files) return NextResponse.json({ error: "This profile does not accept file uploads" }, { status: 403 });

    const maxBytes = (owner.max_file_size_mb ?? 25) * 1024 * 1024;
    if (file.size > maxBytes) {
        return NextResponse.json({ error: `File exceeds the ${owner.max_file_size_mb ?? 25}MB limit` }, { status: 413 });
    }

    const ext = file.name.split(".").pop();
    const storagePath = `${owner.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
        .from("user-files")
        .upload(storagePath, arrayBuffer, { contentType: file.type });

    if (uploadError) {
        const msg = uploadError.message.toLowerCase().includes("bucket")
            ? "Storage bucket 'user-files' not found. Create it in Supabase Storage."
            : uploadError.message;
        return NextResponse.json({ error: msg }, { status: 500 });
    }

    const { error: dbError } = await supabase.from("files").insert({
        owner_id: owner.id,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_path: storagePath,
        is_shared: false,
        is_received: true,
    });

    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

    return NextResponse.json({ data: { storagePath }, error: null });
}
