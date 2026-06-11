/**
 * FILE: src/app/(dashboard)/payments/page.tsx
 */

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type PaymentRequest = {
    id: string;
    amount: number;
    currency: string;
    description: string | null;
    status: "pending" | "paid" | "cancelled" | "failed";
    created_at: string;
};

export default function PaymentsPage() {
    const [payments, setPayments] = useState<PaymentRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadPayments() {
            const supabase = createClient();

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("payment_requests")
                .select(
                    "id, amount, currency, description, status, created_at"
                )
                .eq("owner_id", user.id)
                .order("created_at", { ascending: false });

            if (!error && data) {
                setPayments(data as PaymentRequest[]);
            }

            setLoading(false);
        }

        loadPayments();
    }, []);

    if (loading) {
        return (
            <div className="p-6">
                <div className="h-6 w-40 bg-neutral-200 rounded animate-pulse" />
                <div className="mt-6 space-y-3">
                    <div className="h-20 bg-neutral-100 rounded-2xl animate-pulse" />
                    <div className="h-20 bg-neutral-100 rounded-2xl animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-neutral-900">
                Payments
            </h1>
            <p className="text-neutral-500 mt-1">
                Manage payment requests linked to your QR identity.
            </p>

            <div className="mt-8 space-y-4">
                {payments.length === 0 && (
                    <div className="text-neutral-500 text-sm">
                        No payment requests yet.
                    </div>
                )}

                {payments.map((payment) => (
                    <div
                        key={payment.id}
                        className="border border-neutral-200 rounded-2xl p-5 bg-white shadow-sm"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold text-neutral-900">
                                    {payment.description ?? "Payment Request"}
                                </p>
                                <p className="text-sm text-neutral-500 mt-1">
                                    {new Date(
                                        payment.created_at
                                    ).toLocaleString()}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="font-bold text-neutral-900">
                                    {payment.currency}{" "}
                                    {Number(payment.amount).toFixed(2)}
                                </p>

                                <span
                                    className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${payment.status === "paid"
                                            ? "bg-green-100 text-green-700"
                                            : payment.status === "pending"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : payment.status === "cancelled"
                                                    ? "bg-gray-100 text-gray-600"
                                                    : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {payment.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}