/**
 * FILE: src/app/api/payments/request/route.ts
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST — Owner creates a payment request
 */
export async function POST(request: Request) {
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

    const {
        amount,
        description,
        currency = "ZAR",
        expires_at,
    } = body;

    if (!amount || !description) {
        return NextResponse.json(
            {
                data: null,
                error: "amount and description are required",
            },
            { status: 400 }
        );
    }

    const { data, error } = await supabase
        .from("payment_requests")
        .insert({
            owner_id: user.id,
            amount,
            description,
            currency,
            status: "pending",
            expires_at: expires_at ?? null,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json(
            { data: null, error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json({ data, error: null });
}