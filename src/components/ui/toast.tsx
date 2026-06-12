/**
 * FILE: src/components/ui/toast.tsx
 */

"use client";

import { createContext, useContext, useState } from "react";

type ToastType = "success" | "error" | "info";

type Toast = {
    id: number;
    message: string;
    type: ToastType;
};

const ToastContext = createContext<{
    showToast: (message: string, type?: ToastType) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    function showToast(message: string, type: ToastType = "info") {
        const id = Date.now();

        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            <div className="fixed bottom-6 right-6 space-y-2 z-50">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`px-4 py-3 rounded-xl shadow-md text-sm font-medium text-white ${toast.type === "success"
                                ? "bg-emerald-600"
                                : toast.type === "error"
                                    ? "bg-red-600"
                                    : "bg-neutral-800"
                            }`}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside ToastProvider");
    return ctx;
}