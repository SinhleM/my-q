// components/profile/ContactSection.tsx
'use client'

import { Profile } from '@/types'

export default function ContactSection({ profile }: { profile: Profile }) {
    const contacts = [
        profile.phone && { label: 'Phone', value: profile.phone, href: `tel:${profile.phone}` },
        profile.email && { label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
        profile.website && { label: 'Website', value: profile.website, href: profile.website },
        profile.twitter && { label: 'Twitter', value: `@${profile.twitter}`, href: `https://twitter.com/${profile.twitter}` },
        profile.linkedin && { label: 'LinkedIn', value: profile.linkedin, href: `https://linkedin.com/in/${profile.linkedin}` },
        profile.instagram && { label: 'Instagram', value: `@${profile.instagram}`, href: `https://instagram.com/${profile.instagram}` },
    ].filter(Boolean) as { label: string; value: string; href: string }[]

    function handleSaveContact() {
        const lines = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${profile.display_name ?? profile.username}`,
            profile.phone ? `TEL:${profile.phone}` : '',
            profile.email ? `EMAIL:${profile.email}` : '',
            profile.website ? `URL:${profile.website}` : '',
            'END:VCARD',
        ].filter(Boolean).join('\n')

        const blob = new Blob([lines], { type: 'text/vcard' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${profile.username}.vcf`
        a.click()
        URL.revokeObjectURL(url)
    }

    if (contacts.length === 0) return null

    return (
        <section className="flex flex-col gap-4">
            <h2 className="text-xs text-gray-400 uppercase tracking-wide">Contact</h2>
            <div className="flex flex-col gap-2">
                {contacts.map(c => (
                    <a
                        key={c.label}
                        href={c.href}
                        target={c.href.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 hover:border-gray-300 transition-colors"
                    >
                        <span className="text-xs text-gray-400">{c.label}</span>
                        <span className="text-sm truncate max-w-[60%] text-right">{c.value}</span>
                    </a>
                ))}
            </div>
            <button
                onClick={handleSaveContact}
                className="w-full border border-brand text-brand text-sm py-3 rounded-xl hover:bg-brand hover:text-white transition-colors"
            >
                Save contact
            </button>
        </section>
    )
}