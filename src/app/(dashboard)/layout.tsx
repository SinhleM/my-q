// src/app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-white text-neutral-900 flex flex-col md:flex-row antialiased">
            {children}
        </div>
    );
}