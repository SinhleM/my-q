// app/api/files/upload/route.ts
import { NextResponse } from 'next/server'

const ABSOLUTE_MAX_MB = 100

// POST /api/files/upload
// Body: multipart/form-data with fields: file, owner_username
// The uploader may or may not be authenticated.
export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const ownerUsername = formData.get('owner_username') as string | null

    if (!file || !ownerUsername) {
        return NextResponse.json({ data: null, error: 'Missing file or owner_username.' }, { status: 400 })
    }

    // Resolve the owner profile
    const { data: owner } = await supabase
        .from('profiles')
        .select('id, accept_files, max_file_size_mb')
        .eq('username', ownerUsername)
        .single()

    if (!owner) {
        return NextResponse.json({ data: null, error: 'Profile not found.' }, { status: 404 })
    }

    if (!owner.accept_files) {
        return NextResponse.json({ data: null, error: 'This user is not accepting files.' }, { status: 403 })
    }

    const maxBytes = Math.min(owner.max_file_size_mb, ABSOLUTE_MAX_MB) * 1024 * 1024
    if (file.size > maxBytes) {
        return NextResponse.json(
            { data: null, error: `File exceeds the ${owner.max_file_size_mb} MB limit.` },
            { status: 413 }
        )
    }

    const { path, error: uploadError } = await uploadFile(owner.id, file)
    if (uploadError) {
        return NextResponse.json({ data: null, error: uploadError }, { status: 500 })
    }

    // Insert the file record
    const { data: fileRecord, error: dbError } = await supabase
        .from('files')
        .insert({
            owner_id: owner.id,
            sender_id: user?.id ?? null,
            storage_path: path,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type || null,
            is_shared: false,
        })
        .select()
        .single()

    if (dbError) {
        return NextResponse.json({ data: null, error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ data: fileRecord, error: null }, { status: 201 })
}