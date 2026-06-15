"use client";

import { AtSign, Link2, Camera } from "lucide-react";

type Props = {
    twitter?: string | null;
    linkedin?: string | null;
    instagram?: string | null;
};

export default function SocialsSection({ twitter, linkedin, instagram }: Props) {
    const hasSocials = twitter || linkedin || instagram;
    if (!hasSocials) return null;

    return (
        <div className="bg-white rounded-3xl p-5 space-y-3">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Socials</p>
            <div className="flex flex-wrap gap-2">
                {twitter && (
                    <a
                        href={`https://twitter.com/${twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-sky-50 hover:bg-sky-100 transition-colors text-sky-600 font-bold text-sm px-4 py-2.5 rounded-2xl"
                    >
                        <AtSign size={14} />
                        {twitter}
                    </a>
                )}
                {linkedin && (
                    <a
                        href={`https://linkedin.com/in/${linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 transition-colors text-blue-600 font-bold text-sm px-4 py-2.5 rounded-2xl"
                    >
                        <Link2 size={14} />
                        {linkedin}
                    </a>
                )}
                {instagram && (
                    <a
                        href={`https://instagram.com/${instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-pink-50 hover:bg-pink-100 transition-colors text-pink-500 font-bold text-sm px-4 py-2.5 rounded-2xl"
                    >
                        <Camera size={14} />
                        @{instagram}
                    </a>
                )}
            </div>
        </div>
    );
}
