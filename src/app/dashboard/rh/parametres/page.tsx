"use client";
import { useState, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import { toast } from "@/components/ui/Toast";
import ToastContainer from "@/components/ui/Toast";

export default function RHParametres() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nomEntreprise:"", secteur:"", description:"", ville:"", siteWeb:"", adresse:"", numeroRCCM:"", tailleEntreprise:"" });
  const set = (k:string,v:any)=>setForm(p=>({...p,[k]:v}));

  useEffect(()=>{
    fetch("/api/rh/entreprise").then(r=>r.json()).then(d=>{
      if(d.data){ setData(d.data); setForm({ nomEntreprise:d.data.nomEntreprise||"", secteur:d.data.secteur||"", description:d.data.description||"", ville:d.data.ville||"", siteWeb:d.data.siteWeb||"", adresse:d.data.adresse||"", numeroRCCM:d.data.numeroRCCM||"", tailleEntreprise:d.data.tailleEntreprise||"" }); }
    }).catch(()=>{});
  },[]);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/rh/entreprise",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
    if(res.ok) toast("success","Profil enregistré");
    else toast("error","Erreur lors de l'enregistrement");
    setSaving(false);
  };

  return (
    <>
      <ToastContainer/>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-black text-gray-900 font-display">Profil entreprise</h1>
          <p className="text-gray-500 text-sm mt-1">Ces informations seront visibles par les candidats</p>
        </div>

        {data?.isVerifiee ? (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 font-semibold">
            <Icon name="checkCircle" className="w-5 h-5"/> Employeur vérifié ✓
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm text-orange-700">
            <Icon name="info" className="w-5 h-5"/> Renseignez votre RCCM pour obtenir le badge Employeur Vérifié
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Nom de l'entreprise *</label>
            <input value={form.nomEntreprise} onChange={e=>set("nomEntreprise",e.target.value)} className="input-base"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Secteur</label>
              <select value={form.secteur} onChange={e=>set("secteur",e.target.value)} className="input-base">
                <option value="">Sélectionner...</option>
                {["Pétrole & Énergie","BTP","Informatique","Santé","Finance","Transport","Télécoms","Commerce"].map(s=><option key={s}>{s}</option>)}
              </select></div>
            <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Taille</label>
              <select value={form.tailleEntreprise} onChange={e=>set("tailleEntreprise",e.target.value)} className="input-base">
                <option value="">Sélectionner...</option>
                {["1-10","11-50","51-200","201-500","500+"].map(t=><option key={t}>{t}</option>)}
              </select></div>
          </div>
          <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Description</label>
            <textarea value={form.description} onChange={e=>set("description",e.target.value)} rows={4} placeholder="Présentez votre entreprise en quelques lignes..." className="input-base resize-none"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Ville</label>
              <input value={form.ville} onChange={e=>set("ville",e.target.value)} className="input-base"/></div>
            <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Site web</label>
              <input value={form.siteWeb} onChange={e=>set("siteWeb",e.target.value)} placeholder="https://..." className="input-base"/></div>
          </div>
          <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">N° RCCM</label>
            <input value={form.numeroRCCM} onChange={e=>set("numeroRCCM",e.target.value)} placeholder="CG/PNR/..." className="input-base"/></div>
          <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm">
            {saving?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Enregistrement...</>:"Enregistrer les modifications"}
          </button>
        </div>
      </div>
    </>
  );
}
