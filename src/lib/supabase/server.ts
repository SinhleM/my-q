/**
 * FILE: src/lib/supabase/server.ts
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * USER CLIENT (SSR - safe, uses auth cookies)
 */
export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },

                setAll(
                    cookiesToSet: {
                        name: string;
                        value: string;
                        options?: Record<string, unknown>;
                    }[]
                ) {
                    cookiesToSet.forEach((cookie) => {
                        try {
                            cookieStore.set(
                                cookie.name,
                                cookie.value,
                                cookie.options as any
                            );
                        } catch {
                            // Server Component restriction (safe ignore)
                        }
                    });
                },
            },
        }
    );
}

/**
 * ADMIN CLIENT (SERVICE ROLE - bypasses RLS)
 */
export function createServiceClient() {
    const { createClient } = require("@supabase/supabase-js");

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}