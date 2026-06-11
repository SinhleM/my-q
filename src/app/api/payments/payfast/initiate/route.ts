/**
 * FILE: src/app/api/payments/payfast/initiate/route.ts
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PayFast endpoint (sandbox or live)
const PAYFAST_URL =
    process.env.PAYFAST_URL || "https://sandbox.payfast.co.za/eng/process";

/**
 * Build PayFast payload (form POST format)
 */
function buildPayFastPayload({
    paymentId,
    amount,
    description,
    payerEmail,
    payerName,
}: {
    paymentId: string;
    amount: number;
    description: string;
    payerEmail: string;
    payerName: string;
}) {
    return {
        merchant_id: process.env.PAYFAST_MERCHANT_ID!,
        merchant_key: process.env.PAYFAST_MERCHANT_KEY!,
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payments/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payments/cancel`,
        notify_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/payfast/notify`,

        m_payment_id: paymentId,
        amount: amount.toFixed(2),
        item_name: description,

        email_address: payerEmail,
        name_first: payerName,
    };
}

// POST /api/payments/payfast/initiate
export async function POST(request: Request) {
    const supabase = await createClient();

    const body = await request.json();
    const { payment_request_id, payer_name, payer_email } = body;

    if (!payment_request_id || !payer_name || !payer_email) {
        return NextResponse.json(
            {
                data: null,
                error:
                    "payment_request_id, payer_name, and payer_email are required.",
            },
            { status: 400 }
        );
    }

    // Load payment request
    const { data: paymentRequest } = await supabase
        .from("payment_requests")
        .select("*")
        .eq("id", payment_request_id)
        .eq("status", "pending")
        .single();

    if (!paymentRequest) {
        return NextResponse.json(
            {
                data: null,
                error: "Payment request not found or already completed.",
            },
            { status: 404 }
        );
    }

    // Expiry check
    if (
        paymentRequest.expires_at &&
        new Date(paymentRequest.expires_at) < new Date()
    ) {
        return NextResponse.json(
            { data: null, error: "Payment request has expired." },
            { status: 410 }
        );
    }

    const payload = buildPayFastPayload({
        paymentId: paymentRequest.id,
        amount: Number(paymentRequest.amount),
        description: paymentRequest.description ?? "Payment",
        payerEmail: payer_email,
        payerName: payer_name,
    });

    // Save payer email
    await supabase
        .from("payment_requests")
        .update({ payer_email })
        .eq("id", payment_request_id);

    return NextResponse.json({
        data: {
            payfast_url: PAYFAST_URL,
            payload,
        },
        error: null,
    });
}