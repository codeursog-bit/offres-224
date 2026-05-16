// app/admin/parametres/page.tsx
"use client";
import { useState } from "react";

export default function GlobalSettings() {
  const [maintenance, setMaintenance] = useState(false);

  return (
    <div className="max-w-4xl space-y-10">
      <h1 className="text-2xl font-black">Paramètres Plateforme</h1>

      <div className="grid grid-cols-1 gap-8">
        {/* Maintenance */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Mode Maintenance</h3>
            <p className="text-sm text-gray-400">Désactive l'accès public au site pour maintenance technique.</p>
          </div>
          <button 
            onClick={() => setMaintenance(!maintenance)}
            className={`w-14 h-8 rounded-full transition-colors relative ${maintenance ? 'bg-red-500' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${maintenance ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>

        {/* Quotas */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 space-y-6">
          <h3 className="font-bold text-gray-900 border-b pb-4">Quotas & Limites</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Offres gratuites / mois</label>
              <input type="number" defaultValue={5} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Taille Max CV (Mo)</label>
              <input type="number" defaultValue={5} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" />
            </div>
          </div>
          <button className="bg-[#7B2D8B] text-white px-8 py-4 rounded-2xl font-bold text-sm w-full">Sauvegarder les configurations</button>
        </div>
      </div>
    </div>
  );
}