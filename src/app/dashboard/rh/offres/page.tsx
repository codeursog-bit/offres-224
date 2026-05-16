"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import ToastContainer from "@/components/ui/Toast";

const STATUT_COLORS: Record<string, string> = {
  BROUILLON:"gray", EN_ATTENTE:"orange", PUBLIEE:"teal", REFUSEE:"red",
  MODIFICATION:"yellow", EXPIREE:"gray", ARCHIVEE:"gray"
};
const STATUT_LABELS: Record<string, string> = {
  BROUILLON:"Brouillon", EN_ATTENTE:"⏳ En validation", PUBLIEE:"Publiée",
  REFUSEE:"Refusée", MODIFICATION:"Modification demandée", EXPIREE:"Expirée", ARCHIVEE:"Archivée"
};
const VILLES = ["Pointe-Noire","Brazzaville","Dolisie","Owando","Impfondo","Ouesso"];
const SECTEURS = ["Pétrole & Énergie","BTP","Informatique","Santé","Finance","Transport","Télécoms","Commerce"];

export default function RHOffresPage() {
  const [offres, setOffres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Toutes");
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    titre:"", secteur:"", contratType:"CDI", nbrePostes:1, ville:"", adresse:"",
    description:"", profilRecherche:"", niveauExperience:"", niveauFormation:"",
    salaireMin:"", salaireMax:"", salaireNonDivulgue:false, dateLimite:"",
    competences:"", avantages:""
  });
  const set = (k:string, v:any) => setForm(p=>({...p,[k]:v}));

  const load = () => {
    setLoading(true);
    fetch("/api/rh/offres").then(r=>r.json()).then(d=>{setOffres(d.data||[]);setLoading(false);}).catch(()=>setLoading(false));
  };
  useEffect(()=>{load();},[]);

  // Restore draft from cookie
  useEffect(()=>{
    try {
      const m = document.cookie.match(/rh_offre_draft=([^;]+)/);
      if (m) { const d = JSON.parse(decodeURIComponent(m[1])); setForm(p=>({...p,...d})); }
    } catch {}
  },[]);

  useEffect(()=>{
    try { document.cookie = `rh_offre_draft=${encodeURIComponent(JSON.stringify(form))}; max-age=7200; path=/`; }
    catch {}
  },[form]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const body = {
        ...form, nbrePostes: Number(form.nbrePostes),
        salaireMin: form.salaireMin ? Number(form.salaireMin) : undefined,
        salaireMax: form.salaireMax ? Number(form.salaireMax) : undefined,
        competences: form.competences.split(",").map(c=>c.trim()).filter(Boolean),
      };
      const res = await fetch("/api/rh/offres",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const d = await res.json();
      if(res.ok){ toast("success","Offre soumise — en attente de validation !"); setShowCreate(false); setStep(1); document.cookie="rh_offre_draft=; max-age=0; path=/"; load(); }
      else toast("error", d.error||"Erreur");
    } catch { toast("error","Erreur serveur"); }
    setSubmitting(false);
  };

  const handleArchive = async (id:string) => {
    if(!confirm("Archiver cette offre ?")) return;
    const res = await fetch(`/api/rh/offres/${id}`,{method:"DELETE"});
    if(res.ok){toast("success","Offre archivée");load();}
    else toast("error","Erreur");
  };

  const filtered = offres.filter(o=>{
    if(tab==="Toutes") return true;
    if(tab==="Actives") return o.statut==="PUBLIEE";
    if(tab==="En attente") return o.statut==="EN_ATTENTE";
    if(tab==="Expirées") return ["EXPIREE","ARCHIVEE"].includes(o.statut);
    return true;
  });

  const StepDot = ({n}:{n:number}) => (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step>n?"bg-[#00A99D] text-white":step===n?"bg-[#7B2D8B] text-white":"bg-gray-100 text-gray-400"}`}>
      {step>n?<Icon name="check" className="w-4 h-4"/>:n}
    </div>
  );

  return (
    <>
      <ToastContainer/>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-black text-gray-900 font-display">Nos offres</h1>
            <p className="text-gray-500 text-sm mt-1">{offres.length} offre{offres.length!==1?"s":""} au total</p>
          </div>
          <button onClick={()=>{setShowCreate(true);setStep(1);}} className="btn-teal flex items-center gap-2 text-sm px-4 py-2.5">
            <Icon name="plus" className="w-4 h-4"/> Publier une offre
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["Toutes","Actives","En attente","Expirées"].map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap ${tab===t?"bg-[#7B2D8B] text-white":"bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {t} <span className="ml-1 text-xs opacity-70">({t==="Toutes"?offres.length:offres.filter(o=>t==="Actives"?o.statut==="PUBLIEE":t==="En attente"?o.statut==="EN_ATTENTE":["EXPIREE","ARCHIVEE"].includes(o.statut)).length})</span>
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#7B2D8B] border-t-transparent rounded-full animate-spin"/></div>
        ) : filtered.length===0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <Icon name="briefcase" className="w-12 h-12 text-gray-300 mx-auto mb-4"/>
            <h3 className="font-bold text-gray-900 font-display mb-2">Aucune offre ici</h3>
            <button onClick={()=>setShowCreate(true)} className="btn-teal text-sm px-6 py-2.5 mt-3">Créer votre première offre</button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{["Titre","Statut","Candidatures","Vues","Expire le","Actions"].map(h=>(
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(o=>(
                  <tr key={o.id} className={`table-row ${o.statut==="EN_ATTENTE"?"bg-yellow-50/50":""}`}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900 text-sm max-w-[180px] truncate">{o.titre}</p>
                      <p className="text-xs text-gray-400">{o.ville} · {o.contratType}</p>
                    </td>
                    <td className="px-5 py-4"><Badge variant={STATUT_COLORS[o.statut] as any}>{STATUT_LABELS[o.statut]}</Badge></td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-700">{o._count?.candidatures||0}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{o.vues}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {o.dateLimite ? new Date(o.dateLimite).toLocaleDateString("fr-FR",{day:"numeric",month:"short"}) : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/offres/${o.id}`} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <Icon name="eye" className="w-4 h-4 text-gray-400"/>
                        </Link>
                        {["BROUILLON","MODIFICATION"].includes(o.statut) && (
                          <button onClick={()=>handleArchive(o.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                            <Icon name="trash" className="w-4 h-4 text-red-400"/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={()=>setShowCreate(false)} title="Publier une offre" size="xl">
        <div className="p-6">
          {/* Stepper */}
          <div className="flex items-center gap-3 mb-8">
            {[1,2,3,4].map((n,i)=>(
              <div key={n} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1">
                  <StepDot n={n}/>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{["Général","Description","Conditions","Aperçu"][i]}</span>
                </div>
                {i<3&&<div className={`flex-1 h-0.5 mx-2 mb-4 ${step>n?"bg-[#00A99D]":"bg-gray-200"}`}/>}
              </div>
            ))}
          </div>

          {step===1&&(
            <div className="space-y-4 animate-fade-in">
              <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Titre du poste *</label>
                <input value={form.titre} onChange={e=>set("titre",e.target.value)} placeholder="Ex: Ingénieur de forage senior" className="input-base"/></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Secteur</label>
                  <select value={form.secteur} onChange={e=>set("secteur",e.target.value)} className="input-base">
                    <option value="">Sélectionner...</option>{SECTEURS.map(s=><option key={s}>{s}</option>)}
                  </select></div>
                <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Type de contrat *</label>
                  <select value={form.contratType} onChange={e=>set("contratType",e.target.value)} className="input-base">
                    {["CDI","CDD","STAGE","INTERIM","FREELANCE","TEMPS_PARTIEL"].map(c=><option key={c}>{c}</option>)}
                  </select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Ville *</label>
                  <select value={form.ville} onChange={e=>set("ville",e.target.value)} className="input-base">
                    <option value="">Sélectionner...</option>{VILLES.map(v=><option key={v}>{v}</option>)}
                  </select></div>
                <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Nb de postes</label>
                  <input type="number" min={1} value={form.nbrePostes} onChange={e=>set("nbrePostes",e.target.value)} className="input-base"/></div>
              </div>
              <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Date limite candidature</label>
                <input type="date" value={form.dateLimite} onChange={e=>set("dateLimite",e.target.value)} className="input-base"/></div>
              <button disabled={!form.titre||!form.ville||!form.contratType} onClick={()=>setStep(2)} className="btn-primary w-full disabled:opacity-50">Suivant →</button>
            </div>
          )}
          {step===2&&(
            <div className="space-y-4 animate-fade-in">
              <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Description du poste *</label>
                <textarea value={form.description} onChange={e=>set("description",e.target.value)} rows={6} placeholder="Décrivez les missions, responsabilités..." className="input-base resize-none"/></div>
              <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Profil recherché</label>
                <textarea value={form.profilRecherche} onChange={e=>set("profilRecherche",e.target.value)} rows={4} placeholder="Formation requise, expérience, compétences..." className="input-base resize-none"/></div>
              <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Compétences clés (séparées par des virgules)</label>
                <input value={form.competences} onChange={e=>set("competences",e.target.value)} placeholder="Excel, AutoCAD, Anglais..." className="input-base"/></div>
              <div className="flex gap-3">
                <button onClick={()=>setStep(1)} className="btn-outline flex-1">← Retour</button>
                <button disabled={!form.description} onClick={()=>setStep(3)} className="btn-primary flex-1 disabled:opacity-50">Suivant →</button>
              </div>
            </div>
          )}
          {step===3&&(
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="salNoDiv" checked={form.salaireNonDivulgue} onChange={e=>set("salaireNonDivulgue",e.target.checked)} className="w-4 h-4 accent-[#7B2D8B]"/>
                <label htmlFor="salNoDiv" className="text-sm text-gray-700 font-medium">Salaire selon profil (non divulgué)</label>
              </div>
              {!form.salaireNonDivulgue&&(
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Salaire min (FCFA)</label>
                    <input type="number" value={form.salaireMin} onChange={e=>set("salaireMin",e.target.value)} placeholder="350000" className="input-base"/></div>
                  <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Salaire max (FCFA)</label>
                    <input type="number" value={form.salaireMax} onChange={e=>set("salaireMax",e.target.value)} placeholder="600000" className="input-base"/></div>
                </div>
              )}
              <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Avantages</label>
                <textarea value={form.avantages} onChange={e=>set("avantages",e.target.value)} rows={3} placeholder="Transport, logement, assurance maladie..." className="input-base resize-none"/></div>
              <div className="flex gap-3">
                <button onClick={()=>setStep(2)} className="btn-outline flex-1">← Retour</button>
                <button onClick={()=>setStep(4)} className="btn-primary flex-1">Aperçu →</button>
              </div>
            </div>
          )}
          {step===4&&(
            <div className="space-y-5 animate-fade-in">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="font-black text-gray-900 text-lg font-display">{form.titre}</h3>
                <p className="text-sm text-gray-500 mt-1">{form.ville} · {form.contratType} · {form.secteur}</p>
                {form.description&&<p className="text-sm text-gray-700 mt-3 line-clamp-4">{form.description}</p>}
              </div>
              <div className="bg-[#FEF0E6] border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                <Icon name="info" className="w-5 h-5 text-orange-500 shrink-0 mt-0.5"/>
                <p className="text-sm text-orange-800">Votre offre sera examinée par notre équipe sous 24h avant publication.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={()=>setStep(3)} className="btn-outline flex-1">← Retour</button>
                <button onClick={handleSubmit} disabled={submitting} className="btn-teal flex-1 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Envoi...</>:"Soumettre pour validation ✓"}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
