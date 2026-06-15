import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import PaymentForm from "./payment-form";

export default async function PaymentPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: rawPayment, error } = await supabase
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
        .eq("id", id)
        .single();

    const payment = rawPayment
        ? {
              ...rawPayment,
              profile: Array.isArray(rawPayment.profiles)
                  ? (rawPayment.profiles[0] as { username: string; display_name: string | null } | undefined)
                  : (rawPayment.profiles as { username: string; display_name: string | null } | null),
          }
        : null;

    if (error || !rawPayment || !payment) return notFound();

    const isExpired = payment.expires_at && new Date(payment.expires_at) < new Date();

    if (isExpired || payment.status !== "pending") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-6">
                <div className="text-center bg-white rounded-3xl p-8 max-w-sm w-full">
                    <p className="text-2xl font-black text-neutral-900">Payment unavailable</p>
                    <p className="text-neutral-500 mt-2 text-sm">This request is expired or already completed.</p>
                </div>
            </div>
        );
    }

    const payerName = user
        ? null // logged in, no nudge needed
        : null;

    void payerName; // suppress unused warning

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-6 py-12">

            {/* RECIPIENT BADGE */}
            <div className="w-full max-w-md mb-4">
                <div className="bg-emerald-900 rounded-3xl px-5 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-white font-black text-sm shrink-0">
                        {(payment.profile?.display_name || payment.profile?.username || "?")
                            .split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                        <p className="text-white font-black text-sm">
                            {payment.profile?.display_name || payment.profile?.username}
                        </p>
                        <p className="text-emerald-400 text-xs">@{payment.profile?.username}</p>
                    </div>
                    <p className="ml-auto text-emerald-300 text-xs font-medium">is requesting</p>
                </div>
            </div>

            {/* PAYMENT CARD */}
            <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-6">
                <div>
                    <p className="text-sm text-neutral-500 font-medium">{payment.description || "Payment request"}</p>
                    <p className="text-4xl font-black text-neutral-900 mt-1">
                        {payment.currency} {Number(payment.amount).toFixed(2)}
                    </p>
                </div>

                {/* Soft login nudge — only for guests */}
                {!user && (
                    <div className="bg-neutral-50 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
                        <p className="text-xs text-neutral-500 leading-snug">
                            <span className="font-bold text-neutral-700">Have an account?</span> Log in to track this payment in your history.
                        </p>
                        <Link
                            href={`/login?next=/payments/${id}`}
                            className="text-xs font-bold text-emerald-900 hover:underline shrink-0"
                        >
                            Log in →
                        </Link>
                    </div>
                )}

                <PaymentForm paymentId={payment.id} />

                {!user && (
                    <p className="text-center text-xs text-neutral-400">
                        No account?{" "}
                        <Link href={`/register`} className="text-emerald-900 font-bold hover:underline">
                            Create one free
                        </Link>
                        {" "}— or continue as a guest above.
                    </p>
                )}
            </div>
        </div>
    );
}
