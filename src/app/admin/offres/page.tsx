"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import ToastContainer from "@/components/ui/Toast";

const STATUT_COLORS: Record<string,string> = { BROUILLON:"gray",EN_ATTENTE:"orange",PUBLIEE:"teal",REFUSEE:"red",MODIFICATION:"yellow",EXPIREE:"gray",ARCHIVEE:"gray" };

export default function AdminOffres() {
  const [offres, setOffres] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Toutes");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<any>(null);
  const [deleteText, setDeleteText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async()=>{
    setLoading(true);
    const p = new URLSearchParams({page:page.toString()});
    if(search) p.set("search",search);
    if(tab!=="Toutes") p.set("statut",tab==="Actives"?"PUBLIEE":tab==="En attente"?"EN_ATTENTE":tab==="Expirées"?"EXPIREE":"ARCHIVEE");
    const res = await fetch(`/api/admin/offres?${p}`);
    const d = await res.json();
    setOffres(d.data||[]); setTotal(d.total||0); setLoading(false);
  },[tab,search,page]);

  useEffect(()=>{ load(); },[load]);

  const togglePremium = async(o:any)=>{
    await fetch(`/api/admin/offres/${o.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({isPremium:!o.isPremium})});
    toast("success","Modifié"); load();
  };

  const toggleUrgent = async(o:any)=>{
    await fetch(`/api/admin/offres/${o.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({isUrgent:!o.isUrgent})});
    toast("success","Modifié"); load();
  };

  const forceArchive = async(id:string)=>{
    await fetch(`/api/admin/offres/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({statut:"ARCHIVEE"})});
    toast("success","Offre archivée"); load();
  };

  const doDelete = async()=>{
    if(deleteText!=="SUPPRIMER"){toast("error","Tapez exactement SUPPRIMER");return;}
    setSubmitting(true);
    const res = await fetch(`/api/admin/offres/${deleteModal.id}`,{method:"DELETE"});
    if(res.ok){toast("success","Offre supprimée");setDeleteModal(null);setDeleteText("");load();}
    else toast("error","Erreur");
    setSubmitting(false);
  };

  const TABS = ["Toutes","Actives","En attente","Expirées","Archivées"];

  return (
    <>
      <ToastContainer/>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 font-display">Toutes les offres</h1>
            <p className="text-gray-500 text-sm mt-1">{total.toLocaleString("fr-FR")} offre{total!==1?"s":""} au total</p>
          </div>
          <button onClick={()=>{const csv=offres.map(o=>[o.titre,o.entreprise?.nomEntreprise,o.ville,o.statut].join(",")).join("\n");const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,Titre,Entreprise,Ville,Statut\n"+encodeURIComponent(csv);a.download="offres.csv";a.click();}}
            className="flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
            <Icon name="download" className="w-4 h-4"/> Exporter
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map(t=>(
            <button key={t} onClick={()=>{setTab(t);setPage(1);}}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap ${tab===t?"bg-[#7B2D8B] text-white":"bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 max-w-md">
          <Icon name="search" className="w-4 h-4 text-gray-400 shrink-0"/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Titre, entreprise..." className="flex-1 py-3 outline-none text-sm bg-transparent"/>
        </div>

        {loading?(
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#7B2D8B] border-t-transparent rounded-full animate-spin"/></div>
        ):(
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{["Titre","Entreprise","Statut","Candidatures","Vues","Flags","Actions"].map(h=>(
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {offres.map(o=>(
                  <tr key={o.id} className="table-row">
                    <td className="px-4 py-4 max-w-[200px]">
                      <p className="font-semibold text-gray-900 text-sm truncate">{o.titre}</p>
                      <p className="text-xs text-gray-400">{o.ville} · {o.contratType}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 max-w-[140px] truncate">{o.entreprise?.nomEntreprise}</td>
                    <td className="px-4 py-4"><Badge variant={STATUT_COLORS[o.statut] as any}>{o.statut}</Badge></td>
                    <td className="px-4 py-4 text-sm font-semibold">{o._count?.candidatures||0}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{o.vues}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        {o.isPremium&&<span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold">P</span>}
                        {o.isUrgent&&<span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">U</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Link href={`/offres/${o.id}`} target="_blank" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Voir">
                          <Icon name="eye" className="w-4 h-4 text-gray-400"/>
                        </Link>
                        <button onClick={()=>togglePremium(o)} className={`p-1.5 rounded-lg transition-colors ${o.isPremium?"bg-yellow-100 hover:bg-yellow-200":"hover:bg-gray-100"}`} title="Premium">
                          <Icon name="star" className={`w-4 h-4 ${o.isPremium?"text-yellow-500":"text-gray-300"}`}/>
                        </button>
                        <button onClick={()=>toggleUrgent(o)} className={`p-1.5 rounded-lg transition-colors ${o.isUrgent?"bg-red-100 hover:bg-red-200":"hover:bg-gray-100"}`} title="Urgent">
                          <Icon name="warning" className={`w-4 h-4 ${o.isUrgent?"text-red-500":"text-gray-300"}`}/>
                        </button>
                        {o.statut==="PUBLIEE"&&(
                          <button onClick={()=>forceArchive(o.id)} className="p-1.5 hover:bg-orange-50 rounded-lg transition-colors" title="Archiver">
                            <Icon name="download" className="w-4 h-4 text-orange-400"/>
                          </button>
                        )}
                        <button onClick={()=>{setDeleteModal(o);setDeleteText("");}} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                          <Icon name="trash" className="w-4 h-4 text-red-400"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {total>25&&(
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">Page {page} sur {Math.ceil(total/25)}</p>
                <div className="flex gap-2">
                  <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                    <Icon name="chevronLeft" className="w-4 h-4"/>
                  </button>
                  <button disabled={page*25>=total} onClick={()=>setPage(p=>p+1)} className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                    <Icon name="chevronRight" className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal open={!!deleteModal} onClose={()=>setDeleteModal(null)} title="Supprimer l'offre" size="sm">
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
            <Icon name="warning" className="w-4 h-4 text-orange-400" /> Toutes les candidatures liées seront archivées.
          </div>
          <p className="text-sm text-gray-700">Tapez <strong>SUPPRIMER</strong> pour confirmer</p>
          <input value={deleteText} onChange={e=>setDeleteText(e.target.value)} placeholder="SUPPRIMER" className="input-base"/>
          <div className="flex gap-3">
            <button onClick={()=>setDeleteModal(null)} className="btn-outline flex-1 py-2.5 text-sm">Annuler</button>
            <button onClick={doDelete} disabled={deleteText!=="SUPPRIMER"||submitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-40">
              Supprimer
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
