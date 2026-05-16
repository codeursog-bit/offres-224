"use client";
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdSlot from "@/components/ads/AdSlot";
import Icon from "@/components/ui/Icon";

const SECTEURS = ["Pétrole","BTP","Informatique","Santé","Finance","Transport","Management"];
const NIVEAUX = [{v:"DEBUTANT",l:"Débutant"},{v:"INTERMEDIAIRE",l:"Intermédiaire"},{v:"AVANCE",l:"Avancé"}];

function FormationCard({f}:{f:any}) {
  const gratuit = !f.prix || f.prix===0;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover">
      <div className="h-36 relative" style={{background:`linear-gradient(135deg, ${gratuit?"#00A99D":"#7B2D8B"}, ${gratuit?"#007A70":"#5B1A6B"})`}}>
        <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16">
            <path d="M12 2a5 5 0 00-5 5c0 5 5 13 5 13s5-8 5-13a5 5 0 00-5-5z"/>
            <circle cx="12" cy="7" r="2"/>
          </svg>
        </div>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${gratuit?"bg-white text-[#00A99D]":"bg-white text-[#7B2D8B]"}`}>
            {gratuit?"Gratuit":`${(f.prix/1000).toFixed(0)}k FCFA`}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{f.niveau}</span>
          {f.secteur&&<span className="text-xs text-gray-400">{f.secteur}</span>}
        </div>
        <h3 className="font-bold text-gray-900 font-display mb-1 line-clamp-2">{f.titre}</h3>
        <p className="text-xs text-gray-500 mb-3">Par {f.formateur}</p>
        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
          <span className="flex items-center gap-1"><Icon name="clock" className="w-3.5 h-3.5"/>{f.dureeHeures||"?"}h</span>
          <span className="flex items-center gap-1"><Icon name="users" className="w-3.5 h-3.5"/>{f.nbInscrits} inscrits</span>
          {f.note&&<span className="flex items-center gap-1"><Icon name="star" className="w-3.5 h-3.5 text-yellow-400"/>{f.note.toFixed(1)}</span>}
        </div>
        <button className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors ${gratuit?"btn-teal":"btn-primary"}`}>
          {gratuit?"Commencer gratuitement":"S'inscrire"}
        </button>
      </div>
    </div>
  );
}

export default function FormationsPage() {
  const [formations, setFormations] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [niveau, setNiveau] = useState("");
  const [secteur, setSecteur] = useState("");
  const [prix, setPrix] = useState("");

  const load = useCallback(async()=>{
    setLoading(true);
    const p = new URLSearchParams();
    if(niveau) p.set("niveau",niveau);
    if(secteur) p.set("secteur",secteur);
    if(prix) p.set("prix",prix);
    const res = await fetch(`/api/formations?${p}`);
    const d = await res.json();
    setFormations(d.data||[]); setTotal(d.total||0); setLoading(false);
  },[niveau,secteur,prix]);

  useEffect(()=>{ load(); },[load]);

  return (
    <>
      <Navbar/>
      <main className="pt-16 min-h-screen bg-[#F8F7FA]">
        <div className="bg-white border-b border-gray-100 px-6 py-10">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-black text-gray-900 font-display">Formations professionnelles</h1>
            <p className="text-gray-500 mt-1 text-sm">Développez vos compétences pour booster votre carrière</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex bg-white border border-gray-200 rounded-xl p-1">
              {["","gratuit","payant"].map(p=>(
                <button key={p} onClick={()=>setPrix(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${prix===p?"bg-[#7B2D8B] text-white shadow-sm":"text-gray-500 hover:text-gray-700"}`}>
                  {p===""?"Toutes":p==="gratuit"?"Gratuites":"Payantes"}
                </button>
              ))}
            </div>
            <select value={niveau} onChange={e=>setNiveau(e.target.value)} className="input-base text-sm w-auto">
              <option value="">Tous niveaux</option>{NIVEAUX.map(n=><option key={n.v} value={n.v}>{n.l}</option>)}
            </select>
            <select value={secteur} onChange={e=>setSecteur(e.target.value)} className="input-base text-sm w-auto">
              <option value="">Tous secteurs</option>{SECTEURS.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>

          <AdSlot placement="CONSEILS_INLINE" className="mb-6"/>

          <p className="text-sm text-gray-500 mb-5"><span className="font-bold text-gray-900">{total}</span> formation{total!==1?"s":""}</p>

          {loading?(
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#7B2D8B] border-t-transparent rounded-full animate-spin"/></div>
          ):(
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
              {formations.map((f:any)=><FormationCard key={f.id} f={f}/>)}
            </div>
          )}
        </div>
      </main>
      <Footer/>
    </>
  );
}
