"use client";
import React from "react";
const variants: Record<string, string> = {
  violet: "bg-[#F3E8F6] text-[#5B1A6B]",
  teal: "bg-[#E0F5F4] text-[#007A70]",
  orange: "bg-[#FEF0E6] text-[#C05621]",
  gray: "bg-gray-100 text-gray-600",
  green: "bg-green-50 text-green-700",
  red: "bg-red-50 text-red-700",
  blue: "bg-blue-50 text-blue-700",
  yellow: "bg-yellow-50 text-yellow-700",
  premium: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  urgent: "bg-red-50 text-red-700",
  CDI: "bg-[#F3E8F6] text-[#5B1A6B]",
  CDD: "bg-[#E0F5F4] text-[#007A70]",
  STAGE: "bg-[#FEF0E6] text-[#C05621]",
  INTERIM: "bg-gray-100 text-gray-600",
  FREELANCE: "bg-blue-50 text-blue-700",
  TEMPS_PARTIEL: "bg-purple-50 text-purple-700",
};
interface Props { variant?: string; children: React.ReactNode; className?: string; dot?: boolean; }
export default function Badge({ variant = "gray", children, className = "", dot }: Props) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant] ?? variants.gray} ${className}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
