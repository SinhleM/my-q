// app/api/payments/payfast/initiate/route.ts
import { NextResponse } from 'next/server'

// POST /api/payments/payfast/initiate
// Body: { payment_request_id, payer_name, payer_email }
// Returns the PayFast form payload + redirect URL so the client can POST to PayFast
export async function POST(request: Request) {
    const supabase = await createClient()

    const body = await request.json()
    const { payment_request_id, payer_name, payer_email } = body

    if (!payment_request_id || !payer_name || !payer_email) {
        return NextResponse.json(
            { data: null, error: 'payment_request_id, payer_name, and payer_email are required.' },
            { status: 400 }
        )
    }

    // Load the payment request — only pending ones can be paid
    const { data: paymentRequest } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('id', payment_request_id)
        .eq('status', 'pending')
        .single()

    if (!paymentRequest) {
        return NextResponse.json(
            { data: null, error: 'Payment request not found or already completed.' },
            { status: 404 }
        )
    }

    // Check expiry
    if (paymentRequest.expires_at && new Date(paymentRequest.expires_at) < new Date()) {
        return NextResponse.json({ data: null, error: 'Payment request has expired.' }, { status: 410 })
    }

    const payload = buildPayFastPayload({
        paymentId: paymentRequest.id,
        amount: Number(paymentRequest.amount),
        description: paymentRequest.description ?? 'Payment',
        payerEmail: payer_email,
        payerName: payer_name,
    })

    // Store payer email on the request for reference
    await supabase
        .from('payment_requests')
        .update({ payer_email })
        .eq('id', payment_request_id)

    return NextResponse.json({
        data: {
            payfast_url: PAYFAST_URL,
            payload,
        },
        error: null,
    })
}