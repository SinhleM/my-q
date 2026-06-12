/**
 * FILE: src/app/(dashboard)/dashboard/components/payments/index.tsx
 */

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type PaymentRequest = {
    id: string;
    amount: number;
    description: string;
    status: string;
    created_at: string;
};

export default function Payments() {
    const supabase = createClient();

    const [requests, setRequests] = useState<PaymentRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [creating, setCreating] = useState(false);

    // ---------------------------
    // LOAD REQUESTS
    // ---------------------------
    useEffect(() => {
        loadRequests();
    }, []);

    async function loadRequests() {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
            .from("payment_requests")
            .select("*")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
            setLoading(false);
            return;
        }

        setRequests(data || []);
        setLoading(false);
    }

    // ---------------------------
    // CREATE REQUEST
    // ---------------------------
    async function createRequest() {
        setCreating(true);

        const res = await fetch("/api/payments/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: Number(amount),
                description,
            }),
        });

        setCreating(false);

        if (!res.ok) {
            alert("Failed to create request");
            return;
        }

        setAmount("");
        setDescription("");

        await loadRequests();

        alert("Payment request created");
    }

    // ---------------------------
    // PAY REQUEST (PAYFAST)
    // ---------------------------
    async function payRequest(id: string) {
        const res = await fetch("/api/payments/payfast/initiate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                payment_request_id: id,
                payer_name: "Anonymous",
                payer_email: "test@example.com",
            }),
        });

        const result = await res.json();

        if (!result.data) {
            alert(result.error);
            return;
        }

        const { payfast_url, payload } = result.data;

        // CREATE AUTO-SUBMIT FORM
        const form = document.createElement("form");
        form.method = "POST";
        form.action = payfast_url;

        Object.entries(payload).forEach(([key, value]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = String(value);
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
    }

    // ---------------------------
    // UI
    // ---------------------------
    if (loading) {
        return <div className="h-40 bg-neutral-100 animate-pulse rounded-2xl" />;
    }

    return (
        <div className="animate-in fade-in duration-500">
            <h1 className="text-2xl md:text-3xl font-black text-emerald-950">
                Payments & Requests
            </h1>

            <p className="text-neutral-500 mt-2">
                Create and manage payment requests.
            </p>

            {/* CREATE REQUEST */}
            <div className="mt-6 bg-white p-4 rounded-2xl border space-y-3">
                <input
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border p-2 rounded-xl"
                />

                <input
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border p-2 rounded-xl"
                />

                <button
                    onClick={createRequest}
                    disabled={creating}
                    className="bg-emerald-950 text-white px-4 py-2 rounded-xl font-bold"
                >
                    {creating ? "Creating..." : "Create Request"}
                </button>
            </div>

            {/* REQUEST LIST */}
            <div className="mt-8 space-y-4">
                {requests.map((r) => (
                    <div
                        key={r.id}
                        className="p-4 border rounded-2xl flex justify-between items-center bg-white"
                    >
                        <div>
                            <p className="font-bold">R {r.amount}</p>
                            <p className="text-xs text-neutral-500">
                                {r.description}
                            </p>
                            <p className="text-[10px] text-neutral-400">
                                {r.status}
                            </p>
                        </div>

                        <button
                            onClick={() => payRequest(r.id)}
                            className="bg-emerald-950 text-white px-4 py-2 rounded-xl text-sm"
                        >
                            Pay
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}