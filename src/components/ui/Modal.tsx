"use client";
import { useEffect, ReactNode } from "react";
import Icon from "./Icon";
interface Props { open: boolean; onClose: () => void; title?: string; children: ReactNode; size?: "sm" | "md" | "lg" | "xl"; }
export default function Modal({ open, onClose, title, children, size = "md" }: Props) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  if (!open) return null;
  const sizes = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl", xl: "max-w-4xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl animate-scale-in max-h-[90vh] flex flex-col`}>
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 font-display">{title}</h2>
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
