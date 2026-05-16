"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Avatar from "@/components/ui/Avatar";

const SECTEURS = ["Pétrole & Énergie","BTP","Informatique","Santé","Finance","Transport","Télécoms"];
const VILLES = ["Pointe-Noire","Brazzaville","Dolisie","Owando"];

export default function EntreprisesClient() {
  const [entreprises, setEntreprises] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [secteur, setSecteur] = useState("");
  const [ville, setVille] = useState("");
  const [verified, setVerified] = useState(false);

  const load = useCallback(async()=>{
    setLoading(true);
    const p = new URLSearchParams();
    if(search) p.set("search",search);
    if(secteur) p.set("secteur",secteur);
    if(ville) p.set("ville",ville);
    if(verified) p.set("verified","true");
    const res = await fetch(`/api/entreprises?${p}`);
    const d = await res.json();
    setEntreprises(d.data||[]); setTotal(d.total||0); setLoading(false);
  },[search,secteur,ville,verified]);

  useEffect(()=>{ load(); },[load]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 flex-1 min-w-[200px]">
          <Icon name="search" className="w-4 h-4 text-gray-400 shrink-0"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nom d'entreprise..." className="flex-1 py-3 outline-none text-sm bg-transparent"/>
        </div>
        <select value={secteur} onChange={e=>setSecteur(e.target.value)} className="input-base text-sm w-auto">
          <option value="">Tous secteurs</option>{SECTEURS.map(s=><option key={s}>{s}</option>)}
        </select>
        <select value={ville} onChange={e=>setVille(e.target.value)} className="input-base text-sm w-auto">
          <option value="">Toutes villes</option>{VILLES.map(v=><option key={v}>{v}</option>)}
        </select>
        <label className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors text-sm font-medium">
          <input type="checkbox" checked={verified} onChange={e=>setVerified(e.target.checked)} className="w-4 h-4 accent-[#7B2D8B]"/>
          Vérifiées seulement
        </label>
      </div>

      <p className="text-sm text-gray-500 mb-5"><span className="font-bold text-gray-900">{total}</span> entreprise{total!==1?"s":""} trouvée{total!==1?"s":""}</p>

      {loading?(
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#7B2D8B] border-t-transparent rounded-full animate-spin"/></div>
      ):entreprises.length===0?(
        <div className="text-center py-20">
          <div className="text-5xl mb-4"><Icon name="building" className="w-5 h-5 text-gray-400" /></div>
          <h3 className="font-bold text-gray-900 font-display mb-2">Aucune entreprise trouvée</h3>
          <p className="text-gray-500 text-sm">Modifiez vos critères de recherche</p>
        </div>
      ):(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
          {entreprises.map((e:any)=>(
            <Link key={e.id} href={`/entreprises/${e.id}`} className="block">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 card-hover">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar name={e.nomEntreprise} src={e.logoUrl} size={52} className="rounded-xl"/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-gray-900 truncate">{e.nomEntreprise}</h3>
                      {e.isVerifiee&&<span className="text-[#00A99D] shrink-0" title="Vérifié"><Icon name="checkCircle" className="w-4 h-4"/></span>}
                    </div>
                    {e.secteur&&<p className="text-xs text-gray-500 mt-0.5">{e.secteur}</p>}
                    {e.ville&&<p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><Icon name="mapPin" className="w-3 h-3"/>{e.ville}</p>}
                  </div>
                </div>
                {e.description&&<p className="text-sm text-gray-500 line-clamp-2 mb-4">{e.description}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#7B2D8B] bg-[#F3E8F6] px-2.5 py-1 rounded-full">
                    {e._count?.offres||0} offre{(e._count?.offres||0)!==1?"s":""}
                  </span>
                  {e.noteGlobale&&(
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Icon name="star" className="w-3.5 h-3.5 text-yellow-400"/>
                      {e.noteGlobale.toFixed(1)} ({e.nbAvis})
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
