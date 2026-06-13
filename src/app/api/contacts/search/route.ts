import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/contacts/search?q=username — search users by username
export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ data: null, error: "Unauthorised" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
        return NextResponse.json({ data: [], error: null });
    }

    const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name")
        .ilike("username", `%${q}%`)
        .neq("id", user.id)
        .limit(8);

    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 });
    return NextResponse.json({ data, error: null });
}
