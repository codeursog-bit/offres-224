// components/shared/Toast.tsx
"use client";
import { useState, useEffect, createContext, useContext } from "react";

type ToastType = "success" | "error" | "info";
const ToastContext = createContext({ show: (m: string, t: ToastType) => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);

  const show = (msg: string, type: ToastType) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <div className="fixed top-20 right-4 z-[100] animate-in slide-in-from-right">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 font-bold text-sm ${
            toast.type === "success" ? "bg-teal-50 border-teal-100 text-teal-700" : "bg-red-50 border-red-100 text-red-700"
          }`}>
            <div className={`w-2 h-2 rounded-full ${toast.type === "success" ? "bg-teal-500" : "bg-red-500"}`} />
            {toast.msg}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);