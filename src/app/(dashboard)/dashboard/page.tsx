// src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useState } from "react";
import Sidebar from "./components/sidebar/Sidebar";
// You can now import your other components as you build them
// import Settings from "./components/settings/Settings"; 

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState("overview");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            {/* Sidebar Component from your new folder */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOpen={isMobileMenuOpen}
                setIsOpen={setIsMobileMenuOpen}
            />

            {/* Dynamic Content Panel */}
            <main className="flex-1 px-6 py-10 md:px-12 max-w-4xl">
                {activeTab === "overview" && <div className="text-2xl font-bold">Overview Content</div>}
                {activeTab === "payments" && <div className="text-2xl font-bold">Payments Content</div>}
                {activeTab === "files" && <div className="text-2xl font-bold">Files Content</div>}
                {/* You can now drop your settings component here: */}
                {/* activeTab === "settings" && <Settings /> */}
            </main>
        </div>
    );
}