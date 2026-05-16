"use client";
import { useEffect, ReactNode } from "react";
import Icon from "./Icon";
interface Props { open: boolean; onClose: () => void; title?: string; children: ReactNode; side?: "right" | "bottom"; }
export default function Drawer({ open, onClose, title, children, side = "right" }: Props) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  if (!open) return null;
  const panelClass = side === "right"
    ? "fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl animate-slide-right flex flex-col"
    : "fixed bottom-0 left-0 w-full max-h-[85vh] bg-white rounded-t-2xl shadow-2xl animate-slide-up flex flex-col";
  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={panelClass}>
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
            <h3 className="text-lg font-bold text-gray-900 font-display">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Icon name="x" className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
