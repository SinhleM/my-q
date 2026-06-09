// src/app/page.tsx
import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
        <span className="text-lg tracking-tight font-medium">my-q</span>
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-black transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-5xl font-medium tracking-tight leading-tight max-w-2xl">
          One QR code.<br />Everything you need to share.
        </h1>
        <p className="mt-6 text-lg text-gray-500 max-w-md">
          Share your contacts, send files, and get paid — all from a single scan. No app needed.
        </p>
        <div className="mt-10 flex items-center gap-4 flex-wrap justify-center">
          <Link
            href="/register"
            className="bg-brand text-white px-6 py-3 rounded-lg hover:bg-brand-hover transition-colors text-sm"
          >
            Create your QR identity
          </Link>
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-black transition-colors"
          >
            Already have one? Log in →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        {[
          {
            title: 'Share contacts',
            desc: 'Phone, email, socials — instantly saved to any device as a contact card.',
          },
          {
            title: 'Transfer files',
            desc: 'Anyone can upload or download files directly from your QR. No sign-up required.',
          },
          {
            title: 'Receive payments',
            desc: 'Create payment requests and get paid instantly via PayFast.',
          },
        ].map((f) => (
          <div key={f.title} className="px-10 py-12">
            <div className="w-2 h-2 rounded-full bg-brand mb-4" />
            <h3 className="font-medium mb-2">{f.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-8 py-6 flex items-center justify-between">
        <span className="text-xs text-gray-300">my-q</span>
        <span className="text-xs text-gray-300">Free forever</span>
      </footer>

    </main>
  )
}