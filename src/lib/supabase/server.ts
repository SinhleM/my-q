/**
 * FILE: src/lib/supabase/server.ts
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * USER CLIENT (SSR - safe, uses auth cookies)
 */
export async function createClient() {
    const cookieStore = cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        try {
                            cookieStore.set(name, value, options);
                        } catch {
                            // ignore server component restriction
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