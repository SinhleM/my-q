import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/contacts/request — send a contact request by username
export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { username } = await request.json();
    if (!username) return NextResponse.json({ error: "username is required" }, { status: 400 });

    const { data: target } = await supabase
        .from("profiles")
        .select("id, username, display_name")
        .eq("username", username)
        .single();

    if (!target) return NextResponse.json({ error: `No user found: @${username}` }, { status: 404 });
    if (target.id === user.id) return NextResponse.json({ error: "Cannot request yourself" }, { status: 400 });

    // Check if already contacts
    const { data: existing } = await supabase
        .from("contacts")
        .select("id")
        .eq("user_id", user.id)
        .eq("contact_id", target.id)
        .single();

    if (existing) return NextResponse.json({ error: "Already in your contacts" }, { status: 409 });

    const { error } = await supabase
        .from("contact_requests")
        .insert({ sender_id: user.id, receiver_id: target.id });

    if (error) {
        if (error.code === "23505") return NextResponse.json({ error: "Request already sent" }, { status: 409 });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: { receiver: target }, error: null });
}
