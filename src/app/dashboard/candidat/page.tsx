import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";

async function getStats() {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${base}/api/candidat/stats`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

const STATUT_COLORS: Record<string, string> = {
  ENVOYEE: "gray", VUE: "blue", SHORTLISTED: "violet", ENTRETIEN_PREVU: "orange",
  OFFRE_RECUE: "teal", ACCEPTEE: "green", REFUSEE: "red", ARCHIVEE: "gray",
};
const STATUT_LABELS: Record<string, string> = {
  ENVOYEE: "Envoyée", VUE: "Vue", SHORTLISTED: "Sélectionné(e)", ENTRETIEN_PREVU: "Entretien prévu",
  OFFRE_RECUE: "Offre reçue", ACCEPTEE: "Acceptée", REFUSEE: "Non retenu(e)", ARCHIVEE: "Archivée",
};

const CONSEILS = [
  "Complétez votre profil à 100% pour multiplier vos chances par 3.",
  "Personnalisez chaque lettre de motivation — les recruteurs le voient.",
  "Répondez rapidement aux messages des recruteurs.",
  "Ajoutez vos certifications pour vous démarquer.",
  "Créez une alerte emploi pour ne rater aucune opportunité.",
  "Mettez à jour votre CV tous les 3 mois.",
  "Suivez les entreprises qui vous intéressent sur la plateforme.",
];

export default async function CandidatDashboard() {
  const session = await auth();
  if (!session) redirect("/connexion");
  const stats = await getStats();
  const prenom = (session.user as any)?.prenom || "vous";
  const jour = new Date().getDay();
  const conseil = CONSEILS[jour];

  return (
    <div className="space-y-8">
      {/* Bienvenue */}
      <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #F3E8F6 0%, #E0F5F4 100%)" }}>
        <div className="relative z-10">
          <h1 className="text-2xl font-black text-gray-900 font-display">Bonjour {prenom} </h1>
          <p className="text-gray-600 mt-1 text-sm">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          <div className="mt-3 flex items-start gap-2 text-sm text-[#7B2D8B] bg-white/70 rounded-xl p-3 max-w-lg">
            <Icon name="lightbulb" className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{conseil}</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Candidatures envoyées", value: stats.totalCandidatures, sub: `${stats.candidaturesCeMois} ce mois`, icon: "document" as const, color: "#7B2D8B", bg: "#F3E8F6" },
            { label: "Profil complété", value: `${stats.profilComplete}%`, sub: stats.profilComplete < 80 ? "À compléter" : "Excellent !", icon: "user" as const, color: "#00A99D", bg: "#E0F5F4" },
            { label: "Offres sauvegardées", value: stats.offresSauvegardees, sub: "dans vos favoris", icon: "heart" as const, color: "#E67E22", bg: "#FEF0E6" },
            { label: "Vues du profil", value: stats.vuesCeMois, sub: "ce mois", icon: "eye" as const, color: "#7B2D8B", bg: "#F3E8F6" },
          ].map((k, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: k.bg }}>
                  <Icon name={k.icon} className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black text-gray-900 font-display">{k.value}</p>
              <p className="text-xs text-gray-500 mt-1">{k.label}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: k.color }}>{k.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Profil completion */}
      {stats && stats.profilComplete < 80 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 font-display">Complétez votre profil</h2>
            <span className="text-2xl font-black text-[#7B2D8B] font-display">{stats.profilComplete}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${stats.profilComplete}%`, background: "linear-gradient(90deg, #7B2D8B, #00A99D)" }} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Photo de profil", done: false, href: "/dashboard/candidat/profil" },
              { label: "CV uploadé", done: false, href: "/dashboard/candidat/profil" },
              { label: "Expériences", done: false, href: "/dashboard/candidat/profil" },
              { label: "Compétences", done: false, href: "/dashboard/candidat/profil" },
            ].map(item => (
              <Link key={item.label} href={item.href}
                className="flex items-center gap-2 text-sm p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${item.done ? "bg-green-500 border-green-500" : "border-gray-300"}`}>
                  {item.done && <Icon name="check" className="w-3 h-3 text-white" />}
                </div>
                <span className={item.done ? "text-gray-400 line-through" : "text-gray-700"}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Candidatures récentes */}
      {stats?.candidaturesRecentes?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 font-display">Candidatures récentes</h2>
            <Link href="/dashboard/candidat/candidatures" className="text-sm text-[#7B2D8B] font-bold hover:underline flex items-center gap-1">
              Voir tout <Icon name="arrowRight" className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.candidaturesRecentes.map((c: any) => (
              <div key={c.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7B2D8B] to-[#00A99D] flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {c.offre?.entreprise?.nomEntreprise?.[0] || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{c.offre?.titre}</p>
                  <p className="text-xs text-gray-500">{c.offre?.entreprise?.nomEntreprise}</p>
                </div>
                <Badge variant={STATUT_COLORS[c.statut] as any}>{STATUT_LABELS[c.statut]}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA si aucune candidature */}
      {stats?.totalCandidatures === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <div className="text-5xl mb-4"><Icon name="arrowRight" className="w-4 h-4" /></div>
          <h3 className="font-bold text-gray-900 text-lg font-display mb-2">Lancez-vous !</h3>
          <p className="text-gray-500 text-sm mb-5">Vous n'avez pas encore postulé. Plus de 1 200 offres vous attendent.</p>
          <Link href="/offres" className="btn-primary inline-block px-8 py-3 text-sm">Découvrir les offres</Link>
        </div>
      )}
    </div>
  );
}
