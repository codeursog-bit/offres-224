// app/admin/notifications/page.tsx
"use client";
import { useState } from "react";

export default function BroadcastAdmin() {
  const [target, setTarget] = useState("TOUS");

  return (
    <div className="max-w-3xl space-y-10">
      <h1 className="text-2xl font-black">Diffusion Globale</h1>
      
      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
        <div className="space-y-4">
          <label className="block text-xs font-black uppercase text-gray-400">Cible de la notification</label>
          <div className="flex flex-wrap gap-3">
            {["TOUS", "CANDIDATS", "RH"].map(t => (
              <button key={t} onClick={() => setTarget(t)} className={`px-6 py-3 rounded-xl text-xs font-bold transition-all ${target === t ? 'bg-[#7B2D8B] text-white' : 'bg-gray-50 text-gray-400'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-black uppercase text-gray-400">Message (Push In-App)</label>
          <input className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-purple-200" placeholder="Titre de la notification" />
          <textarea rows={4} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-purple-200 resize-none" placeholder="Contenu du message..." />
        </div>

        <button className="w-full py-5 bg-[#7B2D8B] text-white font-black rounded-2xl shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>
          Diffuser à environ 8 500 utilisateurs
        </button>
      </div>
    </div>
  );
}