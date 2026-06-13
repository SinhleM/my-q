"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PaymentCheckoutModal({
    paymentId,
    onClose,
}: {
    paymentId: string;
    onClose: () => void;
}) {
    const supabase = createClient();

    const [payment, setPayment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [payerName, setPayerName] = useState("");
    const [payerEmail, setPayerEmail] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadPayment() {
            const { data } = await supabase
                .from("payment_requests")
                .select("*")
                .eq("id", paymentId)
                .single();

            setPayment(data);
            setLoading(false);
        }

        loadPayment();
    }, [paymentId]);

    async function payNow() {
        if (!payerName.trim() || !payerEmail.trim()) {
            setError("Please enter your name and email.");
            return;
        }

        setError("");
        setPaying(true);

        const res = await fetch("/api/payments/payfast/initiate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                payment_request_id: paymentId,
                payer_name: payerName.trim(),
                payer_email: payerEmail.trim(),
            }),
        });

        const json = await res.json();
        setPaying(false);

        if (!json?.data?.payfast_url) {
            setError(json?.error || "Payment failed to initialize.");
            return;
        }

        const form = document.createElement("form");
        form.method = "POST";
        form.action = json.data.payfast_url;

        Object.entries(json.data.payload).forEach(([key, value]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = value as string;
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
    }

    if (loading || !payment) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-[420px] rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-emerald-950">
                    Payment Checkout
                </h2>

                <p className="mt-2 text-sm text-neutral-600">
                    {payment.description}
                </p>

                <p className="mt-4 text-3xl font-black text-emerald-900">
                    R {payment.amount}
                </p>

                <div className="mt-6 space-y-3">
                    <input
                        type="text"
                        placeholder="Your name"
                        value={payerName}
                        onChange={(e) => setPayerName(e.target.value)}
                        className="w-full border p-3 rounded-xl text-sm"
                    />
                    <input
                        type="email"
                        placeholder="Your email"
                        value={payerEmail}
                        onChange={(e) => setPayerEmail(e.target.value)}
                        className="w-full border p-3 rounded-xl text-sm"
                    />

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    <button
                        onClick={payNow}
                        disabled={paying}
                        className="w-full bg-emerald-950 text-white py-3 rounded-xl font-bold hover:bg-emerald-900 disabled:opacity-60"
                    >
                        {paying ? "Redirecting..." : "Pay Now"}
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full text-sm text-neutral-500 hover:text-neutral-900"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
