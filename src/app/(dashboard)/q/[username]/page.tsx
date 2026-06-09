// app/q/[username]/page.tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { hashIP } from '@/lib/utils'
import ContactSection from '@/components/profile/ContactSection'
import FileUploadSection from '@/components/files/FileUploadSection'
import PaySection from '@/components/payments/PaySection'

export const revalidate = 0

export default async function PublicProfilePage({
    params,
}: {
    params: Promise<{ username: string }>
}) {
    const { username } = await params
    const supabase = await createClient()

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

    if (!profile) notFound()

    // Fetch active QR code
    const { data: qr } = await supabase
        .from('qr_codes')
        .select('id')
        .eq('user_id', profile.id)
        .eq('is_active', true)
        .single()

    // Log scan (fire and forget)
    if (qr) {
        const headersList = await headers()
        const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
        const ipHash = await hashIP(ip)
        const userAgent = headersList.get('user-agent') ?? null

        supabase.from('scan_events').insert({
            qr_id: qr.id,
            profile_id: profile.id,
            ip_hash: ipHash,
            user_agent: userAgent,
        }).then(() => { })

        supabase.from('profiles').update({
            scan_count: profile.scan_count + 1,
        }).eq('id', profile.id).then(() => { })
    }

    // Shared files
    const { data: sharedFiles } = await supabase
        .from('files')
        .select('id, file_name, file_size, mime_type')
        .eq('owner_id', profile.id)
        .eq('is_shared', true)
        .is('deleted_at', null)

    // Active payment requests
    const { data: paymentRequests } = await supabase
        .from('payment_requests')
        .select('id, amount, description, currency')
        .eq('owner_id', profile.id)
        .eq('status', 'pending')

    return (
        <main className="min-h-screen bg-white">
            {/* Header */}
            <div className="border-b border-gray-100 px-6 py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center mx-auto mb-4">
                    <span className="text-brand text-lg font-medium">
                        {(profile.display_name ?? profile.username).charAt(0).toUpperCase()}
                    </span>
                </div>
                <h1 className="text-xl font-medium tracking-tight">
                    {profile.display_name ?? profile.username}
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">@{profile.username}</p>
                {profile.bio && (
                    <p className="text-sm text-gray-600 mt-3 max-w-xs mx-auto">{profile.bio}</p>
                )}
            </div>

            {/* Sections */}
            <div className="max-w-sm mx-auto px-6 py-8 flex flex-col gap-8">
                <ContactSection profile={profile} />

                {profile.accept_files && (
                    <FileUploadSection
                        ownerUsername={profile.username}
                        sharedFiles={sharedFiles ?? []}
                    />
                )}

                {profile.accept_payments && paymentRequests && paymentRequests.length > 0 && (
                    <PaySection payments={paymentRequests} ownerName={profile.display_name ?? profile.username} />
                )}
            </div>

            {/* Footer */}
            <div className="text-center py-8 border-t border-gray-100">
                <p className="text-xs text-gray-300">
                    Powered by <span className="text-gray-400">QR Identity</span>
                </p>
            </div>
        </main>
    )
}