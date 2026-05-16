import Link from "next/link";
import React from "react";

const ICONS: Record<string, React.ReactNode> = {
  petrole: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <ellipse cx="12" cy="20" rx="7" ry="2"/>
      <path d="M5 20V10a7 7 0 0114 0v10"/>
      <path d="M12 4v6M9 10h6"/>
    </svg>
  ),
  btp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4"/>
      <path d="M9 11h6M9 15h2"/>
    </svg>
  ),
  informatique: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <rect x="2" y="3" width="20" height="13" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
      <path d="M8 8l2 2-2 2M13 12h3"/>
    </svg>
  ),
  sante: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
      <path d="M9 12h6M12 9v6"/>
    </svg>
  ),
  finance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <path d="M2 10h20M6 15h.01M10 15h4"/>
    </svg>
  ),
  transport: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M1 3h15l4 6v5H1V3z"/>
      <circle cx="5.5" cy="17.5" r="1.5"/>
      <circle cx="18.5" cy="17.5" r="1.5"/>
      <path d="M1 14h18"/>
    </svg>
  ),
  enseignement: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M12 3L2 8l10 5 10-5-10-5z"/>
      <path d="M2 13l10 5 10-5"/>
      <path d="M22 8v6"/>
    </svg>
  ),
  agriculture: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M12 22V12"/>
      <path d="M12 12C12 6 5 3 2 3c0 5 3 9 10 9z"/>
      <path d="M12 12c0-6 7-9 10-9 0 5-3 9-10 9z"/>
    </svg>
  ),
};

const CATS = [
  { label: "Pétrole & Énergie",  icon: "petrole",      count: 145, q: "pétrole",      color: "#7B2D8B", bg: "#F3E8F6" },
  { label: "BTP & Construction", icon: "btp",           count: 89,  q: "btp",          color: "#E67E22", bg: "#FEF3E2" },
  { label: "Informatique",       icon: "informatique",  count: 67,  q: "informatique", color: "#3B82F6", bg: "#EFF6FF" },
  { label: "Santé",              icon: "sante",         count: 54,  q: "santé",        color: "#10B981", bg: "#ECFDF5" },
  { label: "Finance & Banque",   icon: "finance",       count: 43,  q: "finance",      color: "#F59E0B", bg: "#FFFBEB" },
  { label: "Transport",          icon: "transport",     count: 38,  q: "transport",    color: "#6366F1", bg: "#EEF2FF" },
  { label: "Enseignement",       icon: "enseignement",  count: 31,  q: "enseignement", color: "#EC4899", bg: "#FDF2F8" },
  { label: "Agriculture",        icon: "agriculture",   count: 27,  q: "agriculture",  color: "#00A99D", bg: "#F0FDFA" },
];

export default function CategoriesSection() {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 font-display">Secteurs porteurs</h2>
          <p className="text-gray-500 text-sm mt-1">Explorez les offres par domaine d&apos;activité</p>
        </div>
        <Link href="/offres" className="text-sm font-bold text-[#7B2D8B] hover:text-[#5B1A6B] flex items-center gap-1 transition-colors">
          Voir tout
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger">
        {CATS.map(c => (
          <Link
            key={c.label}
            href={`/offres?q=${encodeURIComponent(c.q)}`}
            className="group bg-white rounded-2xl border border-gray-100 p-5 card-hover text-left block hover:border-transparent hover:shadow-md transition-all"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
              style={{ background: c.bg, color: c.color }}
            >
              {ICONS[c.icon]}
            </div>
            <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#7B2D8B] transition-colors leading-snug">
              {c.label}
            </h3>
            <p className="text-xs text-gray-400 mt-1">{c.count} offres</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
