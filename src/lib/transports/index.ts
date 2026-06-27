export type TransportType = "whatsapp";

export function getTransport(type: TransportType): TransportType {
    switch (type) {
        case "whatsapp":
            return "whatsapp";
        default:
            throw new Error(`Unsupported transport: ${type}`);
    }
}

export { buildWhatsAppLink, buildWhatsAppMessageForFile } from "./whatsapp";
