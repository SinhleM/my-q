"use client";

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: SidebarProps) {
    const items = [
        { id: "overview", label: "Overview" },
        { id: "identity", label: "Identity Pillars" },
        { id: "analytics", label: "Analytics" },
        { id: "payments", label: "Payments & Requests" },
        { id: "files", label: "Files & Documents" },
        { id: "settings", label: "Settings" },
    ];

    return (
        <>
        {/* Desktop Sidebar */ }
        < aside className = "hidden md:flex flex-col w-64 border-r border-emerald-900 bg-emerald-950 px-6 py-8 h-screen sticky top-0" >
            <div className="text-xl font-black italic text-white mb-10" > MYQ </div>
                < nav className = "flex flex-col gap-2" >
                {
                    items.map((i) => (
                        <button 
              key= { i.id } 
              onClick = {() => setActiveTab(i.id)}
    className = {`w-full text-left px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === i.id ? "text-white bg-emerald-900" : "text-emerald-400/60 hover:text-white"}`
}
            >
    { i.label }
    </button>
          ))}
</nav>
    </aside>

{/* Mobile Header/Trigger */ }
<div className="md:hidden flex items-center justify-between p-4 border-b" >
    <span className="font-black italic text-emerald-950 text-xl" > MYQ </span>
        < button onClick = {() => setIsOpen(!isOpen)} className = "text-2xl" >☰</button>
            </div>
            </>
  );
}