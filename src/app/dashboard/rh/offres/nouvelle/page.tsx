// app/dashboard/rh/offres/nouvelle/page.tsx
"use client";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function NouvelleOffrePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    titre: "", secteur: "", ville: "", description: "", contrat: "CDI"
  });
  const DRAFT_KEY = "rh_job_draft";

  useEffect(() => {
    const draft = Cookies.get(DRAFT_KEY);
    if (draft) setFormData(JSON.parse(draft));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      Cookies.set(DRAFT_KEY, JSON.stringify(formData), { expires: 7 });
    }, 1500);
    return () => clearTimeout(timer);
  }, [formData]);

  const handlePublish = async () => {
    // API POST /api/rh/offres
    Cookies.remove(DRAFT_KEY);
    // redirect
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Publier une offre</h1>
        <span className="text-xs text-[#00A99D] font-bold bg-teal-50 px-3 py-1 rounded-full uppercase">
          Brouillon auto-enregistré
        </span>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        {/* Stepper RH */}
        <div className="flex border-b border-gray-100">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex-1 p-6 text-center text-sm font-black uppercase tracking-widest ${step === i ? 'text-[#7B2D8B] border-b-2 border-[#7B2D8B]' : 'text-gray-300'}`}>
              Étape {i}
            </div>
          ))}
        </div>

        <div className="p-10 space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2">Titre du poste *</label>
                <input 
                  value={formData.titre}
                  onChange={e => setFormData({...formData, titre: e.target.value})}
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#7B2D8B]"
                  placeholder="Ex: Comptable Senior"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select 
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
                  value={formData.ville}
                  onChange={e => setFormData({...formData, ville: e.target.value})}
                >
                  <option value="">Ville</option>
                  <option value="Brazzaville">Brazzaville</option>
                  <option value="Pointe-Noire">Pointe-Noire</option>
                </select>
                <select 
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
                  value={formData.contrat}
                  onChange={e => setFormData({...formData, contrat: e.target.value})}
                >
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Stage">Stage</option>
                </select>
              </div>
              <button onClick={() => setStep(2)} className="w-full py-4 bg-[#7B2D8B] text-white font-black rounded-2xl">Continuer</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2">Description détaillée</label>
                <textarea 
                  rows={10}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#7B2D8B] resize-none"
                  placeholder="Missions, responsabilités, environnement de travail..."
                />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl">Retour</button>
                <button onClick={() => setStep(3)} className="flex-1 py-4 bg-[#7B2D8B] text-white font-bold rounded-2xl">Vérifier l'offre</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100">
                <h4 className="font-bold text-[#7B2D8B] mb-2">{formData.titre}</h4>
                <p className="text-xs text-gray-500">{formData.ville} • {formData.contrat}</p>
              </div>
              <p className="text-sm text-gray-500">Votre offre sera soumise à validation par un administrateur et publiée sous 24h.</p>
              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl">Modifier</button>
                <button onClick={handlePublish} className="flex-1 py-4 bg-[#00A99D] text-white font-black rounded-2xl">Publier l'offre</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}