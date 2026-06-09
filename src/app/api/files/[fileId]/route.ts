// app/api/files/[fileId]/route.ts
import { NextResponse } from 'next/server'

// GET /api/files/[fileId] — returns a signed download URL
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ fileId: string }> }
) {
    const { fileId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: file } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .is('deleted_at', null)
        .single()

    if (!file) {
        return NextResponse.json({ data: null, error: 'File not found.' }, { status: 404 })
    }

    // Access control: owner or shared file
    const isOwner = user?.id === file.owner_id
    if (!file.is_shared && !isOwner) {
        return NextResponse.json({ data: null, error: 'Access denied.' }, { status: 403 })
    }

    const url = await getSignedDownloadUrl(file.storage_path)
    if (!url) {
        return NextResponse.json({ data: null, error: 'Could not generate download URL.' }, { status: 500 })
    }

    return NextResponse.json({
        data: { url, file_name: file.file_name, mime_type: file.mime_type },
        error: null,
    })
}

// PATCH /api/files/[fileId] — toggle is_shared
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ fileId: string }> }
) {
    const { fileId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ data: null, error: 'Unauthorised' }, { status: 401 })
    }

    const body = await request.json()
    const { is_shared } = body

    const { data, error } = await supabase
        .from('files')
        .update({ is_shared })
        .eq('id', fileId)
        .eq('owner_id', user.id)
        .select()
        .single()

    if (error) {
        return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, error: null })
}

// DELETE /api/files/[fileId] — soft delete + remove from storage
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ fileId: string }> }
) {
    const { fileId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ data: null, error: 'Unauthorised' }, { status: 401 })
    }

    const { data: file } = await supabase
        .from('files')
        .select('storage_path, owner_id')
        .eq('id', fileId)
        .single()

    if (!file || file.owner_id !== user.id) {
        return NextResponse.json({ data: null, error: 'File not found.' }, { status: 404 })
    }

    // Soft delete in DB first
    await supabase
        .from('files')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', fileId)

    // Best-effort storage deletion (don't fail the request if this errors)
    await deleteStorageFile(file.storage_path)

    return NextResponse.json({ data: { deleted: true }, error: null })
}