"use client";
import { useState, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import ToastContainer from "@/components/ui/Toast";

const VILLES = ["Pointe-Noire","Brazzaville","Dolisie","Owando","Impfondo","Ouesso"];
const SECTEURS = ["Pétrole","BTP","Informatique","Santé","Finance","Transport","Enseignement"];
const FREQ_LABELS: Record<string, string> = { IMMEDIATE:"Immédiate", QUOTIDIENNE:"Quotidienne", HEBDOMADAIRE:"Hebdomadaire" };

export default function AlertesPage() {
  const [alertes, setAlertes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ nom:"", motsCles:"", ville:"", secteur:"", contratType:"", salaireMin:"", frequence:"QUOTIDIENNE" });
  const set = (k: string, v: any) => setForm(prev=>({...prev,[k]:v}));

  const load = () => fetch("/api/candidat/alertes").then(r=>r.json()).then(d=>{setAlertes(d.data||[]);setLoading(false);}).catch(()=>setLoading(false));
  useEffect(()=>{ load(); },[]);

  const openCreate = () => { setEditing(null); setForm({nom:"",motsCles:"",ville:"",secteur:"",contratType:"",salaireMin:"",frequence:"QUOTIDIENNE"}); setModalOpen(true); };
  const openEdit = (a: any) => { setEditing(a); setForm({nom:a.nom,motsCles:a.motsCles||"",ville:a.ville||"",secteur:a.secteur||"",contratType:a.contratType||"",salaireMin:a.salaireMin?.toString()||"",frequence:a.frequence}); setModalOpen(true); };

  const handleSave = async () => {
    const body = { ...form, salaireMin: form.salaireMin ? parseInt(form.salaireMin) : undefined };
    const url = editing ? `/api/candidat/alertes/${editing.id}` : "/api/candidat/alertes";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
    if (res.ok) { toast("success", editing?"Alerte modifiée":"Alerte créée"); setModalOpen(false); load(); }
    else { const d = await res.json(); toast("error", d.error||"Erreur"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette alerte ?")) return;
    await fetch(`/api/candidat/alertes/${id}`, { method:"DELETE" });
    toast("success","Alerte supprimée"); load();
  };

  const handleToggle = async (a: any) => {
    await fetch(`/api/candidat/alertes/${a.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({isActive:!a.isActive}) });
    load();
  };

  return (
    <>
      <ToastContainer />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-black text-gray-900 font-display">Alertes emploi</h1>
            <p className="text-gray-500 text-sm mt-1">Soyez notifié dès qu'une offre correspond à vos critères</p>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm px-4 py-2.5">
            <Icon name="plus" className="w-4 h-4" /> Créer une alerte
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#7B2D8B] border-t-transparent rounded-full animate-spin"/></div>
        ) : alertes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <Icon name="bell" className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 font-display mb-2">Aucune alerte configurée</h3>
            <p className="text-gray-500 text-sm mb-5">Créez une alerte pour recevoir les offres qui correspondent à votre profil.</p>
            <button onClick={openCreate} className="btn-primary text-sm px-6 py-2.5">Créer ma première alerte</button>
          </div>
        ) : (
          <div className="space-y-3">
            {alertes.map(a=>(
              <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.isActive?"bg-[#F3E8F6]":"bg-gray-100"}`}>
                  <Icon name="bell" className={`w-5 h-5 ${a.isActive?"text-[#7B2D8B]":"text-gray-400"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-sm">{a.nom}</h3>
                    {!a.isActive && <Badge variant="gray">Inactif</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {a.motsCles && <Badge variant="violet">{a.motsCles}</Badge>}
                    {a.ville && <Badge variant="teal">{a.ville}</Badge>}
                    {a.secteur && <Badge variant="gray">{a.secteur}</Badge>}
                    <Badge variant="gray">{FREQ_LABELS[a.frequence]}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Toggle */}
                  <button onClick={()=>handleToggle(a)} className={`w-12 h-6 rounded-full transition-colors relative ${a.isActive?"bg-[#7B2D8B]":"bg-gray-200"}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${a.isActive?"left-7":"left-1"}`} />
                  </button>
                  <button onClick={()=>openEdit(a)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Icon name="pencil" className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={()=>handleDelete(a.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <Icon name="trash" className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editing?"Modifier l'alerte":"Nouvelle alerte emploi"} size="sm">
        <div className="p-6 space-y-4">
          <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Nom de l'alerte *</label>
            <input value={form.nom} onChange={e=>set("nom",e.target.value)} placeholder="Ex: Ingénieur pétrole Pointe-Noire" className="input-base"/></div>
          <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Mots-clés</label>
            <input value={form.motsCles} onChange={e=>set("motsCles",e.target.value)} placeholder="Comptable, ingénieur..." className="input-base"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Ville</label>
              <select value={form.ville} onChange={e=>set("ville",e.target.value)} className="input-base">
                <option value="">Toutes</option>{VILLES.map(v=><option key={v}>{v}</option>)}
              </select></div>
            <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Secteur</label>
              <select value={form.secteur} onChange={e=>set("secteur",e.target.value)} className="input-base">
                <option value="">Tous</option>{SECTEURS.map(s=><option key={s}>{s}</option>)}
              </select></div>
          </div>
          <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Fréquence</label>
            <div className="flex gap-2">
              {["IMMEDIATE","QUOTIDIENNE","HEBDOMADAIRE"].map(f=>(
                <button key={f} onClick={()=>set("frequence",f)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-colors ${form.frequence===f?"border-[#7B2D8B] bg-[#F3E8F6] text-[#7B2D8B]":"border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                  {FREQ_LABELS[f]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={()=>setModalOpen(false)} className="btn-outline flex-1 py-2.5 text-sm">Annuler</button>
            <button onClick={handleSave} disabled={!form.nom} className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50">
              {editing?"Enregistrer":"Créer l'alerte"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
