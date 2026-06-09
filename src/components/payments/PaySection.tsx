// components/payments/PaySection.tsx
'use client'

import { useState } from 'react'

type PaymentOption = {
    id: string
    amount: number
    description: string
    currency: string
}

export default function PaySection({
    payments,
    ownerName,
}: {
    payments: PaymentOption[]
    ownerName: string
}) {
    const [selected, setSelected] = useState<PaymentOption | null>(null)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handlePay(e: React.FormEvent) {
        e.preventDefault()
        if (!selected) return

        setLoading(true)
        setError(null)

        const res = await fetch('/api/payments/payfast/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                payment_request_id: selected.id,
                payer_name: name,
                payer_email: email,
            }),
        })

        const data = await res.json()
        setLoading(false)

        if (data.error) {
            setError(data.error)
            return
        }

        // Build and submit a hidden PayFast form
        const { payfast_url, payload } = data.data
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = payfast_url

        Object.entries(payload).forEach(([key, value]) => {
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = key
            input.value = String(value)
            form.appendChild(input)
        })

        document.body.appendChild(form)
        form.submit()
    }

    return (
        <section className="flex flex-col gap-4">
            <h2 className="text-xs text-gray-400 uppercase tracking-wide">Pay {ownerName}</h2>

            {/* Payment options */}
            <div className="flex flex-col gap-2">
                {payments.map(p => (
                    <button
                        key={p.id}
                        onClick={() => setSelected(selected?.id === p.id ? null : p)}
                        className={`flex items-center justify-between border rounded-xl px-4 py-3 transition-colors text-left ${selected?.id === p.id
                                ? 'border-brand bg-brand-light'
                                : 'border-gray-100 hover:border-gray-300'
                            }`}
                    >
                        <span className="text-sm">{p.description}</span>
                        <span className="text-sm font-medium">R{Number(p.amount).toFixed(2)}</span>
                    </button>
                ))}
            </div>

            {/* Pay form */}
            {selected && (
                <form onSubmit={handlePay} className="flex flex-col gap-3 mt-2">
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Your name"
                        className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand transition-colors"
                    />
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Your email"
                        className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand transition-colors"
                    />

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-brand text-white py-3 rounded-xl text-sm hover:bg-brand-hover transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Redirecting…' : `Pay R${Number(selected.amount).toFixed(2)}`}
                    </button>
                </form>
            )}
        </section>
    )
}