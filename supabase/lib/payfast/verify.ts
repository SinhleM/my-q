import crypto from 'crypto'
import { generateSignature } from './initiate'
import { PayFastITN } from '@/types'

const PAYFAST_VALID_IPS = [
    '197.97.145.144',
    '197.97.145.145',
    '197.97.145.146',
    '197.97.145.147',
    '41.74.179.194',
    '41.74.179.195',
    '41.74.179.196',
    '41.74.179.197',
]

// Step 1: Verify the signature matches
export function verifySignature(params: Record<string, string>): boolean {
    const { signature, ...rest } = params
    const expected = generateSignature(rest)
    return signature === expected
}

// Step 2: Verify the request came from a PayFast IP
export function verifySourceIP(ip: string): boolean {
    if (process.env.PAYFAST_SANDBOX === 'true') return true
    return PAYFAST_VALID_IPS.includes(ip)
}

// Step 3: Confirm payment data with PayFast's server (prevents replay attacks)
export async function verifyWithPayFast(rawBody: string): Promise<boolean> {
    const isSandbox = process.env.PAYFAST_SANDBOX === 'true'
    const validationUrl = isSandbox
        ? 'https://sandbox.payfast.co.za/eng/query/validate'
        : 'https://www.payfast.co.za/eng/query/validate'

    try {
        const response = await fetch(validationUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: rawBody,
        })
        const text = await response.text()
        return text.trim() === 'VALID'
    } catch {
        return false
    }
}

// Parse raw URL-encoded ITN body into a typed object
export function parseITNBody(rawBody: string): Record<string, string> {
    return Object.fromEntries(new URLSearchParams(rawBody))
}