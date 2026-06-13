"use client";

import { useState } from "react";

export default function PaymentForm({
    paymentId,
}: {
    paymentId: string;
}) {
    const [payerName, setPayerName] = useState("");
    const [payerEmail, setPayerEmail] = useState("");
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
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

    return (
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <input
                type="text"
                placeholder="Your name"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                required
                className="w-full p-3 border rounded-xl"
            />

            <input
                type="email"
                placeholder="Your email"
                value={payerEmail}
                onChange={(e) => setPayerEmail(e.target.value)}
                required
                className="w-full p-3 border rounded-xl"
            />

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            <button
                type="submit"
                disabled={paying}
                className="w-full bg-emerald-950 text-white py-3 rounded-xl font-bold disabled:opacity-60"
            >
                {paying ? "Redirecting to PayFast..." : "Pay with PayFast →"}
            </button>
        </form>
    );
}
