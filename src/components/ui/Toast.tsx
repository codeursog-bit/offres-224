"use client";
import { useEffect, useState } from "react";
import Icon from "./Icon";
type ToastType = "success" | "error" | "info" | "warning";
interface ToastItem { id: string; type: ToastType; message: string; }
const styles: Record<ToastType, { bg: string; icon: "checkCircle" | "xCircle" | "info" | "warning" }> = {
  success: { bg: "bg-green-50 border-green-200 text-green-800", icon: "checkCircle" },
  error: { bg: "bg-red-50 border-red-200 text-red-800", icon: "xCircle" },
  info: { bg: "bg-blue-50 border-blue-200 text-blue-800", icon: "info" },
  warning: { bg: "bg-yellow-50 border-yellow-200 text-yellow-800", icon: "warning" },
};
let addToastGlobal: ((t: ToastType, m: string) => void) | null = null;
export function toast(type: ToastType, message: string) { addToastGlobal?.(type, message); }
export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  addToastGlobal = (type, message) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium animate-scale-in max-w-sm ${styles[t.type].bg}`}>
          <Icon name={styles[t.type].icon} className="w-5 h-5 shrink-0" />
          <span>{t.message}</span>
          <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="ml-auto shrink-0 opacity-70 hover:opacity-100">
            <Icon name="x" className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
