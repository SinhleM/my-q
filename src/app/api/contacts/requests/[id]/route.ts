import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/contacts/requests/[id] — accept or decline
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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
        .eq("id", params.id)
        .eq("receiver_id", user.id)
        .single();

    if (!req) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    await supabase
        .from("contact_requests")
        .update({ status: action === "accept" ? "accepted" : "declined" })
        .eq("id", params.id);

    if (action === "accept") {
        // Create contact relationship both ways
        await supabase.from("contacts").upsert([
            { user_id: user.id, contact_id: req.sender_id },
            { user_id: req.sender_id, contact_id: user.id },
        ]);
    }

    return NextResponse.json({ data: { action }, error: null });
}
