/**
 * FILE: src/app/(dashboard)/dashboard/components/settings/index.tsx
 */

"use client";

export default function Settings() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-neutral-900">
                Settings
            </h1>

            <p className="text-neutral-500 mt-2">
                Manage your QR identity preferences, file permissions, and payment settings.
            </p>

            <div className="mt-6 space-y-4">
                <div className="p-4 border rounded-xl">
                    <p className="font-semibold">File Sharing</p>
                    <p className="text-sm text-neutral-500">
                        Control whether users can upload files to your QR profile.
                    </p>
                </div>

                <div className="p-4 border rounded-xl">
                    <p className="font-semibold">Payments</p>
                    <p className="text-sm text-neutral-500">
                        Enable or disable payment requests via your QR code.
                    </p>
                </div>

                <div className="p-4 border rounded-xl">
                    <p className="font-semibold">QR Identity</p>
                    <p className="text-sm text-neutral-500">
                        Manage visibility of your profile data when scanned.
                    </p>
                </div>
            </div>
        </div>
    );
}