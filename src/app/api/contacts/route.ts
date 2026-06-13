import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/contacts — list my contacts
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ data: null, error: "Unauthorised" }, { status: 401 });

    const { data, error } = await supabase
        .from("contacts")
        .select(`
            id,
            created_at,
            contact:profiles!contacts_contact_id_fkey (
                id, username, display_name, email
            )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 });
    return NextResponse.json({ data, error: null });
}

// POST /api/contacts — add a contact by username
export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ data: null, error: "Unauthorised" }, { status: 401 });

    const { username } = await request.json();
    if (!username) return NextResponse.json({ data: null, error: "username is required" }, { status: 400 });

    const { data: contactProfile } = await supabase
        .from("profiles")
        .select("id, username, display_name")
        .eq("username", username)
        .single();

    if (!contactProfile) {
        return NextResponse.json({ data: null, error: `No user found with username @${username}` }, { status: 404 });
    }

    if (contactProfile.id === user.id) {
        return NextResponse.json({ data: null, error: "You cannot add yourself as a contact" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("contacts")
        .insert({ user_id: user.id, contact_id: contactProfile.id })
        .select()
        .single();

    if (error) {
        if (error.code === "23505") {
            return NextResponse.json({ data: null, error: "Already in your contacts" }, { status: 409 });
        }
        return NextResponse.json({ data: null, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: { ...data, contact: contactProfile }, error: null });
}
