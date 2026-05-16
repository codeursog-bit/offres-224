"use client";
import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/Icon";
import { toast } from "@/components/ui/Toast";
import ToastContainer from "@/components/ui/Toast";

const NIVEAUX_EXP = ["SANS_EXPERIENCE","JUNIOR","INTERMEDIAIRE","SENIOR","EXPERT"];
const NIVEAUX_FORM = ["SANS_DIPLOME","BEPC","BAC","BTS_DUT","LICENCE","MASTER","DOCTORAT","FORMATION_PRO"];
const NIVEAUX_LANGUE = ["NOTIONS","INTERMEDIAIRE","COURANT","BILINGUE","LANGUE_MATERNELLE"];
const VILLES = ["Pointe-Noire","Brazzaville","Dolisie","Owando","Impfondo","Ouesso"];

export default function ProfilPage() {
  const [profil, setProfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newComp, setNewComp] = useState("");
  const [newLangue, setNewLangue] = useState({langue:"",niveau:"COURANT"});
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(()=>{
    fetch("/api/candidat/profil").then(r=>r.json()).then(d=>{
      if(d.data) setProfil(d.data);
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[]);

  const save = async(data: any)=>{
    setSaving(true); setSaved(false);
    try {
      const res = await fetch("/api/candidat/profil",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
      if(res.ok){ const d=await res.json(); setProfil(d.data); setSaved(true); setTimeout(()=>setSaved(false),3000); }
      else toast("error","Erreur de sauvegarde");
    } catch { toast("error","Erreur serveur"); }
    setSaving(false);
  };

  const setField = (k:string,v:any)=>{
    const updated = {...profil,[k]:v};
    setProfil(updated);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(()=>save(updated),2000);
  };

  const updateExp = (i:number,k:string,v:any)=>{
    const exps = [...(profil.experiences||[])];
    exps[i]={...exps[i],[k]:v};
    setField("experiences",exps);
  };
  const addExp = ()=>setField("experiences",[...(profil.experiences||[]),{poste:"",entreprise:"",dateDebut:"",dateFin:"",description:"",ordre:(profil.experiences||[]).length}]);
  const removeExp = (i:number)=>setField("experiences",(profil.experiences||[]).filter((_:any,idx:number)=>idx!==i));

  const addComp = ()=>{
    if(!newComp.trim()) return;
    const comp = {nom:newComp.trim(),niveau:"intermediaire"};
    setField("competences",[...(profil.competences||[]),comp]);
    setNewComp("");
  };
  const removeComp = (nom:string)=>setField("competences",(profil.competences||[]).filter((c:any)=>c.nom!==nom&&c.competence?.nom!==nom));

  const addLangue = ()=>{
    if(!newLangue.langue.trim()) return;
    setField("langues",[...(profil.langues||[]),newLangue]);
    setNewLangue({langue:"",niveau:"COURANT"});
  };
  const removeLangue = (i:number)=>setField("langues",(profil.langues||[]).filter((_:any,idx:number)=>idx!==i));

  if(loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#7B2D8B] border-t-transparent rounded-full animate-spin"/></div>;
  if(!profil) return null;

  const profilComplete = profil.profilComplete||0;

  return (
    <>
      <ToastContainer/>
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 font-display">Mon profil</h1>
            <p className="text-gray-500 text-sm mt-1">Complétude : <span className="font-bold text-[#7B2D8B]">{profilComplete}%</span></p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {saving&&<span className="text-gray-400 flex items-center gap-1.5"><div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"/>Sauvegarde...</span>}
            {saved&&!saving&&<span className="text-green-600 flex items-center gap-1.5"><Icon name="checkCircle" className="w-4 h-4"/>Sauvegardé</span>}
          </div>
        </div>

        {/* Barre de complétion */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{width:`${profilComplete}%`,background:"linear-gradient(90deg,#7B2D8B,#00A99D)"}}/>
        </div>

        {/* Infos personnelles */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-900 font-display">Informations personnelles</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Prénom</label>
              <input value={profil.prenom||""} onChange={e=>setField("prenom",e.target.value)} className="input-base"/></div>
            <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Nom</label>
              <input value={profil.nom||""} onChange={e=>setField("nom",e.target.value)} className="input-base"/></div>
          </div>
          <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Titre professionnel</label>
            <input value={profil.titreProfessionnel||""} onChange={e=>setField("titreProfessionnel",e.target.value)} placeholder="Ex: Ingénieur pétrolier senior" className="input-base"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Ville</label>
              <select value={profil.ville||""} onChange={e=>setField("ville",e.target.value)} className="input-base">
                <option value="">Sélectionner...</option>{VILLES.map(v=><option key={v}>{v}</option>)}
              </select></div>
            <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Téléphone</label>
              <input value={profil.telephone||""} onChange={e=>setField("telephone",e.target.value)} placeholder="+242 06 000 00 00" className="input-base"/></div>
          </div>
          <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">LinkedIn</label>
            <input value={profil.linkedin||""} onChange={e=>setField("linkedin",e.target.value)} placeholder="https://linkedin.com/in/..." className="input-base"/></div>
          <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Bio <span className="font-normal text-gray-400">({(profil.bio||"").length}/500)</span></label>
            <textarea value={profil.bio||""} onChange={e=>setField("bio",e.target.value)} rows={3} maxLength={500} placeholder="Présentez-vous en quelques lignes..." className="input-base resize-none"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Niveau d'expérience</label>
              <select value={profil.niveauExperience||""} onChange={e=>setField("niveauExperience",e.target.value)} className="input-base">
                <option value="">Sélectionner...</option>{NIVEAUX_EXP.map(n=><option key={n}>{n}</option>)}
              </select></div>
            <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Formation</label>
              <select value={profil.niveauFormation||""} onChange={e=>setField("niveauFormation",e.target.value)} className="input-base">
                <option value="">Sélectionner...</option>{NIVEAUX_FORM.map(n=><option key={n}>{n}</option>)}
              </select></div>
          </div>
          <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Disponibilité</label>
            <select value={profil.disponibilite||""} onChange={e=>setField("disponibilite",e.target.value)} className="input-base">
              <option value="">Sélectionner...</option>
              <option value="immediate">Immédiate</option>
              <option value="1mois">Dans 1 mois</option>
              <option value="3mois">Dans 3 mois</option>
            </select></div>
          <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Prétention salariale (FCFA/mois)</label>
            <input type="number" value={profil.salaireSouhaite||""} onChange={e=>setField("salaireSouhaite",parseInt(e.target.value)||null)} placeholder="450000" className="input-base"/></div>
        </div>

        {/* Expériences */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 font-display">Expériences professionnelles</h2>
            <button onClick={addExp} className="flex items-center gap-1.5 text-sm font-bold text-[#7B2D8B] hover:text-[#5B1A6B] transition-colors">
              <Icon name="plus" className="w-4 h-4"/> Ajouter
            </button>
          </div>
          {(profil.experiences||[]).length===0&&(
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-sm text-gray-400">Aucune expérience ajoutée</p>
              <button onClick={addExp} className="text-xs text-[#7B2D8B] font-bold mt-2">+ Ajouter une expérience</button>
            </div>
          )}
          {(profil.experiences||[]).map((e:any,i:number)=>(
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 relative">
              <button onClick={()=>removeExp(i)} className="absolute top-3 right-3 p-1 hover:bg-red-50 rounded-lg transition-colors">
                <Icon name="trash" className="w-4 h-4 text-red-400"/>
              </button>
              <div className="grid grid-cols-2 gap-3 pr-8">
                <div><label className="text-xs font-semibold text-gray-500 block mb-1">Poste</label>
                  <input value={e.poste||""} onChange={ev=>updateExp(i,"poste",ev.target.value)} className="input-base"/></div>
                <div><label className="text-xs font-semibold text-gray-500 block mb-1">Entreprise</label>
                  <input value={e.entreprise||""} onChange={ev=>updateExp(i,"entreprise",ev.target.value)} className="input-base"/></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-gray-500 block mb-1">Date début</label>
                  <input type="date" value={e.dateDebut?.slice?.(0,10)||""} onChange={ev=>updateExp(i,"dateDebut",ev.target.value)} className="input-base"/></div>
                <div><label className="text-xs font-semibold text-gray-500 block mb-1">Date fin</label>
                  <input type="date" value={e.dateFin?.slice?.(0,10)||""} onChange={ev=>updateExp(i,"dateFin",ev.target.value)} className="input-base"/></div>
              </div>
              <div><label className="text-xs font-semibold text-gray-500 block mb-1">Description</label>
                <textarea value={e.description||""} onChange={ev=>updateExp(i,"description",ev.target.value)} rows={2} className="input-base resize-none"/></div>
            </div>
          ))}
        </div>

        {/* Compétences */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-900 font-display">Compétences</h2>
          <div className="flex flex-wrap gap-2">
            {(profil.competences||[]).map((c:any)=>{
              const nom = c.nom||c.competence?.nom||"";
              return (
                <span key={nom} className="flex items-center gap-1.5 bg-[#F3E8F6] text-[#7B2D8B] text-sm font-semibold px-3 py-1.5 rounded-full">
                  {nom}
                  <button onClick={()=>removeComp(nom)} className="hover:text-[#5B1A6B]"><Icon name="x" className="w-3.5 h-3.5"/></button>
                </span>
              );
            })}
          </div>
          <div className="flex gap-2">
            <input value={newComp} onChange={e=>setNewComp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addComp()} placeholder="Ajouter une compétence..." className="input-base flex-1"/>
            <button onClick={addComp} className="btn-primary px-4 py-2 text-sm">Ajouter</button>
          </div>
        </div>

        {/* Langues */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-900 font-display">Langues</h2>
          {(profil.langues||[]).map((l:any,i:number)=>(
            <div key={i} className="flex items-center gap-3">
              <span className="flex-1 text-sm font-semibold text-gray-900">{l.langue}</span>
              <span className="text-xs text-gray-500">{l.niveau}</span>
              <button onClick={()=>removeLangue(i)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                <Icon name="trash" className="w-3.5 h-3.5 text-red-400"/>
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input value={newLangue.langue} onChange={e=>setNewLangue(p=>({...p,langue:e.target.value}))} placeholder="Langue (ex: Anglais)" className="input-base flex-1"/>
            <select value={newLangue.niveau} onChange={e=>setNewLangue(p=>({...p,niveau:e.target.value}))} className="input-base w-auto">
              {NIVEAUX_LANGUE.map(n=><option key={n}>{n}</option>)}
            </select>
            <button onClick={addLangue} className="btn-teal px-4 py-2 text-sm whitespace-nowrap">Ajouter</button>
          </div>
        </div>

        {/* CV */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <h2 className="font-bold text-gray-900 font-display">CV PDF</h2>
          {profil.cvFileUrl ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <Icon name="document" className="w-8 h-8 text-green-600"/>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900">CV uploadé</p>
                <a href={profil.cvFileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline">Voir mon CV →</a>
              </div>
              <button onClick={()=>setField("cvFileUrl",null)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                <Icon name="trash" className="w-4 h-4 text-red-400"/>
              </button>
            </div>
          ) : (
            <div className="text-center border-2 border-dashed border-gray-200 rounded-xl p-8">
              <Icon name="upload" className="w-10 h-10 text-gray-300 mx-auto mb-3"/>
              <p className="text-sm text-gray-500 mb-1">Uploadez votre CV</p>
              <p className="text-xs text-gray-400">PDF, DOC — max 5Mo</p>
              <p className="text-xs text-gray-400 mt-2">Fonctionnalité d'upload à connecter à votre service de stockage (Cloudinary, S3...)</p>
            </div>
          )}
        </div>

        <div className="pb-8">
          <button onClick={()=>save(profil)} disabled={saving} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
            {saving?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Sauvegarde...</>:"Enregistrer le profil"}
          </button>
        </div>
      </div>
    </>
  );
}
