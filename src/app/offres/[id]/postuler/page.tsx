"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Navbar from "@/components/layout/Navbar";
import { toast } from "@/components/ui/Toast";
import ToastContainer from "@/components/ui/Toast";

type Step = 1 | 2 | 3;

const COOKIE_KEY = (id: string) => `app_draft_${id}`;
function saveDraft(id: string, data: any) {
  try { document.cookie = `${COOKIE_KEY(id)}=${encodeURIComponent(JSON.stringify(data))}; max-age=3600; path=/`; } catch {}
}
function loadDraft(id: string): any {
  try {
    const match = document.cookie.match(new RegExp(`${COOKIE_KEY(id)}=([^;]+)`));
    if (match) return JSON.parse(decodeURIComponent(match[1]));
  } catch {}
  return null;
}
function clearDraft(id: string) {
  document.cookie = `${COOKIE_KEY(id)}=; max-age=0; path=/`;
}

export default function PostulerPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState<Step>(1);
  const [offre, setOffre] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);

  const [form, setForm] = useState({
    prenom: "", nom: "", email: "", telephone: "", ville: "", disponibilite: "immediate",
    lettreMotivation: "", pretentionSalariale: "", source: "",
    cvFile: null as File | null, accepte: false,
  });

  useEffect(() => {
    fetch(`/api/offres/${id}`).then(r => r.json()).then(d => setOffre(d.data)).catch(() => {});
    const draft = loadDraft(id);
    if (draft) setForm(prev => ({ ...prev, ...draft, cvFile: null }));
    if (session?.user) {
      setForm(prev => ({
        ...prev,
        prenom: (session.user as any).prenom || "",
        email: session.user?.email || "",
      }));
    }
  }, [id, session]);

  useEffect(() => {
    if (status === "unauthenticated") router.push(`/connexion?callbackUrl=/offres/${id}/postuler`);
  }, [status, id, router]);

  useEffect(() => {
    const { cvFile, accepte, ...rest } = form;
    saveDraft(id, rest);
  }, [form, id]);

  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const generateCoverLetter = async () => {
    if (!offre) return;
    setGeneratingCover(true);
    try {
      const res = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offreId: id, prenom: form.prenom, titrePro: "", experience: "" }),
      });
      const d = await res.json();
      if (d.content) {
        let i = 0;
        set("lettreMotivation", "");
        const interval = setInterval(() => {
          set("lettreMotivation", d.content.slice(0, i));
          i += 3;
          if (i > d.content.length) { set("lettreMotivation", d.content); clearInterval(interval); }
        }, 20);
      }
    } catch { toast("error", "Erreur lors de la génération"); }
    setGeneratingCover(false);
  };

  const canNext1 = form.prenom && form.nom && form.email;
  const canNext2 = form.lettreMotivation.length >= 100;

  const handleSubmit = async () => {
    if (!form.accepte) { toast("error", "Veuillez accepter les conditions"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offreId: id,
          lettreMotivation: form.lettreMotivation,
          pretentionSalariale: form.pretentionSalariale ? parseInt(form.pretentionSalariale) : undefined,
          source: form.source,
        }),
      });
      const d = await res.json();
      if (d.success) {
        clearDraft(id);
        toast("success", "Candidature envoyée avec succès !");
        setTimeout(() => router.push("/dashboard/candidat/candidatures"), 1500);
      } else {
        toast("error", d.error || "Erreur lors de l'envoi");
      }
    } catch { toast("error", "Erreur serveur"); }
    setSubmitting(false);
  };

  const StepCircle = ({ n }: { n: Step }) => (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all
      ${step > n ? "bg-[#00A99D] text-white" : step === n ? "bg-[#7B2D8B] text-white shadow-lg" : "bg-gray-100 text-gray-400"}`}>
      {step > n ? <Icon name="check" className="w-4 h-4" /> : n}
    </div>
  );

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#7B2D8B] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <>
      <Navbar />
      <ToastContainer />
      <main className="pt-20 pb-16 min-h-screen bg-[#F8F7FA] px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back */}
          <Link href={`/offres/${id}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
            <Icon name="chevronLeft" className="w-4 h-4" /> Retour à l'offre
          </Link>

          {offre && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7B2D8B] to-[#00A99D] flex items-center justify-center text-white font-bold">
                {offre.entreprise?.nomEntreprise[0]}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{offre.titre}</p>
                <p className="text-xs text-gray-500">{offre.entreprise?.nomEntreprise} · {offre.ville}</p>
              </div>
            </div>
          )}

          {/* Stepper */}
          <div className="flex items-center gap-0 mb-8">
            {([1,2,3] as Step[]).map((n, i) => (
              <div key={n} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1">
                  <StepCircle n={n} />
                  <span className={`text-xs font-medium ${step === n ? "text-[#7B2D8B]" : "text-gray-400"}`}>
                    {n === 1 ? "Infos" : n === 2 ? "Motivation" : "Confirmation"}
                  </span>
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 mx-2 mb-5 ${step > n ? "bg-[#00A99D]" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-lg font-black text-gray-900 font-display mb-5">Vos informations</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Prénom *</label>
                    <input value={form.prenom} onChange={e => set("prenom", e.target.value)} placeholder="Jean" className="input-base" /></div>
                  <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Nom *</label>
                    <input value={form.nom} onChange={e => set("nom", e.target.value)} placeholder="Mbemba" className="input-base" /></div>
                </div>
                <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Email *</label>
                  <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="jean@exemple.com" className="input-base" /></div>
                <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Téléphone</label>
                  <div className="flex">
                    <span className="px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-l-xl text-sm text-gray-600 border-r-0">+242</span>
                    <input value={form.telephone} onChange={e => set("telephone", e.target.value)} placeholder="06 000 00 00" className="input-base rounded-l-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Ville</label>
                    <select value={form.ville} onChange={e => set("ville", e.target.value)} className="input-base">
                      <option value="">Sélectionner...</option>
                      {["Pointe-Noire","Brazzaville","Dolisie","Owando","Impfondo"].map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Disponibilité</label>
                    <select value={form.disponibilite} onChange={e => set("disponibilite", e.target.value)} className="input-base">
                      <option value="immediate">Immédiate</option>
                      <option value="1mois">Dans 1 mois</option>
                      <option value="3mois">Dans 3 mois</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">CV (PDF, max 5Mo)</label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-[#7B2D8B] hover:bg-[#F3E8F6]/30 transition-colors">
                    <Icon name="upload" className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">{form.cvFile ? form.cvFile.name : "Glissez votre CV ici ou cliquez"}</span>
                    <span className="text-xs text-gray-400 mt-1">PDF, DOC — max 5Mo</span>
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => set("cvFile", e.target.files?.[0] || null)} />
                  </label>
                </div>
                <button disabled={!canNext1} onClick={() => setStep(2)} className="btn-primary w-full disabled:opacity-50">
                  Continuer →
                </button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-lg font-black text-gray-900 font-display mb-5">Votre candidature</h2>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-500">Lettre de motivation * (min 100 caractères)</label>
                    <button onClick={generateCoverLetter} disabled={generatingCover}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#7B2D8B] hover:text-[#5B1A6B] disabled:opacity-50 bg-[#F3E8F6] px-3 py-1.5 rounded-lg transition-colors">
                      <Icon name="ai" className="w-3.5 h-3.5" />
                      {generatingCover ? "Génération..." : "Générer avec l'IA"}
                    </button>
                  </div>
                  <textarea value={form.lettreMotivation} onChange={e => set("lettreMotivation", e.target.value)}
                    rows={10} placeholder="Rédigez votre lettre de motivation..."
                    className="input-base resize-none" />
                  <div className={`text-xs mt-1 text-right ${form.lettreMotivation.length < 100 ? "text-red-500" : "text-green-600"}`}>
                    {form.lettreMotivation.length}/1500 caractères
                  </div>
                </div>
                <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Prétention salariale (optionnel)</label>
                  <div className="flex">
                    <input type="number" value={form.pretentionSalariale} onChange={e => set("pretentionSalariale", e.target.value)}
                      placeholder="450000" className="input-base rounded-r-none" />
                    <span className="px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-r-xl text-sm text-gray-600 border-l-0 whitespace-nowrap">FCFA/mois</span>
                  </div>
                </div>
                <div><label className="text-xs font-semibold text-gray-500 block mb-1.5">Comment avez-vous connu cette offre ?</label>
                  <select value={form.source} onChange={e => set("source", e.target.value)} className="input-base">
                    <option value="">Sélectionner...</option>
                    <option value="plateforme">Via Offres Emploi 242</option>
                    <option value="reseaux">Réseaux sociaux</option>
                    <option value="ami">Bouche à oreille</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-outline flex-1">← Retour</button>
                  <button disabled={!canNext2} onClick={() => setStep(3)} className="btn-primary flex-1 disabled:opacity-50">Continuer →</button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="text-lg font-black text-gray-900 font-display mb-5">Confirmation</h2>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Prénom & Nom</span><span className="font-semibold">{form.prenom} {form.nom}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-semibold">{form.email}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Téléphone</span><span className="font-semibold">+242 {form.telephone || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Disponibilité</span><span className="font-semibold">{form.disponibilite}</span></div>
                  {form.pretentionSalariale && <div className="flex justify-between"><span className="text-gray-500">Prétention</span><span className="font-semibold">{parseInt(form.pretentionSalariale).toLocaleString("fr-FR")} FCFA</span></div>}
                </div>
                {form.lettreMotivation && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Lettre de motivation</p>
                    <p className="text-sm text-gray-700 line-clamp-4">{form.lettreMotivation}</p>
                  </div>
                )}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.accepte} onChange={e => set("accepte", e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#7B2D8B] rounded" />
                  <span className="text-sm text-gray-600">J'accepte que mes données soient transmises à l'entreprise recruteuse</span>
                </label>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-outline flex-1">← Retour</button>
                  <button onClick={handleSubmit} disabled={!form.accepte || submitting} className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Envoi...</> : "Envoyer ma candidature ✓"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
