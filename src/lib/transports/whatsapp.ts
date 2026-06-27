export function buildWhatsAppLink(message: string): string {
    const encoded = encodeURIComponent(message);
    return `https://wa.me/?text=${encoded}`;
}

export function buildWhatsAppMessageForFile(fileName: string, fileUrl: string): string {
    return `Hey 👋\n\nI've shared a file with you via MYQ:\n\n📎 *${fileName}*\n${fileUrl}\n\n_Sent via MYQ_`;
}
