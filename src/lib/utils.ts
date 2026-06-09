// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ApiResponse } from '@/types'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function ok<T>(data: T): ApiResponse<T> {
    return { data, error: null }
}

export function err(message: string): ApiResponse<never> {
    return { data: null, error: message }
}

// Hash an IP for privacy-safe scan logging
export async function hashIP(ip: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(ip + (process.env.IP_HASH_SALT ?? 'qr-salt'))
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 16) // 16 hex chars is enough for uniqueness checks
}

// Get real client IP from Next.js request headers
export function getClientIP(request: Request): string {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        request.headers.get('x-real-ip') ??
        'unknown'
    )
}

export function isValidUsername(username: string): boolean {
    return /^[a-z0-9_]{3,30}$/.test(username)
}