// src/components/Header.tsx
import Link from "next/link";
import Image from "next/image";

export default function Header() {
    return (
        <nav className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-100 px-6 py-4">
            <div className="max-w-5xl w-full mx-auto flex items-center justify-between">

                {/* Only the Logo Icon */}
                <Link href="/" className="flex items-center active:scale-98 transition-transform">
                    <Image
                        src="/myq-logo-removebg.png"
                        alt="logo"
                        width={34}
                        height={34}
                        className="object-contain"
                        priority
                    />
                </Link>

                {/* Navigation Action Buttons with Shaper Text */}
                <div className="flex items-center gap-6">
                    <Link
                        href="/login"
                        className="text-sm font-semibold tracking-tight text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                        Log in
                    </Link>
                    <Link
                        href="/register"
                        className="text-sm font-bold tracking-tight bg-emerald-950 hover:bg-emerald-900 text-white px-5 py-2.5 rounded-full transition-all duration-200 active:scale-95 shadow-sm"
                    >
                        Get started
                    </Link>
                </div>

            </div>
        </nav>
    );
}