"use client";

interface Props {
    displayName: string;
    username: string;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    twitter?: string | null;
    linkedin?: string | null;
    instagram?: string | null;
    bio?: string | null;
}

export default function SaveContactButton(props: Props) {
    function downloadVCard() {
        const lines = [
            "BEGIN:VCARD",
            "VERSION:3.0",
            `FN:${props.displayName}`,
            `NICKNAME:${props.username}`,
        ];

        if (props.email)    lines.push(`EMAIL:${props.email}`);
        if (props.phone)    lines.push(`TEL:${props.phone}`);
        if (props.website)  lines.push(`URL:${props.website}`);
        if (props.bio)      lines.push(`NOTE:${props.bio.replace(/\n/g, "\\n")}`);
        if (props.twitter)  lines.push(`X-SOCIALPROFILE;type=twitter:https://twitter.com/${props.twitter}`);
        if (props.linkedin) lines.push(`X-SOCIALPROFILE;type=linkedin:https://linkedin.com/in/${props.linkedin}`);
        if (props.instagram)lines.push(`X-SOCIALPROFILE;type=instagram:https://instagram.com/${props.instagram}`);

        lines.push("END:VCARD");

        const blob = new Blob([lines.join("\r\n")], { type: "text/vcard" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href     = url;
        a.download = `${props.username}.vcf`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <button
            onClick={downloadVCard}
            className="w-full bg-white text-emerald-950 font-bold py-3 rounded-2xl text-sm hover:bg-emerald-50 transition-colors border border-white/40"
        >
            Save Contact
        </button>
    );
}
