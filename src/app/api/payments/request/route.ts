// app/api/payments/request/route.ts
import { NextResponse } from 'next/server' — owner creates a payment request
export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ data: null, error: 'Unauthorised' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, description, expires_at } = body

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        return NextResponse.json({ data: null, error: 'Invalid amount.' }, { status: 400 })
    }

    if (!description?.trim()) {
        return NextResponse.json({ data: null, error: 'Description is required.' }, { status: 400 })
    }

    const { data, error } = await supabase
        .from('payment_requests')
        .insert({
            owner_id: user.id,
            amount: Number(amount).toFixed(2),
            currency: 'ZAR',
            description: description.trim(),
            expires_at: expires_at ?? null,
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, error: null }, { status: 201 })
}

// GET /api/payments/request — list the authenticated user's payment requests
export async function GET(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ data: null, error: 'Unauthorised' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // optional filter

    let query = supabase
        .from('payment_requests')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

    if (status) {
        query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, error: null })
}