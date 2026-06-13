"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import QRCode from "qrcode";
import { X, QrCode, Copy, Link2, UserCheck, Mail } from "lucide-react";
import PaymentCheckoutModal from "./checkout-modal";

type PaymentRequest = {
    id: string;
    amount: number;
    description: string;
    status: string;
    created_at: string;
    payer_id?: string | null;
    payer_email?: string | null;
};

type ReceivedRequest = {
    id: string;
    amount: number;
    currency: string;
    description: string;
    status: string;
    created_at: string;
    owner: { username: string; display_name: string | null };
};

type Contact = {
    id: string;
    contact: { id: string; username: string; display_name: string | null };
};

type Tab = "sent" | "received";

export default function Payments() {
    const supabase = createClient();
    const [tab, setTab] = useState<Tab>("sent");
    const [requests, setRequests] = useState<PaymentRequest[]>([]);
    const [loadingSent, setLoadingSent] = useState(true);
    const [received, setReceived] = useState<ReceivedRequest[]>([]);
    const [loadingReceived, setLoadingReceived] = useState(true);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [payerMode, setPayerMode] = useState<"contact" | "email" | "none">("none");
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [payerEmail, setPayerEmail] = useState("");
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");
    const [checkoutPaymentId, setCheckoutPaymentId] = useState<string | null>(null);
    const [qrModal, setQrModal] = useState<{ id: string; description: string; amount: number } | null>(null);
    const [qrDataUrl, setQrDataUrl] = useState("");
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        if (!qrModal) return;
        QRCode.toDataURL(`${window.location.origin}/payments/${qrModal.id}`, {
            width: 400, margin: 2, errorCorrectionLevel: "H",
            color: { dark: "#064e3b", light: "#ffffff" },
        }).then(setQrDataUrl);
    }, [qrModal]);

    useEffect(() => {
        loadSent(); loadReceived(); loadContacts();
    }, []);

    async function loadSent() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from("payment_requests").select("*")
            .eq("owner_id", user.id).order("created_at", { ascending: false });
        setRequests(data ?? []);
        setLoadingSent(false);
    }

    async function loadReceived() {
        const res = await fetch("/api/payments/received");
        const json = await res.json();
        setReceived(json.data ?? []);
        setLoadingReceived(false);
    }

    async function loadContacts() {
        const res = await fetch("/api/contacts");
        const json = await res.json();
        setContacts(json.data ?? []);
    }

    async function createRequest() {
        setCreating(true); setCreateError("");
        const body: Record<string, unknown> = { amount: Number(amount), description };
        if (payerMode === "contact" && selectedContact) body.payer_username = selectedContact.contact.username;
        else if (payerMode === "email" && payerEmail.trim()) body.payer_email = payerEmail.trim();

        const res = await fetch("/api/payments/request", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const json = await res.json();
        setCreating(false);
        if (json.error) { setCreateError(json.error); return; }
        setAmount(""); setDescription(""); setPayerMode("none");
        setSelectedContact(null); setPayerEmail("");
        await loadSent();
    }

    function copyLink(id: string) {
        navigator.clipboard.writeText(`${window.location.origin}/payments/${id}`);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    }

    const statusBadge = (s: string) => ({
        pending: "bg-amber-100 text-amber-700",
        paid: "bg-emerald-100 text-emerald-700",
        cancelled: "bg-neutral-100 text-neutral-500",
        failed: "bg-red-100 text-red-600",
    }[s] ?? "bg-neutral-100 text-neutral-500");

    const pendingReceived = received.filter(r => r.status === "pending").length;

    return (
        <div className="space-y-4 pb-10">

            {/* HERO */}
            <div className="bg-emerald-900 rounded-3xl px-6 pt-8 pb-6">
                <p className="text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">Payments</p>
                <p className="text-white font-black text-xl">Requests & Transfers</p>
                <p className="text-emerald-200/60 text-sm mt-1">
                    {requests.filter(r => r.status === "pending").length} pending sent
                    {pendingReceived > 0 && ` · ${pendingReceived} to pay`}
                </p>

                {/* TABS inside hero */}
                <div className="mt-5 flex gap-1 bg-emerald-950/40 rounded-2xl p-1">
                    {(["sent", "received"] as Tab[]).map((t) => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`flex-1 py-2 rounded-xl text-sm font-bold capitalize transition-all cursor-pointer ${
                                tab === t ? "bg-white text-emerald-900" : "text-emerald-300 hover:text-white"
                            }`}
                        >
                            {t === "sent" ? "Sent" : "Received"}
                            {t === "received" && pendingReceived > 0 && (
                                <span className="ml-1.5 bg-emerald-900 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                    {pendingReceived}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── SENT TAB ── */}
            {tab === "sent" && (
                <>
                    {/* CREATE FORM */}
                    <div className="bg-white rounded-3xl px-5 py-5 space-y-4">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">New Request</p>

                        <div className="flex gap-3">
                            <div className="w-28">
                                <label className="block text-xs font-bold text-neutral-400 mb-1.5">Amount (R)</label>
                                <div className="flex items-center bg-neutral-100 rounded-2xl px-3 py-3">
                                    <span className="text-neutral-400 text-sm font-bold mr-1">R</span>
                                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="bg-transparent flex-1 text-sm font-bold text-neutral-900 outline-none w-full" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-neutral-400 mb-1.5">Description</label>
                                <input value={description} onChange={e => setDescription(e.target.value)}
                                    placeholder="What's it for?"
                                    className="w-full bg-neutral-100 rounded-2xl px-4 py-3 text-sm font-medium text-neutral-900 outline-none placeholder:text-neutral-400" />
                            </div>
                        </div>

                        {/* Payer mode pills */}
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-neutral-400">Who should pay?</p>
                            <div className="flex gap-2">
                                {[
                                    { mode: "none" as const, label: "Anyone", icon: <Link2 size={12} /> },
                                    { mode: "contact" as const, label: "Contact", icon: <UserCheck size={12} /> },
                                    { mode: "email" as const, label: "By Email", icon: <Mail size={12} /> },
                                ].map(({ mode, label, icon }) => (
                                    <button key={mode} onClick={() => setPayerMode(mode)}
                                        className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                                            payerMode === mode ? "bg-emerald-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                                        }`}>
                                        {icon}{label}
                                    </button>
                                ))}
                            </div>

                            {payerMode === "contact" && (
                                <select value={selectedContact?.id ?? ""}
                                    onChange={e => setSelectedContact(contacts.find(c => c.id === e.target.value) ?? null)}
                                    className="w-full bg-neutral-100 rounded-2xl px-4 py-3 text-sm font-medium text-neutral-900 outline-none">
                                    <option value="">Select a contact...</option>
                                    {contacts.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.contact.display_name || c.contact.username} (@{c.contact.username})
                                        </option>
                                    ))}
                                </select>
                            )}

                            {payerMode === "email" && (
                                <input type="email" value={payerEmail} onChange={e => setPayerEmail(e.target.value)}
                                    placeholder="Payer's email address"
                                    className="w-full bg-neutral-100 rounded-2xl px-4 py-3 text-sm font-medium text-neutral-900 outline-none placeholder:text-neutral-400" />
                            )}
                        </div>

                        {createError && <p className="text-sm text-red-500">{createError}</p>}

                        <button onClick={createRequest} disabled={creating || !amount || !description}
                            className="w-full bg-emerald-900 text-white py-3 rounded-2xl font-bold text-sm disabled:opacity-50 cursor-pointer hover:bg-emerald-800 transition-colors">
                            {creating ? "Creating..." : "Create Request"}
                        </button>
                    </div>

                    {/* SENT LIST */}
                    <div className="bg-white rounded-3xl px-5 py-5">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Sent Requests</p>
                        {loadingSent ? (
                            <div className="h-16 bg-neutral-100 animate-pulse rounded-2xl" />
                        ) : requests.length === 0 ? (
                            <p className="text-sm text-neutral-400 text-center py-6">No requests yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {requests.map(r => (
                                    <div key={r.id} className="flex items-center justify-between bg-neutral-50 rounded-2xl px-4 py-3">
                                        <div className="min-w-0">
                                            <p className="font-bold text-neutral-900 text-sm">R {r.amount}</p>
                                            <p className="text-xs text-neutral-500 truncate">{r.description}</p>
                                            {r.payer_email && <p className="text-[10px] text-neutral-400 mt-0.5">{r.payer_email}</p>}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 ml-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(r.status)}`}>
                                                {r.status}
                                            </span>
                                            <button onClick={() => copyLink(r.id)} title="Copy link"
                                                className="text-neutral-400 hover:text-emerald-700 cursor-pointer transition-colors">
                                                <Copy size={14} className={copied === r.id ? "text-emerald-600" : ""} />
                                            </button>
                                            <button onClick={() => setQrModal({ id: r.id, description: r.description, amount: r.amount })}
                                                title="Show QR" className="text-neutral-400 hover:text-emerald-700 cursor-pointer transition-colors">
                                                <QrCode size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ── RECEIVED TAB ── */}
            {tab === "received" && (
                <div className="bg-white rounded-3xl px-5 py-5">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Received Requests</p>
                    {loadingReceived ? (
                        <div className="h-16 bg-neutral-100 animate-pulse rounded-2xl" />
                    ) : received.length === 0 ? (
                        <p className="text-sm text-neutral-400 text-center py-6">No requests sent to you yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {received.map(r => (
                                <div key={r.id} className="flex items-center justify-between bg-neutral-50 rounded-2xl px-4 py-3">
                                    <div className="min-w-0">
                                        <p className="font-bold text-neutral-900 text-sm">R {r.amount}</p>
                                        <p className="text-xs text-neutral-500 truncate">{r.description}</p>
                                        <p className="text-[10px] text-neutral-400 mt-0.5">
                                            from @{r.owner?.username}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(r.status)}`}>
                                            {r.status}
                                        </span>
                                        {r.status === "pending" && (
                                            <button onClick={() => setCheckoutPaymentId(r.id)}
                                                className="bg-emerald-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-emerald-800 transition-colors">
                                                Pay
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* CHECKOUT MODAL */}
            {checkoutPaymentId && (
                <PaymentCheckoutModal paymentId={checkoutPaymentId}
                    onClose={() => { setCheckoutPaymentId(null); loadReceived(); }} />
            )}

            {/* QR MODAL */}
            {qrModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-3xl p-6 shadow-xl w-full max-w-[320px] flex flex-col items-center">
                        <div className="flex justify-between items-start w-full mb-5">
                            <div>
                                <p className="font-bold text-neutral-900 text-sm">{qrModal.description}</p>
                                <p className="text-2xl font-black text-emerald-900 mt-0.5">R {qrModal.amount}</p>
                            </div>
                            <button onClick={() => setQrModal(null)} className="text-neutral-400 hover:text-neutral-700 cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>

                        {qrDataUrl
                            ? <img src={qrDataUrl} alt="Payment QR" className="w-56 h-56 rounded-2xl" />
                            : <div className="w-56 h-56 bg-neutral-100 animate-pulse rounded-2xl" />
                        }

                        <p className="text-xs text-neutral-400 mt-4 text-center">Scan to open the payment page instantly</p>

                        <button onClick={() => { const a = document.createElement("a"); a.href = qrDataUrl; a.download = `payment-${qrModal.id}.png`; a.click(); }}
                            disabled={!qrDataUrl}
                            className="mt-3 w-full bg-emerald-900 text-white py-3 rounded-2xl text-sm font-bold disabled:opacity-40 cursor-pointer hover:bg-emerald-800 transition-colors">
                            Download QR
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
