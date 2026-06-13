import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPaymentRequestEmail } from "@/lib/email/resend";

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
        payer_username,
        payer_email,
    } = body;

    if (!amount || !description) {
        return NextResponse.json(
            { data: null, error: "amount and description are required" },
            { status: 400 }
        );
    }

    // Resolve payer_id from username if provided
    let payer_id: string | null = null;
    let resolvedPayerEmail: string | null = payer_email ?? null;
    let resolvedPayerName: string | undefined;

    if (payer_username) {
        const { data: payerProfile } = await supabase
            .from("profiles")
            .select("id, email, display_name, username")
            .eq("username", payer_username)
            .single();

        if (!payerProfile) {
            return NextResponse.json(
                { data: null, error: `No user found with username @${payer_username}` },
                { status: 404 }
            );
        }

        payer_id = payerProfile.id;
        resolvedPayerEmail = resolvedPayerEmail ?? payerProfile.email;
        resolvedPayerName = payerProfile.display_name ?? payerProfile.username;
    }

    // Fetch owner profile for the email sender name
    const { data: ownerProfile } = await supabase
        .from("profiles")
        .select("display_name, username")
        .eq("id", user.id)
        .single();

    const { data, error } = await supabase
        .from("payment_requests")
        .insert({
            owner_id: user.id,
            payer_id,
            payer_email: resolvedPayerEmail,
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

    // Send email notification if we have a payer email
    if (resolvedPayerEmail) {
        try {
            await sendPaymentRequestEmail({
                toEmail: resolvedPayerEmail,
                toName: resolvedPayerName,
                fromName: ownerProfile?.display_name ?? ownerProfile?.username ?? "Someone",
                amount,
                description,
                paymentId: data.id,
            });
        } catch (emailErr) {
            console.error("Failed to send payment email:", emailErr);
            // Don't fail the request if email fails
        }
    }

    return NextResponse.json({ data, error: null });
}
