"use client";
import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Drawer from "@/components/ui/Drawer";

const VILLES = ["Pointe-Noire","Brazzaville","Dolisie","Owando"];
const NIVEAUX = [{v:"SANS_EXPERIENCE",l:"Sans exp."},{v:"JUNIOR",l:"Junior"},{v:"INTERMEDIAIRE",l:"Intermédiaire"},{v:"SENIOR",l:"Senior"},{v:"EXPERT",l:"Expert"}];

export default function CVtheque() {
  const [candidats, setCandidats] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [view, setView] = useState<"carte"|"liste">("carte");
  const [q, setQ] = useState("");
  const [ville, setVille] = useState("");
  const [experience, setExperience] = useState("");
  const [page, setPage] = useState(1);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({page: page.toString()});
    if(q) params.set("q",q);
    if(ville) params.set("ville",ville);
    if(experience) params.set("experience",experience);
    try {
      const res = await fetch(`/api/rh/candidats?${params}`);
      const d = await res.json();
      setCandidats(d.data||[]); setTotal(d.total||0);
    } catch {}
    setLoading(false);
  }, [q, ville, experience, page]);

  useEffect(()=>{fetch_();},[fetch_]);

  const addPipeline = async (profilId: string, etape: string) => {
    await fetch("/api/rh/pipeline", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({profilId, etape}) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-gray-900 font-display">CVthèque</h1>
          <p className="text-gray-500 text-sm mt-1">{total} candidat{total!==1?"s":""} disponible{total!==1?"s":""}</p>
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1">
          {(["carte","liste"] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} className={`p-2 rounded-lg transition-all ${view===v?"bg-white shadow-sm text-[#7B2D8B]":"text-gray-400"}`}>
              <Icon name={v==="carte"?"grid":"list"} className="w-4 h-4"/>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 flex-1 min-w-[200px]">
          <Icon name="search" className="w-4 h-4 text-gray-400 shrink-0"/>
          <input value={q} onChange={e=>{setQ(e.target.value);setPage(1);}} placeholder="Compétence, poste, nom..." className="flex-1 py-2.5 outline-none text-sm bg-transparent text-gray-900"/>
        </div>
        <select value={ville} onChange={e=>{setVille(e.target.value);setPage(1);}} className="input-base text-sm flex-none w-auto">
          <option value="">Toutes les villes</option>{VILLES.map(v=><option key={v}>{v}</option>)}
        </select>
        <select value={experience} onChange={e=>{setExperience(e.target.value);setPage(1);}} className="input-base text-sm flex-none w-auto">
          <option value="">Expérience</option>{NIVEAUX.map(n=><option key={n.v} value={n.v}>{n.l}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#7B2D8B] border-t-transparent rounded-full animate-spin"/></div>
      ) : candidats.length===0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Icon name="users" className="w-12 h-12 text-gray-300 mx-auto mb-4"/>
          <h3 className="font-bold text-gray-900 font-display mb-2">Aucun candidat trouvé</h3>
          <p className="text-gray-500 text-sm">Essayez de modifier vos filtres.</p>
        </div>
      ) : view==="carte" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {candidats.map((c:any)=>(
            <div key={c.id} onClick={()=>setSelected(c)} className="bg-white rounded-2xl border border-gray-100 p-5 card-hover cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar name={`${c.prenom} ${c.nom}`} src={c.photoUrl} size={44}/>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{c.prenom} {c.nom}</p>
                    <p className="text-xs text-gray-500">{c.titreProfessionnel||"Candidat"}</p>
                  </div>
                </div>
                {c.scoreCompatibilite&&<span className="text-xs font-black text-[#7B2D8B] bg-[#F3E8F6] px-2 py-1 rounded-full">{c.scoreCompatibilite}%</span>}
              </div>
              {c.ville&&<div className="flex items-center gap-1 text-xs text-gray-400 mb-3"><Icon name="mapPin" className="w-3.5 h-3.5"/>{c.ville}</div>}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {c.competences?.slice(0,3).map((pc:any)=>(
                  <span key={pc.competence?.nom} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{pc.competence?.nom}</span>
                ))}
                {c.competences?.length>3&&<span className="text-xs text-gray-400">+{c.competences.length-3}</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={e=>{e.stopPropagation();setSelected(c);}} className="flex-1 py-2 text-xs font-bold border-2 border-[#7B2D8B] text-[#7B2D8B] rounded-xl hover:bg-[#F3E8F6] transition-colors">Voir profil</button>
                <button onClick={e=>{e.stopPropagation();addPipeline(c.id,"A_CONTACTER");}} className="flex-1 py-2 text-xs font-bold border-2 border-[#00A99D] text-[#00A99D] rounded-xl hover:bg-[#E0F5F4] transition-colors">+ Pipeline</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              {["Candidat","Titre","Ville","Expérience","Compétences","Actions"].map(h=>(
                <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {candidats.map((c:any)=>(
                <tr key={c.id} className="table-row cursor-pointer" onClick={()=>setSelected(c)}>
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar name={`${c.prenom} ${c.nom}`} size={32}/><div><p className="font-semibold text-gray-900 text-sm">{c.prenom} {c.nom}</p></div></div></td>
                  <td className="px-5 py-4 text-sm text-gray-600 max-w-[150px] truncate">{c.titreProfessionnel||"—"}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">{c.ville||"—"}</td>
                  <td className="px-5 py-4"><Badge variant="gray">{c.niveauExperience?.replace("_"," ")||"—"}</Badge></td>
                  <td className="px-5 py-4 text-xs text-gray-500">{c.competences?.slice(0,2).map((pc:any)=>pc.competence?.nom).join(", ")||"—"}</td>
                  <td className="px-5 py-4"><button className="text-[#7B2D8B] text-xs font-bold hover:underline">Voir →</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Drawer candidat */}
      <Drawer open={!!selected} onClose={()=>setSelected(null)} title="Profil candidat">
        {selected&&(
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={`${selected.prenom} ${selected.nom}`} src={selected.photoUrl} size={56}/>
              <div>
                <h3 className="font-black text-gray-900 font-display">{selected.prenom} {selected.nom}</h3>
                <p className="text-sm text-gray-500">{selected.titreProfessionnel}</p>
                {selected.ville&&<p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><Icon name="mapPin" className="w-3 h-3"/>{selected.ville}</p>}
              </div>
            </div>
            {selected.competences?.length>0&&(
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-2">Compétences</h4>
                <div className="flex flex-wrap gap-2">
                  {selected.competences.map((pc:any)=>(
                    <span key={pc.competence?.nom} className="text-xs bg-[#F3E8F6] text-[#7B2D8B] font-semibold px-2.5 py-1 rounded-full">{pc.competence?.nom}</span>
                  ))}
                </div>
              </div>
            )}
            {selected.langues?.length>0&&(
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-2">Langues</h4>
                <div className="flex flex-wrap gap-2">
                  {selected.langues.map((l:any)=>(
                    <span key={l.langue} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">{l.langue} — {l.niveau}</span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-3">Ajouter au pipeline</h4>
              <div className="grid grid-cols-2 gap-2">
                {[["A_CONTACTER","À contacter"],["CONTACTE","Contacté"],["ENTRETIEN","Entretien"],["RETENU","Retenu"]].map(([v,l])=>(
                  <button key={v} onClick={()=>addPipeline(selected.id,v)}
                    className="py-2 text-xs font-bold border-2 border-[#00A99D] text-[#00A99D] rounded-xl hover:bg-[#E0F5F4] transition-colors">
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
