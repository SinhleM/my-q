// src/components/Footer.tsx
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="w-full border-t border-neutral-100 bg-white px-6 py-6 mt-auto">
            <div className="max-w-5xl w-full mx-auto flex items-center justify-between">

                {/* Logo replacing the old text tag */}
                <Image
                    src="/myq-logo-removebg.png"
                    alt="logo"
                    width={24}
                    height={24}
                    className="object-contain opacity-40 grayscale"
                />

                {/* Cleaner state tag */}
                <span className="bg-emerald-950/5 text-emerald-950 px-3 py-1 rounded-full text-[11px] font-bold tracking-tight">
                    Free
                </span>

            </div>
        </footer>
    );
}