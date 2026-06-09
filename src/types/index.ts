// types/index.ts
export type Profile = {
    id: string
    username: string
    display_name: string | null
    bio: string | null
    phone: string | null
    email: string | null
    website: string | null
    twitter: string | null
    linkedin: string | null
    instagram: string | null
    accept_files: boolean
    accept_payments: boolean
    max_file_size_mb: number
    scan_count: number
    created_at: string
    updated_at: string
}

export type QRCode = {
    id: string
    user_id: string
    label: string
    is_active: boolean
    expires_at: string | null
    scan_count: number
    created_at: string
}

export type ScanEvent = {
    id: string
    qr_id: string
    profile_id: string
    ip_hash: string | null
    user_agent: string | null
    scanned_at: string
}

export type FileRecord = {
    id: string
    owner_id: string
    sender_id: string | null
    storage_path: string
    file_name: string
    file_size: number
    mime_type: string | null
    is_shared: boolean
    deleted_at: string | null
    created_at: string
}

export type PaymentStatus = 'pending' | 'paid' | 'cancelled' | 'failed'

export type PaymentRequest = {
    id: string
    owner_id: string
    payer_id: string | null
    payer_email: string | null
    amount: number
    currency: string
    description: string | null
    status: PaymentStatus
    payfast_pf_payment_id: string | null
    payfast_m_payment_id: string | null
    expires_at: string | null
    paid_at: string | null
    created_at: string
    updated_at: string
}

// API response wrappers
export type ApiSuccess<T> = { data: T; error: null }
export type ApiError = { data: null; error: string }
export type ApiResponse<T> = ApiSuccess<T> | ApiError

// PayFast
export type PayFastPayload = {
    merchant_id: string
    merchant_key: string
    return_url: string
    cancel_url: string
    notify_url: string
    name_first: string
    email_address: string
    m_payment_id: string
    amount: string
    item_name: string
    item_description?: string
    signature: string
}

export type PayFastITN = {
    m_payment_id: string
    pf_payment_id: string
    payment_status: 'COMPLETE' | 'FAILED' | 'PENDING'
    item_name: string
    amount_gross: string
    amount_fee: string
    amount_net: string
    signature: string
}