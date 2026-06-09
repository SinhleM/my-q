// app/api/payments/[paymentId]/route.ts
import { NextResponse } from 'next/server' — public lookup for payers on the QR page
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ paymentId: string }> }
) {
    const { paymentId } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('payment_requests')
        .select('id, amount, currency, description, status, expires_at, created_at')
        .eq('id', paymentId)
        .single()

    if (error || !data) {
        return NextResponse.json({ data: null, error: 'Payment request not found.' }, { status: 404 })
    }

    return NextResponse.json({ data, error: null })
}

// PATCH /api/payments/[paymentId] — owner cancels a pending request
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ paymentId: string }> }
) {
    const { paymentId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ data: null, error: 'Unauthorised' }, { status: 401 })
    }

    const body = await request.json()

    // Only allow cancellation via this route
    if (body.status !== 'cancelled') {
        return NextResponse.json({ data: null, error: 'Only cancellation is allowed via this endpoint.' }, { status: 400 })
    }

    const { data, error } = await supabase
        .from('payment_requests')
        .update({ status: 'cancelled' })
        .eq('id', paymentId)
        .eq('owner_id', user.id)
        .eq('status', 'pending')
        .select()
        .single()

    if (error || !data) {
        return NextResponse.json({ data: null, error: 'Could not cancel payment request.' }, { status: 404 })
    }

    return NextResponse.json({ data, error: null })
}