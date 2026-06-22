import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/inbox/files — files dropped on your profile by visitors
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { data, error } = await supabase
        .from("files")
        .select("id, file_name, file_size, mime_type, storage_path, created_at")
        .eq("owner_id", user.id)
        .eq("is_received", true)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data, error: null });
}
