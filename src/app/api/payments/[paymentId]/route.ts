/**
 * FILE: src/app/api/payments/[paymentId]/route.ts
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET — public lookup for QR payment page
export async function GET(
    _request: Request,
    { params }: { params: { paymentId: string } }
) {
    const { paymentId } = params;

    const supabase = await createClient();

    const { data, error } = await supabase
        .from("payment_requests")
        .select(
            "id, amount, currency, description, status, expires_at, created_at"
        )
        .eq("id", paymentId)
        .single();

    if (error || !data) {
        return NextResponse.json(
            { data: null, error: "Payment request not found." },
            { status: 404 }
        );
    }

    return NextResponse.json({ data, error: null });
}

// PATCH — owner cancels a pending request
export async function PATCH(
    request: Request,
    { params }: { params: { paymentId: string } }
) {
    const { paymentId } = params;

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
            { data: null, error: "Unauthorised" },
            { status: 401 }
        );
    }

    const body = await request.json();

    if (body.status !== "cancelled") {
        return NextResponse.json(
            {
                data: null,
                error: "Only cancellation is allowed via this endpoint.",
            },
            { status: 400 }
        );
    }

    const { data, error } = await supabase
        .from("payment_requests")
        .update({ status: "cancelled" })
        .eq("id", paymentId)
        .eq("owner_id", user.id)
        .eq("status", "pending")
        .select()
        .single();

    if (error || !data) {
        return NextResponse.json(
            { data: null, error: "Could not cancel payment request." },
            { status: 404 }
        );
    }

    return NextResponse.json({ data, error: null });
}