// app/api/profile/route.ts
import { NextResponse } from 'next/server'

// GET /api/profile — returns the authenticated user's profile
export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ data: null, error: 'Unauthorised' }, { status: 401 })
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error) {
        return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, error: null })
}

// PATCH /api/profile — update mutable profile fields
export async function PATCH(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ data: null, error: 'Unauthorised' }, { status: 401 })
    }

    const body = await request.json()

    const allowed = [
        'username', 'display_name', 'bio', 'phone', 'website',
        'twitter', 'linkedin', 'instagram',
        'accept_files', 'accept_payments', 'max_file_size_mb',
    ]

    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
        if (key in body) updates[key] = body[key]
    }

    // Validate username if being changed
    if (updates.username) {
        if (!isValidUsername(updates.username as string)) {
            return NextResponse.json(
                { data: null, error: 'Username must be 3–30 characters: lowercase letters, numbers, underscores only.' },
                { status: 400 }
            )
        }

        // Check uniqueness
        const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', updates.username)
            .neq('id', user.id)
            .maybeSingle()

        if (existing) {
            return NextResponse.json({ data: null, error: 'Username already taken.' }, { status: 409 })
        }
    }

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ data: null, error: 'No valid fields to update.' }, { status: 400 })
    }

    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

    if (error) {
        return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, error: null })
}