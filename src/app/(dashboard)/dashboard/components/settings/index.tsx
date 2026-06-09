"use client";

export default function Settings() {
    return (
        <div className="animate-in fade-in duration-500">
            <h1 className="text-3xl font-black tracking-tight">Account Settings</h1>
            <p className="text-neutral-500 mt-2">Manage your authentication and profile preferences.</p>

            <div className="mt-8 space-y-6">
                <div className="p-6 border border-neutral-100 rounded-3xl">
                    <h3 className="font-bold">Security</h3>
                    <button className="mt-4 text-sm font-bold text-red-600 hover:text-red-700">Reset Password</button>
                </div>

                <div className="p-6 border border-neutral-100 rounded-3xl">
                    <h3 className="font-bold">Profile Visibility</h3>
                    <p className="text-sm text-neutral-400 mt-2">Control who can see your shared files and payment links.</p>
                </div>
            </div>
        </div>
    );
}