// app/api/payments/payfast/notify/route.ts
import { NextResponse } from 'next/server'
import { verifySignature, verifySourceIP, verifyWithPayFast, parseITNBody } from '@/lib/payfast/verify'
import { getClientIP } from '@/lib/utils'

// POST /api/payments/payfast/notify
// PayFast calls this URL after every transaction (ITN = Instant Transaction Notification).
// Must return HTTP 200 quickly — any other status causes PayFast to retry.
export async function POST(request: Request) {
    const rawBody = await request.text()

    // Step 1: Verify source IP
    const ip = getClientIP(request)
    if (!verifySourceIP(ip)) {
        console.warn(`[PayFast ITN] Rejected request from IP: ${ip}`)
        return new NextResponse('Forbidden', { status: 403 })
    }

    // Step 2: Parse body
    const params = parseITNBody(rawBody)

    // Step 3: Verify signature
    if (!verifySignature(params)) {
        console.warn('[PayFast ITN] Invalid signature')
        return new NextResponse('Bad signature', { status: 400 })
    }

    // Step 4: Confirm with PayFast servers
    const isValid = await verifyWithPayFast(rawBody)
    if (!isValid) {
        console.warn('[PayFast ITN] PayFast validation failed')
        return new NextResponse('Validation failed', { status: 400 })
    }

    const { m_payment_id, pf_payment_id, payment_status, amount_gross } = params

    // Service client bypasses RLS — safe here because this is a trusted server-to-server call
    const supabase = createServiceClient()

    const { data: paymentRequest } = await supabase
        .from('payment_requests')
        .select('id, amount, status')
        .eq('id', m_payment_id)
        .single()

    if (!paymentRequest) {
        console.error(`[PayFast ITN] Payment request not found: ${m_payment_id}`)
        // Still return 200 so PayFast doesn't keep retrying for a non-existent record
        return new NextResponse('OK', { status: 200 })
    }

    // Guard: don't process already-completed payments
    if (paymentRequest.status !== 'pending') {
        return new NextResponse('OK', { status: 200 })
    }

    // Verify amount matches (prevents partial payment attacks)
    const expectedAmount = Number(paymentRequest.amount).toFixed(2)
    const receivedAmount = Number(amount_gross).toFixed(2)
    if (expectedAmount !== receivedAmount) {
        console.error(`[PayFast ITN] Amount mismatch. Expected ${expectedAmount}, got ${receivedAmount}`)
        return new NextResponse('Amount mismatch', { status: 400 })
    }

    // Map PayFast status to our enum
    const statusMap: Record<string, string> = {
        COMPLETE: 'paid',
        FAILED: 'failed',
        PENDING: 'pending',
    }

    const newStatus = statusMap[payment_status] ?? 'failed'

    await supabase
        .from('payment_requests')
        .update({
            status: newStatus,
            payfast_pf_payment_id: pf_payment_id,
            payfast_m_payment_id: m_payment_id,
            paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
        })
        .eq('id', m_payment_id)

    return new NextResponse('OK', { status: 200 })
}