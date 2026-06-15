"use client";

import { useEffect, useState, useRef } from "react";
import { Search, X, UserPlus, Users, Trash2 } from "lucide-react";

type Contact = {
    id: string;
    contact: { id: string; username: string; display_name: string | null };
};

type SearchResult = {
    id: string;
    username: string;
    display_name: string | null;
};

const initials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

export default function Network() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [requestingId, setRequestingId] = useState<string | null>(null);
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
    const [removing, setRemoving] = useState<string | null>(null);
    const [error, setError] = useState("");
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { loadContacts(); }, []);

    async function loadContacts() {
        const res = await fetch("/api/contacts");
        const json = await res.json();
        setContacts(json.data ?? []);
        setLoading(false);
    }

    function handleSearch(value: string) {
        setQuery(value);
        setError("");
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (value.trim().length < 2) { setResults([]); return; }

        searchTimeout.current = setTimeout(async () => {
            setSearching(true);
            const res = await fetch(`/api/contacts/search?q=${encodeURIComponent(value.trim())}`);
            const json = await res.json();
            setResults(json.data ?? []);
            setSearching(false);
        }, 300);
    }

    async function sendRequest(username: string, userId: string) {
        setRequestingId(userId);
        setError("");
        const res = await fetch("/api/contacts/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
        });
        const json = await res.json();
        setRequestingId(null);
        if (json.error) { setError(json.error); return; }
        setSentRequests((prev) => new Set(prev).add(userId));
    }

    async function removeContact(id: string) {
        setRemoving(id);
        await fetch(`/api/contacts/${id}`, { method: "DELETE" });
        setRemoving(null);
        setContacts((prev) => prev.filter((c) => c.id !== id));
    }

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
                <p className="text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">Network</p>
                <p className="text-white font-black text-xl">My Contacts</p>
                <p className="text-emerald-200/60 text-sm mt-1">
                    {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
                </p>

                <div className="mt-5 relative">
                    <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by username to connect..."
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full bg-emerald-950/40 text-white placeholder:text-emerald-400/60 rounded-2xl pl-10 pr-10 py-3 text-sm font-medium outline-none"
                    />
                    {query && (
                        <button
                            onClick={() => { setQuery(""); setResults([]); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-white cursor-pointer"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>
            </div>

            {/* SEARCH RESULTS */}
            {(results.length > 0 || searching || query.length >= 2) && (
                <div className="bg-white rounded-3xl px-5 py-5">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                        {searching ? "Searching..." : `Results for "${query}"`}
                    </p>

                    {!searching && results.length === 0 && (
                        <p className="text-sm text-neutral-400 py-2">No users found.</p>
                    )}

                    <div className="space-y-2">
                        {results.map((r) => {
                            const isContact = contacts.some((c) => c.contact.id === r.id);
                            const requested = sentRequests.has(r.id);
                            return (
                                <div key={r.id} className="flex items-center justify-between bg-neutral-50 rounded-2xl px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-black text-xs shrink-0">
                                            {initials(r.display_name || r.username)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-neutral-900">{r.display_name || r.username}</p>
                                            <p className="text-xs text-neutral-400">@{r.username}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => !isContact && !requested && sendRequest(r.username, r.id)}
                                        disabled={isContact || requested || requestingId === r.id}
                                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors disabled:opacity-60 ${
                                            isContact
                                                ? "bg-neutral-100 text-neutral-400 cursor-default"
                                                : requested
                                                ? "bg-emerald-50 text-emerald-700 cursor-default"
                                                : "bg-emerald-900 text-white hover:bg-emerald-800 cursor-pointer"
                                        }`}
                                    >
                                        {!isContact && !requested && <UserPlus size={12} />}
                                        {isContact ? "Connected" : requested ? "Request sent" : requestingId === r.id ? "Sending..." : "Request"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                </div>
            )}

            {/* CONTACTS LIST */}
            <div className="bg-white rounded-3xl px-5 py-5">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">My Contacts</p>

                {contacts.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-center">
                        <Users size={36} className="text-neutral-200 mb-3" />
                        <p className="text-sm font-bold text-neutral-500">No contacts yet</p>
                        <p className="text-xs text-neutral-400 mt-1">Search for a MY-Q username above and send a request</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {contacts.map((c) => (
                            <div key={c.id} className="flex items-center justify-between bg-neutral-50 rounded-2xl px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-black text-xs shrink-0">
                                        {initials(c.contact.display_name || c.contact.username)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-neutral-900">
                                            {c.contact.display_name || c.contact.username}
                                        </p>
                                        <p className="text-xs text-neutral-400">@{c.contact.username}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeContact(c.id)}
                                    disabled={removing === c.id}
                                    className="text-neutral-300 hover:text-red-500 cursor-pointer transition-colors disabled:opacity-40"
                                    title="Remove contact"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
