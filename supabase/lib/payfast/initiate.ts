// lib/payfast/initiate.ts
import crypto from 'crypto'
import { PayFastPayload } from '@/types'

const PAYFAST_SANDBOX_URL = 'https://sandbox.payfast.co.za/eng/process'
const PAYFAST_LIVE_URL = 'https://www.payfast.co.za/eng/process'

const isSandbox = process.env.PAYFAST_SANDBOX === 'true'

export const PAYFAST_URL = isSandbox ? PAYFAST_SANDBOX_URL : PAYFAST_LIVE_URL

// Build a URL-encoded query string from an object, sorted by key.
// PayFast requires alphabetical key ordering for signature generation.
function buildQueryString(params: Record<string, string>, encode = true): string {
    return Object.keys(params)
        .sort()
        .filter(k => params[k] !== '' && params[k] !== undefined)
        .map(k => `${k}=${encode ? encodeURIComponent(params[k]).replace(/%20/g, '+') : params[k]}`)
        .join('&')
}

export function generateSignature(params: Record<string, string>): string {
    const passphrase = process.env.PAYFAST_PASSPHRASE ?? ''
    const queryString = buildQueryString(params, false)
    const stringToHash = passphrase
        ? `${queryString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`
        : queryString

    return crypto.createHash('md5').update(stringToHash).digest('hex')
}

export function buildPayFastPayload({
    paymentId,
    amount,
    description,
    payerEmail,
    payerName,
}: {
    paymentId: string
    amount: number
    description: string
    payerEmail: string
    payerName: string
}): PayFastPayload {
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

    const params: Record<string, string> = {
        merchant_id: process.env.PAYFAST_MERCHANT_ID!,
        merchant_key: process.env.PAYFAST_MERCHANT_KEY!,
        return_url: `${APP_URL}/payments/success?id=${paymentId}`,
        cancel_url: `${APP_URL}/payments/cancelled?id=${paymentId}`,
        notify_url: `${APP_URL}/api/payments/payfast/notify`,
        name_first: payerName.split(' ')[0] ?? payerName,
        email_address: payerEmail,
        m_payment_id: paymentId,
        amount: amount.toFixed(2),
        item_name: description.slice(0, 100), // PayFast max 100 chars
    }

    const signature = generateSignature(params)

    return { ...params, signature } as PayFastPayload
}