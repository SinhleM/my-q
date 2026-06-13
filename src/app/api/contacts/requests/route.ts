import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/contacts/requests — incoming pending contact requests
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { data, error } = await supabase
        .from("contact_requests")
        .select(`
            id,
            created_at,
            status,
            sender:profiles!contact_requests_sender_id_fkey (
                id, username, display_name
            )
        `)
        .eq("receiver_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data, error: null });
}
