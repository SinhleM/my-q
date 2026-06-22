import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/contacts/requests/[id] — accept or decline
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { action } = await request.json(); // "accept" | "decline"
    if (!["accept", "decline"].includes(action)) {
        return NextResponse.json({ error: "action must be accept or decline" }, { status: 400 });
    }

    const { data: req } = await supabase
        .from("contact_requests")
        .select("id, sender_id, receiver_id")
        .eq("id", id)
        .eq("receiver_id", user.id)
        .single();

    if (!req) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    const { error: updateError } = await supabase
        .from("contact_requests")
        .update({ status: action === "accept" ? "accepted" : "declined" })
        .eq("id", id);

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    if (action === "accept") {
        const { error: upsertError } = await supabase.from("contacts").upsert([
            { user_id: user.id, contact_id: req.sender_id },
            { user_id: req.sender_id, contact_id: user.id },
        ]);
        if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ data: { action }, error: null });
}
