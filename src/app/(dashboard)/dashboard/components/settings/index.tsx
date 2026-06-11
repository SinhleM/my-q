"use client";

export default function Settings() {
    return (
        <div className="animate-in fade-in duration-500">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-emerald-950">
                Account Settings
            </h1>
            <p className="text-neutral-500 mt-2 text-sm md:text-base">
                Control your profile preferences and security settings.
            </p>

            <div className="mt-8 space-y-6">
                {/* Security Section */}
                <div className="p-6 bg-white border border-neutral-100 rounded-3xl shadow-sm">
                    <h3 className="font-bold text-emerald-950">Security</h3>
                    <p className="text-sm text-neutral-400 mt-1">Manage your authentication credentials.</p>
                    <div className="mt-4 flex gap-4">
                        <button className="bg-neutral-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-neutral-800 transition-colors">
                            Update Password
                        </button>
                        <button className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors">
                            Log Out
                        </button>
                    </div>
                </div>

                {/* Visibility Section */}
                <div className="p-6 bg-white border border-neutral-100 rounded-3xl shadow-sm">
                    <h3 className="font-bold text-emerald-950">Profile Visibility</h3>
                    <p className="text-sm text-neutral-400 mt-1">Control who can access your shared files.</p>
                    <div className="mt-4 flex items-center justify-between p-4 bg-neutral-50 rounded-2xl">
                        <span className="font-bold text-sm">Public Profile</span>
                        <div className="w-12 h-6 bg-emerald-600 rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}