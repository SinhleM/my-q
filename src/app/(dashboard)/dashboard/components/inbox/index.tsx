"use client";

import { useEffect, useState } from "react";
import { CheckCheck, XCircle, Bell, UserCheck, FileDown, FileText } from "lucide-react";
import PaymentCheckoutModal from "../payments/checkout-modal";

type ContactRequest = {
    id: string;
    created_at: string;
    sender: { id: string; username: string; display_name: string | null };
};

type ReceivedPayment = {
    id: string;
    amount: number;
    description: string;
    status: string;
    created_at: string;
    owner: { username: string; display_name: string | null };
};

type ReceivedFile = {
    id: string;
    file_name: string;
    file_size: number;
    file_type: string;
    storage_path: string;
    created_at: string;
};

const initials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

export default function Inbox() {
    const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
    const [payments, setPayments] = useState<ReceivedPayment[]>([]);
    const [files, setFiles] = useState<ReceivedFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [respondingId, setRespondingId] = useState<string | null>(null);
    const [checkoutId, setCheckoutId] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            fetch("/api/contacts/requests").then((r) => r.json()),
            fetch("/api/payments/received").then((r) => r.json()),
            fetch("/api/inbox/files").then((r) => r.json()),
        ]).then(([cr, pr, fr]) => {
            setContactRequests(cr.data ?? []);
            setPayments(pr.data ?? []);
            setFiles(fr.data ?? []);
            setLoading(false);
        });
    }, []);

    async function respondToContact(id: string, action: "accept" | "decline") {
        setRespondingId(id);
        await fetch(`/api/contacts/requests/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action }),
        });
        setRespondingId(null);
        setContactRequests((prev) => prev.filter((r) => r.id !== id));
    }

    const totalPending =
        contactRequests.length +
        payments.filter((p) => p.status === "pending").length +
        files.length;

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-36 bg-neutral-100 animate-pulse rounded-3xl" />
                <div className="h-48 bg-neutral-100 animate-pulse rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-10">

            {/* HERO */}
            <div className="bg-emerald-900 rounded-3xl px-6 pt-8 pb-6">
                <p className="text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">Inbox</p>
                <p className="text-white font-black text-xl">Your Requests</p>
                <p className="text-emerald-200/60 text-sm mt-1">
                    {totalPending > 0
                        ? `${totalPending} item${totalPending !== 1 ? "s" : ""} waiting`
                        : "All caught up"}
                </p>
            </div>

            {/* ── PAYMENT REQUESTS ── */}
            <div className="bg-white rounded-3xl px-5 py-5">
                <div className="flex items-center gap-2 mb-4">
                    <Bell size={14} className="text-emerald-700" />
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Payment Requests</p>
                    {payments.filter(p => p.status === "pending").length > 0 && (
                        <span className="ml-auto text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            {payments.filter(p => p.status === "pending").length} pending
                        </span>
                    )}
                </div>

                {payments.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-center">
                        <Bell size={32} className="text-neutral-200 mb-2" />
                        <p className="text-sm font-bold text-neutral-400">No payment requests</p>
                        <p className="text-xs text-neutral-400 mt-1">When someone sends you a payment request it appears here</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {payments.map((p) => (
                            <div key={p.id} className="flex items-center justify-between bg-neutral-50 rounded-2xl px-4 py-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-black text-xs shrink-0">
                                        {initials(p.owner?.display_name || p.owner?.username || "?")}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm text-neutral-900 truncate">{p.description}</p>
                                        <p className="text-xs text-neutral-400">
                                            from @{p.owner?.username} · R {p.amount} · {timeAgo(p.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        p.status === "pending" ? "bg-amber-100 text-amber-700" :
                                        p.status === "paid" ? "bg-emerald-100 text-emerald-700" :
                                        "bg-neutral-100 text-neutral-500"
                                    }`}>
                                        {p.status}
                                    </span>
                                    {p.status === "pending" && (
                                        <button
                                            onClick={() => setCheckoutId(p.id)}
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

            {/* ── CONTACT REQUESTS ── */}
            <div className="bg-white rounded-3xl px-5 py-5">
                <div className="flex items-center gap-2 mb-4">
                    <UserCheck size={14} className="text-emerald-700" />
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Contact Requests</p>
                    {contactRequests.length > 0 && (
                        <span className="ml-auto text-[10px] font-black bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                            {contactRequests.length} new
                        </span>
                    )}
                </div>

                {contactRequests.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-center">
                        <UserCheck size={32} className="text-neutral-200 mb-2" />
                        <p className="text-sm font-bold text-neutral-400">No contact requests</p>
                        <p className="text-xs text-neutral-400 mt-1">When someone wants to connect with you it appears here</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {contactRequests.map((r) => (
                            <div key={r.id} className="flex items-center justify-between bg-neutral-50 rounded-2xl px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-sky-800 font-black text-xs shrink-0">
                                        {initials(r.sender.display_name || r.sender.username)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-neutral-900">
                                            {r.sender.display_name || r.sender.username}
                                        </p>
                                        <p className="text-xs text-neutral-400">@{r.sender.username} · {timeAgo(r.created_at)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 ml-3">
                                    <button
                                        onClick={() => respondToContact(r.id, "accept")}
                                        disabled={respondingId === r.id}
                                        title="Accept"
                                        className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-emerald-900 text-white rounded-xl cursor-pointer hover:bg-emerald-800 transition-colors disabled:opacity-40">
                                        <CheckCheck size={12} />
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => respondToContact(r.id, "decline")}
                                        disabled={respondingId === r.id}
                                        title="Decline"
                                        className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-neutral-100 text-neutral-500 rounded-xl cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40">
                                        <XCircle size={12} />
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── FILE DROPS ── */}
            <div className="bg-white rounded-3xl px-5 py-5">
                <div className="flex items-center gap-2 mb-4">
                    <FileDown size={14} className="text-emerald-700" />
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Files Received</p>
                    {files.length > 0 && (
                        <span className="ml-auto text-[10px] font-black bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                            {files.length} new
                        </span>
                    )}
                </div>

                {files.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-center">
                        <FileDown size={32} className="text-neutral-200 mb-2" />
                        <p className="text-sm font-bold text-neutral-400">No files received yet</p>
                        <p className="text-xs text-neutral-400 mt-1">Files dropped on your QR profile appear here</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {files.map((f) => (
                            <a
                                key={f.id}
                                href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/user-files/${f.storage_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between bg-neutral-50 rounded-2xl px-4 py-3 hover:bg-neutral-100 transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 shrink-0">
                                        <FileText size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm text-neutral-900 truncate">{f.file_name}</p>
                                        <p className="text-xs text-neutral-400">
                                            {(f.file_size / 1024 / 1024).toFixed(2)} MB · {timeAgo(f.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <FileDown size={15} className="text-neutral-400 shrink-0 ml-3" />
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* CHECKOUT MODAL */}
            {checkoutId && (
                <PaymentCheckoutModal
                    paymentId={checkoutId}
                    onClose={() => {
                        setCheckoutId(null);
                        fetch("/api/payments/received").then(r => r.json()).then(j => setPayments(j.data ?? []));
                    }}
                />
            )}
        </div>
    );
}
