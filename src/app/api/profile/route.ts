/**
 * FILE: src/app/api/profile/route.ts
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Username validation helper
 */
function isValidUsername(username: string) {
    return /^[a-z0-9_]{3,30}$/.test(username);
}

// GET — fetch authenticated user's profile
export async function GET() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
            { data: null, error: "Unauthorised" },
            { status: 401 }
        );
    }

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error) {
        return NextResponse.json(
            { data: null, error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json({ data, error: null });
}

// PATCH — update profile
export async function PATCH(request: Request) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
            { data: null, error: "Unauthorised" },
            { status: 401 }
        );
    }

    const body = await request.json();

    const allowed = [
        "username",
        "display_name",
        "bio",
        "phone",
        "website",
        "twitter",
        "linkedin",
        "instagram",
        "accept_files",
        "accept_payments",
        "max_file_size_mb",
    ];

    const updates: Record<string, unknown> = {};

    for (const key of allowed) {
        if (key in body) updates[key] = body[key];
    }

    // Username validation
    if (updates.username) {
        const username = updates.username as string;

        if (!isValidUsername(username)) {
            return NextResponse.json(
                {
                    data: null,
                    error:
                        "Username must be 3–30 chars: lowercase letters, numbers, underscores only.",
                },
                { status: 400 }
            );
        }

        const { data: existing } = await supabase
            .from("profiles")
            .select("id")
            .eq("username", username)
            .neq("id", user.id)
            .maybeSingle();

        if (existing) {
            return NextResponse.json(
                { data: null, error: "Username already taken." },
                { status: 409 }
            );
        }
    }

    if (Object.keys(updates).length === 0) {
        return NextResponse.json(
            { data: null, error: "No valid fields to update." },
            { status: 400 }
        );
    }

    const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

    if (error) {
        return NextResponse.json(
            { data: null, error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json({ data, error: null });
}