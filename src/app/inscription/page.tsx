"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { toast } from "@/components/ui/Toast";
import ToastContainer from "@/components/ui/Toast";

function PwdStrength({ p }: { p: string }) {
  const s = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(p)).length;
  if (!p) return null;
  const c = ["","bg-red-400","bg-orange-400","bg-yellow-400","bg-green-500"][s];
  const l = ["","Faible","Moyen","Fort","Très fort"][s];
  return (<div className="mt-1.5"><div className="flex gap-1 mb-1">{[1,2,3,4].map(i=><div key={i} className={`h-1 flex-1 rounded-full ${i<=s?c:"bg-gray-200"}`}/>)}</div><p className="text-xs font-medium text-gray-500">{l}</p></div>);
}

export default function InscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<"CANDIDAT"|"RH">(searchParams.get("role")==="RH"?"RH":"CANDIDAT");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ prenom:"", nom:"", email:"", password:"", telephone:"", ville:"", nomEntreprise:"", secteur:"", numeroRCCM:"", cgu:false });
  const set = (k: string, v: any) => setForm(prev=>({...prev,[k]:v}));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cgu) { toast("error","Veuillez accepter les CGU"); return; }
    if (form.password.length < 8) { toast("error","Mot de passe trop court"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,role})});
      const d = await res.json();
      if (!res.ok) { toast("error",d.error||"Erreur"); setLoading(false); return; }
      await signIn("credentials",{email:form.email,password:form.password,redirect:false});
      router.push(role==="RH"?"/dashboard/rh":"/dashboard/candidat");
    } catch { toast("error","Erreur serveur"); }
    setLoading(false);
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden" style={{background:"linear-gradient(135deg,#007A70,#00A99D 50%,#7B2D8B)"}}>
          <div className="relative text-center text-white max-w-sm">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-white/20">
              {role === "RH" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
                  <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4M9 11h6M9 15h2"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4l3 3"/>
                </svg>
              )}
            </div>
            <h2 className="text-2xl font-black mb-3 font-display">{role==="RH"?"Recrutez les talents du Congo":"Décrochez votre emploi"}</h2>
            <p className="text-white/70 text-sm">{role==="RH"?"CVthèque qualifiée, offres validées, pipeline ATS.":"0 arnaque, offres vérifiées, suivi en temps réel."}</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
          <div className="w-full max-w-md py-6">
            <h2 className="text-2xl font-black text-gray-900 mb-1 font-display">Créer un compte</h2>
            <p className="text-gray-500 text-sm mb-6">Gratuit — inscription en 2 minutes</p>
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              {(["CANDIDAT","RH"] as const).map(r=>(
                <button key={r} onClick={()=>setRole(r)} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${role===r?"bg-white text-[#7B2D8B] shadow-sm":"text-gray-500"}`}>
                  {r==="CANDIDAT"?"Candidat":"Entreprise / RH"}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {role==="CANDIDAT" ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Prénom *</label><input value={form.prenom} onChange={e=>set("prenom",e.target.value)} required placeholder="Jean" className="input-base"/></div>
                    <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Nom *</label><input value={form.nom} onChange={e=>set("nom",e.target.value)} required placeholder="Mbemba" className="input-base"/></div>
                  </div>
                  <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Ville</label>
                    <select value={form.ville} onChange={e=>set("ville",e.target.value)} className="input-base">
                      <option value="">Sélectionner...</option>
                      {["Pointe-Noire","Brazzaville","Dolisie","Owando","Impfondo"].map(v=><option key={v}>{v}</option>)}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Nom entreprise *</label><input value={form.nomEntreprise} onChange={e=>set("nomEntreprise",e.target.value)} required placeholder="Ma Société SARL" className="input-base"/></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Secteur</label>
                      <select value={form.secteur} onChange={e=>set("secteur",e.target.value)} className="input-base">
                        <option value="">...</option>
                        {["Pétrole","BTP","Informatique","Santé","Finance","Transport"].map(s=><option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">N° RCCM</label><input value={form.numeroRCCM} onChange={e=>set("numeroRCCM",e.target.value)} placeholder="CG/PNR/..." className="input-base"/></div>
                  </div>
                </>
              )}
              <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Email *</label><input type="email" value={form.email} onChange={e=>set("email",e.target.value)} required className="input-base"/></div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Mot de passe * (min 8 car.)</label>
                <input type="password" value={form.password} onChange={e=>set("password",e.target.value)} required className="input-base"/>
                <PwdStrength p={form.password}/>
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.cgu} onChange={e=>set("cgu",e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#7B2D8B]"/>
                <span className="text-sm text-gray-600">J'accepte les <Link href="/cgu" className="text-[#7B2D8B] font-semibold underline">CGU</Link> et la <Link href="/confidentialite" className="text-[#7B2D8B] font-semibold underline">Politique de confidentialité</Link></span>
              </label>
              <button type="submit" disabled={loading} className="btn-teal w-full flex items-center justify-center gap-2 py-3.5">
                {loading?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Création...</>:"Créer mon compte →"}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-5">Déjà inscrit ? <Link href="/connexion" className="text-[#7B2D8B] font-bold hover:underline">Se connecter</Link></p>
          </div>
        </div>
      </div>
    </>
  );
}
