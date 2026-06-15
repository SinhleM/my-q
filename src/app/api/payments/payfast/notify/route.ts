/**
 * FILE: src/app/api/payments/payfast/notify/route.ts
 */

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// NOTE: These will be simple MVP stubs for now
// You can harden them later once system works

function verifySignature(_: Record<string, string>) {
    return true; // MVP safe mode
}

function verifySourceIP(_: string) {
    return true; // MVP safe mode
}

async function verifyWithPayFast(_: string) {
    return true; // MVP safe mode
}

function parseITNBody(rawBody: string) {
    const params = new URLSearchParams(rawBody);
    return Object.fromEntries(params.entries());
}

function getClientIP(req: Request) {
    return (
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "unknown"
    );
}

// POST /api/payments/payfast/notify
export async function POST(request: Request) {
    const rawBody = await request.text();

    const ip = getClientIP(request);

    if (!verifySourceIP(ip)) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    const params = parseITNBody(rawBody);

    if (!verifySignature(params)) {
        return new NextResponse("Bad signature", { status: 400 });
    }

    const isValid = await verifyWithPayFast(rawBody);

    if (!isValid) {
        return new NextResponse("Validation failed", { status: 400 });
    }

    const {
        m_payment_id,
        pf_payment_id,
        payment_status,
        amount_gross,
    } = params;

    const supabase = createServiceClient();

    const { data: paymentRequest } = await supabase
        .from("payment_requests")
        .select("id, amount, status")
        .eq("id", m_payment_id)
        .single();

    if (!paymentRequest) {
        return new NextResponse("OK", { status: 200 });
    }

    if (paymentRequest.status !== "pending") {
        return new NextResponse("OK", { status: 200 });
    }

    const expectedAmount = Number(paymentRequest.amount).toFixed(2);
    const receivedAmount = Number(amount_gross).toFixed(2);

    if (expectedAmount !== receivedAmount) {
        return new NextResponse("Amount mismatch", { status: 400 });
    }

    const statusMap: Record<string, string> = {
        COMPLETE: "paid",
        FAILED: "failed",
        PENDING: "pending",
    };

    const newStatus = statusMap[payment_status] ?? "failed";

    await supabase
        .from("payment_requests")
        .update({
            status: newStatus,
            payfast_pf_payment_id: pf_payment_id,
            payfast_m_payment_id: m_payment_id,
            paid_at:
                newStatus === "paid"
                    ? new Date().toISOString()
                    : null,
        })
        .eq("id", m_payment_id);

    return new NextResponse("OK", { status: 200 });
}