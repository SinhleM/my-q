// src\app\(dashboard)\dashboard\page.tsx
"use client";

import { useState } from "react";

// Import from the folder name (Next.js automatically finds index.tsx)
import Sidebar from "./components/sidebar";
import Overview from "./components/overview";
import Payments from "./components/payments";
import Files from "./components/files";
import Analytics from "./components/analytics";
import Settings from "./components/settings";
import Profile from "./components/profile";

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState("overview");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            {/* Sidebar Controller */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOpen={isMobileMenuOpen}
                setIsOpen={setIsMobileMenuOpen}
            />

            {/* Dynamic Content Panel */}
            <main className="flex-1 px-6 py-10 md:px-12 max-w-4xl">
                {activeTab === "overview" && <Overview />}
                {activeTab === "payments" && <Payments />}
                {activeTab === "files" && <Files />}
                {activeTab === "analytics" && <Analytics />}
                {activeTab === "settings" && <Settings />}
                {activeTab === "profile" && <Profile />}
            </main>
        </div>
    );
}