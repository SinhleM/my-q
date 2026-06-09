// app/(dashboard)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import QRCard from '@/components/qr/QRCard'
import { generateQRDataURL } from '@/lib/qr/generate'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('profiles')
        .select('*, qr_codes(scan_count)')
        .eq('id', user!.id)
        .single()

    const { data: recentFiles } = await supabase
        .from('files')
        .select('id, file_name, file_size, created_at')
        .eq('owner_id', user!.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(5)

    const { data: recentPayments } = await supabase
        .from('payment_requests')
        .select('id, amount, description, status, created_at')
        .eq('owner_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5)

    const qrDataUrl = await generateQRDataURL(profile.username)
    const totalScans = profile.scan_count ?? 0

    return (
        <div className="flex flex-col gap-10">
            <div>
                <h1 className="text-2xl font-medium tracking-tight">Overview</h1>
                <p className="text-sm text-gray-500 mt-1">Everything tied to your QR identity.</p>
            </div>

            {/* QR + stats row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <QRCard dataUrl={qrDataUrl} username={profile.username} />

                <div className="flex flex-col gap-4">
                    <Stat label="Total scans" value={totalScans} />
                    <Stat label="Files received" value={recentFiles?.length ?? 0} />
                    <Stat
                        label="Payments"
                        value={recentPayments?.filter(p => p.status === 'paid').length ?? 0}
                        suffix="paid"
                    />
                </div>
            </div>

            {/* Recent files */}
            <Section title="Recent files">
                {recentFiles && recentFiles.length > 0 ? (
                    <div className="flex flex-col divide-y divide-gray-100">
                        {recentFiles.map(f => (
                            <div key={f.id} className="flex items-center justify-between py-3">
                                <span className="text-sm truncate max-w-xs">{f.file_name}</span>
                                <span className="text-xs text-gray-400">
                                    {new Date(f.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400">No files yet.</p>
                )}
            </Section>

            {/* Recent payments */}
            <Section title="Recent payments">
                {recentPayments && recentPayments.length > 0 ? (
                    <div className="flex flex-col divide-y divide-gray-100">
                        {recentPayments.map(p => (
                            <div key={p.id} className="flex items-center justify-between py-3">
                                <div>
                                    <span className="text-sm">{p.description}</span>
                                    <span className="ml-2 text-xs text-gray-400">
                                        R{Number(p.amount).toFixed(2)}
                                    </span>
                                </div>
                                <StatusBadge status={p.status} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400">No payment requests yet.</p>
                )}
            </Section>
        </div>
    )
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
    return (
        <div className="border border-gray-100 rounded-xl p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="text-3xl font-medium mt-1">
                {value}
                {suffix && <span className="text-sm text-gray-400 ml-1">{suffix}</span>}
            </p>
        </div>
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h2 className="text-sm font-medium uppercase tracking-wide text-gray-400 mb-4">{title}</h2>
            {children}
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        paid: 'bg-brand-light text-brand',
        pending: 'bg-gray-100 text-gray-500',
        cancelled: 'bg-gray-100 text-gray-400',
        failed: 'bg-red-50 text-red-500',
    }
    return (
        <span className={`text-xs px-2 py-1 rounded-full ${map[status] ?? 'bg-gray-100 text-gray-400'}`}>
            {status}
        </span>
    )
}