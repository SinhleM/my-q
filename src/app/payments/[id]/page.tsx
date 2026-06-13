/**
 * FILE: src/app/payments/[id]/page.tsx
 * PURPOSE: Public checkout page for external payer (User B)
 */

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PaymentForm from "./payment-form";

export default async function PaymentPage({
    params,
}: {
    params: { id: string };
}) {
    const supabase = await createClient();

    const { data: payment, error } = await supabase
        .from("payment_requests")
        .select(`
            id,
            amount,
            currency,
            description,
            status,
            owner_id,
            expires_at,
            profiles:profiles!payment_requests_owner_id_fkey (
                username,
                display_name
            )
        `)
        .eq("id", params.id)
        .single();

    if (error || !payment) {
        return notFound();
    }

    const isExpired =
        payment.expires_at &&
        new Date(payment.expires_at) < new Date();

    if (isExpired || payment.status !== "pending") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-xl font-bold">
                        Payment unavailable
                    </h1>
                    <p className="text-neutral-500 mt-2">
                        This request is expired or completed.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-neutral-50">
            <div className="w-full max-w-md bg-white border rounded-3xl p-6">

                <h1 className="text-2xl font-black">
                    Payment Checkout
                </h1>

                {/* ✅ FIXED: no array access */}
                <p className="text-sm text-neutral-500 mt-1">
                    Paying @{payment.profiles?.username}
                </p>

                <div className="mt-6">
                    <p className="text-lg font-bold">
                        {payment.description}
                    </p>

                    <p className="text-3xl font-black text-emerald-900 mt-2">
                        {payment.currency} {payment.amount}
                    </p>
                </div>

                <PaymentForm paymentId={payment.id} />
            </div>
        </div>
    );
}