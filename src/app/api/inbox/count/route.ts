import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/inbox/count — total unread inbox items for the current user
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ count: 0 });

    const [contactReqs, payments, fileDrop] = await Promise.all([
        supabase
            .from("contact_requests")
            .select("id", { count: "exact", head: true })
            .eq("receiver_id", user.id)
            .eq("status", "pending"),

        supabase
            .from("payment_requests")
            .select("id", { count: "exact", head: true })
            .eq("payer_id", user.id)
            .eq("status", "pending"),

        supabase
            .from("files")
            .select("id", { count: "exact", head: true })
            .eq("owner_id", user.id)
            .eq("is_received", true)
            .eq("is_shared", false)
            .is("deleted_at", null),
    ]);

    const count = (contactReqs.count ?? 0) + (payments.count ?? 0) + (fileDrop.count ?? 0);
    return NextResponse.json({ count });
}
