"use client";
import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import ToastContainer from "@/components/ui/Toast";

const PLACEMENTS = ["HERO_BANNER","SIDEBAR_SQUARE","FEED_CARD","INTERSTITIEL","FOOTER_BANNER","CONSEILS_INLINE"];
const VILLES = ["Pointe-Noire","Brazzaville","Dolisie","Owando","Impfondo"];
const STATUT_COLORS: Record<string,string> = { ACTIF:"teal",PLANIFIE:"blue",PAUSE:"orange",EXPIRE:"gray",BROUILLON:"gray",ARCHIVE:"gray" };

export default function AdminPublicites() {
  const [ads, setAds] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Toutes");
  const [createOpen, setCreateOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nomCampagne:"", annonceur:"", placement:"HERO_BANNER", priorite:5,
    imageUrl:"", linkUrl:"", titre:"", description:"", ctaText:"",
    couleurFond:"#FFFFFF", startDate:"", endDate:"", isActive:true,
    cibleVilles:[] as string[], cibleSecteurs:[] as string[], cibleUtilisateur:"TOUS"
  });
  const set = (k:string,v:any)=>setForm(p=>({...p,[k]:v}));

  const load = useCallback(async()=>{
    setLoading(true);
    const params = new URLSearchParams();
    if(tab!=="Toutes") params.set("statut",tab.toUpperCase());
    const res = await fetch(`/api/admin/ads?${params}`);
    const d = await res.json();
    setAds(d.data||[]); setTotal(d.total||0); setLoading(false);
  },[tab]);

  useEffect(()=>{ load(); },[load]);

  const handleSubmit = async()=>{
    if(!form.nomCampagne||!form.annonceur||!form.placement||!form.imageUrl||!form.linkUrl||!form.startDate||!form.endDate){
      toast("error","Remplissez tous les champs obligatoires"); return;
    }
    setSubmitting(true);
    const res = await fetch("/api/admin/ads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
    const d = await res.json();
    if(res.ok){ toast("success","Campagne créée !"); setCreateOpen(false); setStep(1); load(); }
    else toast("error",d.error||"Erreur");
    setSubmitting(false);
  };

  const toggleActive = async(ad:any)=>{
    const res = await fetch(`/api/admin/ads/${ad.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({isActive:!ad.isActive})});
    if(res.ok){ toast("success",ad.isActive?"Pause activée":"Campagne activée"); load(); }
    else toast("error","Erreur");
  };

  const deleteAd = async(id:string)=>{
    if(!confirm("Supprimer cette campagne ?")) return;
    const res = await fetch(`/api/admin/ads/${id}`,{method:"DELETE"});
    if(res.ok){ toast("success","Campagne supprimée"); load(); }
    else toast("error","Erreur");
  };

  const ctr = (ad:any)=>ad.impressionsCount>0?((ad.clicksCount/ad.impressionsCount)*100).toFixed(2)+"%" : "0%";

  const StepDot = ({n}:{n:number})=>(
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step>n?"bg-[#00A99D] text-white":step===n?"bg-[#E67E22] text-white":"bg-gray-100 text-gray-400"}`}>
      {step>n?<Icon name="check" className="w-3.5 h-3.5"/>:n}
    </div>
  );

  return (
    <>
      <ToastContainer/>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 font-display">Régie Publicitaire</h1>
            <p className="text-gray-500 text-sm mt-1">{total} campagne{total!==1?"s":""}</p>
          </div>
          <button onClick={()=>{setCreateOpen(true);setStep(1);}} className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl text-white" style={{background:"#E67E22"}}>
            <Icon name="plus" className="w-4 h-4"/> Créer une campagne
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["Toutes","ACTIF","PLANIFIE","PAUSE","EXPIRE"].map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap ${tab===t?"text-white":"bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              style={tab===t?{background:"#E67E22"}:{}}>
              {t==="ACTIF"?"Actives":t==="PLANIFIE"?"Planifiées":t==="PAUSE"?"En pause":t==="EXPIRE"?"Expirées":t}
            </button>
          ))}
        </div>

        {loading?(
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#E67E22] border-t-transparent rounded-full animate-spin"/></div>
        ):ads.length===0?(
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <Icon name="star" className="w-12 h-12 text-gray-300 mx-auto mb-4"/>
            <h3 className="font-bold text-gray-900 font-display mb-2">Aucune campagne</h3>
            <button onClick={()=>setCreateOpen(true)} className="mt-3 text-sm font-bold px-6 py-2.5 rounded-xl text-white" style={{background:"#E67E22"}}>Créer la première campagne</button>
          </div>
        ):(
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{["Campagne","Placement","Période","Statut","Impressions","Clics","CTR","Actions"].map(h=>(
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ads.map(ad=>(
                  <tr key={ad.id} className="table-row">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {ad.imageUrl&&<img src={ad.imageUrl} alt="" className="w-12 h-8 rounded-lg object-cover border border-gray-100"/>}
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{ad.nomCampagne}</p>
                          <p className="text-xs text-gray-400">{ad.annonceur}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><Badge variant="orange">{ad.placement.replace("_"," ")}</Badge></td>
                    <td className="px-4 py-4 text-xs text-gray-500">
                      {new Date(ad.startDate).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})} →<br/>
                      {new Date(ad.endDate).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}
                    </td>
                    <td className="px-4 py-4"><Badge variant={STATUT_COLORS[ad.statut] as any}>{ad.statut}</Badge></td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-700">{ad.impressionsCount.toLocaleString("fr-FR")}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-700">{ad.clicksCount.toLocaleString("fr-FR")}</td>
                    <td className="px-4 py-4 text-sm font-bold" style={{color:"#E67E22"}}>{ctr(ad)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={()=>toggleActive(ad)} title={ad.isActive?"Pause":"Activer"}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <div className={`w-8 h-4 rounded-full transition-colors relative ${ad.isActive?"bg-[#E67E22]":"bg-gray-300"}`}>
                            <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${ad.isActive?"left-4":"left-0.5"}`}/>
                          </div>
                        </button>
                        <button onClick={()=>deleteAd(ad.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <Icon name="trash" className="w-4 h-4 text-red-400"/>
                        </button>
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
      <Modal open={createOpen} onClose={()=>setCreateOpen(false)} title="Nouvelle campagne publicitaire" size="lg">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            {[1,2,3,4].map((n,i)=>(
              <div key={n} className="flex items-center flex-1">
                <StepDot n={n}/>
                {i<3&&<div className={`flex-1 h-0.5 mx-2 ${step>n?"bg-[#00A99D]":"bg-gray-200"}`}/>}
              </div>
            ))}
          </div>

          {step===1&&(
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-bold text-gray-900">Identité de la campagne</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Nom campagne *</label>
                  <input value={form.nomCampagne} onChange={e=>set("nomCampagne",e.target.value)} placeholder="Ex: Promo été 2025" className="input-base"/></div>
                <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Annonceur *</label>
                  <input value={form.annonceur} onChange={e=>set("annonceur",e.target.value)} placeholder="Nom de l'annonceur" className="input-base"/></div>
              </div>
              <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Priorité (1–10)</label>
                <div className="flex items-center gap-4">
                  <input type="range" min={1} max={10} value={form.priorite} onChange={e=>set("priorite",parseInt(e.target.value))} className="flex-1 accent-[#E67E22]"/>
                  <span className="w-8 text-center font-bold text-[#E67E22]">{form.priorite}</span>
                </div>
              </div>
              <button disabled={!form.nomCampagne||!form.annonceur} onClick={()=>setStep(2)} className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-40" style={{background:"#E67E22"}}>Suivant →</button>
            </div>
          )}

          {step===2&&(
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-bold text-gray-900">Créatif publicitaire</h3>
              <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Emplacement *</label>
                <select value={form.placement} onChange={e=>set("placement",e.target.value)} className="input-base">
                  {PLACEMENTS.map(p=><option key={p}>{p}</option>)}
                </select></div>
              <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">URL de l'image *</label>
                <input value={form.imageUrl} onChange={e=>set("imageUrl",e.target.value)} placeholder="https://..." className="input-base"/></div>
              <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">URL de destination *</label>
                <input value={form.linkUrl} onChange={e=>set("linkUrl",e.target.value)} placeholder="https://..." className="input-base"/></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Titre</label>
                  <input value={form.titre} onChange={e=>set("titre",e.target.value)} placeholder="Accroche..." className="input-base"/></div>
                <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Texte bouton CTA</label>
                  <input value={form.ctaText} onChange={e=>set("ctaText",e.target.value)} placeholder="En savoir plus" className="input-base"/></div>
              </div>
              <div className="flex gap-3">
                <button onClick={()=>setStep(1)} className="btn-outline flex-1 py-2.5 text-sm">← Retour</button>
                <button disabled={!form.imageUrl||!form.linkUrl} onClick={()=>setStep(3)} className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-40" style={{background:"#E67E22"}}>Suivant →</button>
              </div>
            </div>
          )}

          {step===3&&(
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-bold text-gray-900">Ciblage & Planning</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Date début *</label>
                  <input type="date" value={form.startDate} onChange={e=>set("startDate",e.target.value)} className="input-base"/></div>
                <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Date fin *</label>
                  <input type="date" value={form.endDate} onChange={e=>set("endDate",e.target.value)} className="input-base"/></div>
              </div>
              <div><label className="text-xs font-semibold text-gray-500 block mb-2">Ciblage villes (laisser vide = toutes)</label>
                <div className="flex flex-wrap gap-2">
                  {VILLES.map(v=>(
                    <label key={v} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input type="checkbox" checked={form.cibleVilles.includes(v)} onChange={e=>set("cibleVilles",e.target.checked?[...form.cibleVilles,v]:form.cibleVilles.filter(x=>x!==v))} className="w-3.5 h-3.5 accent-[#E67E22]"/>
                      {v}
                    </label>
                  ))}
                </div>
              </div>
              <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Audience cible</label>
                <select value={form.cibleUtilisateur} onChange={e=>set("cibleUtilisateur",e.target.value)} className="input-base">
                  <option value="TOUS">Tous les visiteurs</option>
                  <option value="NON_CONNECTES">Non connectés</option>
                  <option value="CANDIDATS">Candidats uniquement</option>
                  <option value="RH">RH uniquement</option>
                </select></div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e=>set("isActive",e.target.checked)} className="w-4 h-4 accent-[#E67E22]"/>
                <span className="text-sm text-gray-700">Activer dès la publication</span>
              </label>
              <div className="flex gap-3">
                <button onClick={()=>setStep(2)} className="btn-outline flex-1 py-2.5 text-sm">← Retour</button>
                <button disabled={!form.startDate||!form.endDate} onClick={()=>setStep(4)} className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-40" style={{background:"#E67E22"}}>Aperçu →</button>
              </div>
            </div>
          )}

          {step===4&&(
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-bold text-gray-900">Aperçu & Lancement</h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Campagne</span><span className="font-semibold">{form.nomCampagne}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Annonceur</span><span className="font-semibold">{form.annonceur}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Emplacement</span><span className="font-semibold">{form.placement}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Période</span><span className="font-semibold">{form.startDate} → {form.endDate}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Priorité</span><span className="font-bold text-[#E67E22]">{form.priorite}/10</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Statut initial</span><Badge variant={form.isActive?"teal":"gray"}>{form.isActive?"Active":"Brouillon"}</Badge></div>
              </div>
              {form.imageUrl&&(
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <img src={form.imageUrl} alt="Aperçu" className="w-full h-32 object-cover"/>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={()=>setStep(3)} className="btn-outline flex-1 py-2.5 text-sm">← Retour</button>
                <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-50 flex items-center justify-center gap-2" style={{background:"#E67E22"}}>
                  {submitting?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Lancement...</>:"Lancer la campagne"}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
