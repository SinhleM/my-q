import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/payments/received — payment requests sent TO the current user
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ data: null, error: "Unauthorised" }, { status: 401 });

    const { data, error } = await supabase
        .from("payment_requests")
        .select(`
            id,
            amount,
            currency,
            description,
            status,
            created_at,
            owner:profiles!payment_requests_owner_id_fkey (
                id, username, display_name
            )
        `)
        .eq("payer_id", user.id)
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 });
    return NextResponse.json({ data, error: null });
}
