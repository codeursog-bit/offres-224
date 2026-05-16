"use client";
import { useState, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toast";
import ToastContainer from "@/components/ui/Toast";

export default function AdminValidation() {
  const [offres, setOffres] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<"PUBLIEE"|"REFUSEE"|"MODIFICATION">("PUBLIEE");
  const [motif, setMotif] = useState("");
  const [noteAdmin, setNoteAdmin] = useState("");
  const [checks, setChecks] = useState([false,false,false,false,false]);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/offres?statut=EN_ATTENTE&limit=50");
    const d = await res.json();
    setOffres(d.data||[]);
    setLoading(false);
  };

  useEffect(()=>{ load(); },[]);

  // Restore note from cookie
  useEffect(()=>{
    if(!selected) return;
    try {
      const m = document.cookie.match(/admin_validation_note=([^;]+)/);
      if(m) setNoteAdmin(decodeURIComponent(m[1]));
      else setNoteAdmin("");
    } catch {}
    setMotif(""); setChecks([false,false,false,false,false]); setAction("PUBLIEE");
  },[selected?.id]);

  useEffect(()=>{
    try { document.cookie = `admin_validation_note=${encodeURIComponent(noteAdmin)}; max-age=3600; path=/admin/validation`; }
    catch {}
  },[noteAdmin]);

  const handleAction = async () => {
    if(!selected) return;
    if(action==="REFUSEE" && !motif) { toast("error","Le motif de refus est obligatoire"); return; }
    setSubmitting(true);
    const res = await fetch(`/api/admin/offres/${selected.id}/statut`,{
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ statut:action, motifRefus:motif, noteAdmin })
    });
    if(res.ok){
      toast("success", action==="PUBLIEE"?"Offre publiée !":action==="REFUSEE"?"Offre refusée":"Modification demandée");
      document.cookie = "admin_validation_note=; max-age=0; path=/admin/validation";
      const idx = offres.findIndex(o=>o.id===selected.id);
      const next = offres[idx+1] || offres[idx-1] || null;
      await load();
      setSelected(next);
    } else toast("error","Erreur lors de l'action");
    setSubmitting(false);
  };

  const allChecked = checks.every(Boolean);
  const CHECKLIST = ["Informations complètes","Pas d'arnaque détectée","Pas de discrimination","Secteur et ville corrects","Salaire cohérent"];

  return (
    <>
      <ToastContainer/>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 font-display">Validation des offres</h1>
            <p className="text-gray-500 text-sm mt-1">{offres.length} offre{offres.length!==1?"s":""} en attente · ~{offres.length*3}min estimé</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 text-sm font-bold text-orange-700">
            {offres.length} en attente
          </div>
        </div>

        <div className="flex gap-6 h-[calc(100vh-220px)]">
          {/* Liste */}
          <div className="w-80 shrink-0 bg-white rounded-2xl border border-gray-100 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#7B2D8B] border-t-transparent rounded-full animate-spin"/></div>
            ) : offres.length===0 ? (
              <div className="text-center py-16 px-6">
                <Icon name="checkCircle" className="w-12 h-12 text-green-300 mx-auto mb-3"/>
                <p className="font-bold text-gray-900 font-display">File vide !</p>
                <p className="text-sm text-gray-500 mt-1">Toutes les offres sont traitées.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {offres.map(o=>{
                  const hours = Math.floor((Date.now()-new Date(o.createdAt).getTime())/3600000);
                  const priority = hours>48;
                  return (
                    <button key={o.id} onClick={()=>setSelected(o)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selected?.id===o.id?"bg-[#F3E8F6]":""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{o.titre}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{o.entreprise?.nomEntreprise}</p>
                          <p className="text-xs text-gray-400 mt-1">{o.ville} · {o.contratType}</p>
                        </div>
                        <div className="shrink-0">
                          {priority
                            ? <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">Priorité</span>
                            : <span className="text-[10px] text-gray-400">{hours}h</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Détail + action */}
          {selected ? (
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              {/* Offre content */}
              <div className="bg-white rounded-2xl border border-gray-100 flex-1 overflow-y-auto p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7B2D8B] to-[#00A99D] flex items-center justify-center text-white font-bold">
                    {selected.entreprise?.nomEntreprise?.[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 font-display">{selected.titre}</h2>
                    <p className="text-gray-600 text-sm">{selected.entreprise?.nomEntreprise}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="gray">{selected.ville}</Badge>
                      <Badge variant={selected.contratType as any}>{selected.contratType}</Badge>
                      {selected.entreprise?.isVerifiee && <Badge variant="teal"><Icon name="check" className="w-4 h-4 text-green-600" /> Vérifié</Badge>}
                    </div>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <h4 className="font-bold text-gray-900 mb-2">Description</h4>
                  <p className="whitespace-pre-wrap leading-relaxed">{selected.description}</p>
                  {selected.profilRecherche && (
                    <>
                      <h4 className="font-bold text-gray-900 mt-4 mb-2">Profil recherché</h4>
                      <p className="whitespace-pre-wrap leading-relaxed">{selected.profilRecherche}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Panel action */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shrink-0">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Note interne (privée)</label>
                    <textarea value={noteAdmin} onChange={e=>setNoteAdmin(e.target.value)} rows={2} placeholder="Note visible uniquement par l'équipe admin..." className="input-base resize-none text-xs"/>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Motif (visible par le RH si refus)</label>
                    <textarea value={motif} onChange={e=>setMotif(e.target.value)} rows={2} placeholder="Expliquez le motif..." className="input-base resize-none text-xs"/>
                  </div>
                </div>

                {/* Checklist */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {CHECKLIST.map((c,i)=>(
                    <label key={i} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" checked={checks[i]} onChange={e=>setChecks(prev=>{const n=[...prev];n[i]=e.target.checked;return n;})} className="w-3.5 h-3.5 accent-[#7B2D8B]"/>
                      <span className={checks[i]?"text-gray-900 line-through":"text-gray-600"}>{c}</span>
                    </label>
                  ))}
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                  <button onClick={()=>setAction("PUBLIEE")} disabled={!allChecked||submitting}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${action==="PUBLIEE"&&allChecked?"bg-[#00A99D] text-white":"border-2 border-[#00A99D] text-[#00A99D]"} disabled:opacity-40`}>
                    <Icon name="check" className="w-4 h-4 text-green-600" /> Valider et publier
                  </button>
                  <button onClick={()=>{ setAction("MODIFICATION"); setTimeout(handleAction,100); }} disabled={submitting}
                    className="flex-1 py-3 rounded-xl text-sm font-bold border-2 border-orange-400 text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-40">
                    ↩ Demander modification
                  </button>
                  <button onClick={()=>{ setAction("REFUSEE"); setTimeout(handleAction,100); }} disabled={submitting}
                    className="flex-1 py-3 rounded-xl text-sm font-bold border-2 border-red-400 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40">
                    <Icon name="x" className="w-4 h-4 text-red-500" /> Refuser
                  </button>
                </div>
                {!allChecked && <p className="text-xs text-orange-500 mt-2 text-center">Cochez toutes les cases avant de valider</p>}
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Icon name="eye" className="w-12 h-12 mx-auto mb-3 opacity-30"/>
                <p className="text-sm font-medium">Sélectionnez une offre pour la consulter</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
