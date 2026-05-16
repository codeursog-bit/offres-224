import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";

async function getStats() {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${base}/api/rh/stats`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}
async function getOffres() {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${base}/api/rh/offres`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).data || [];
  } catch { return []; }
}

function BarChart({ data }: { data: { semaine: number; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t-lg transition-all" style={{ height: `${(d.count / max) * 80}px`, background: i === data.length - 1 ? "#7B2D8B" : "#E0F5F4" }} />
          <span className="text-[10px] text-gray-400">S{d.semaine}</span>
        </div>
      ))}
    </div>
  );
}

export default async function RHDashboard() {
  const session = await auth();
  if (!session) redirect("/connexion");
  const [stats, offres] = await Promise.all([getStats(), getOffres()]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 font-display">Tableau de bord RH</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez vos offres et suivez vos candidatures</p>
        </div>
        <Link href="/dashboard/rh/offres" className="btn-teal flex items-center gap-2 text-sm px-4 py-2.5">
          <Icon name="plus" className="w-4 h-4" /> Publier une offre
        </Link>
      </div>

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Offres actives", value: stats.offresActives, icon: "briefcase" as const, color: "#7B2D8B", bg: "#F3E8F6" },
            { label: "Candidatures reçues", value: stats.candidaturesCeMois, sub: "ce mois", icon: "users" as const, color: "#00A99D", bg: "#E0F5F4" },
            { label: "Non traitées", value: stats.candidaturesNonTraitees, sub: "à examiner", icon: "bell" as const, color: "#E67E22", bg: "#FEF0E6" },
            { label: "Messages non lus", value: stats.nbMessagesNonLus, icon: "message" as const, color: "#7B2D8B", bg: "#F3E8F6" },
          ].map((k, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: k.bg }}>
                  <Icon name={k.icon} className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black text-gray-900 font-display">{k.value}</p>
              <p className="text-xs text-gray-500 mt-1">{k.label}</p>
              {k.sub && <p className="text-xs font-medium mt-0.5" style={{ color: k.color }}>{k.sub}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidatures chart */}
        {stats?.candidaturesParSemaine && (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-5 font-display">Candidatures / semaine</h2>
            <BarChart data={stats.candidaturesParSemaine} />
          </div>
        )}

        {/* Expiring soon */}
        {stats?.offresExpirantBientot?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4 font-display"><Icon name="warning" className="w-4 h-4 text-orange-400" /> Expirent bientôt</h2>
            <div className="space-y-3">
              {stats.offresExpirantBientot.map((o: any) => (
                <div key={o.id} className="flex items-start justify-between gap-3 p-3 bg-orange-50 rounded-xl">
                  <p className="text-sm font-semibold text-gray-900 truncate">{o.titre}</p>
                  <span className="text-xs text-orange-600 font-bold whitespace-nowrap shrink-0">
                    {new Date(o.dateLimite).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Offres actives */}
      {offres.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 font-display">Nos offres</h2>
            <Link href="/dashboard/rh/offres" className="text-sm text-[#7B2D8B] font-bold hover:underline">Gérer →</Link>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              {["Titre","Statut","Candidatures","Vues","Actions"].map(h=>(
                <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {offres.slice(0,5).map((o: any) => (
                <tr key={o.id} className="table-row">
                  <td className="px-5 py-4 font-semibold text-gray-900 text-sm max-w-[200px] truncate">{o.titre}</td>
                  <td className="px-5 py-4">
                    <Badge variant={o.statut==="PUBLIEE"?"teal":o.statut==="EN_ATTENTE"?"orange":"gray"}>
                      {o.statut==="PUBLIEE"?"Publiée":o.statut==="EN_ATTENTE"?"En attente":o.statut}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{o._count?.candidatures || 0}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{o.vues}</td>
                  <td className="px-5 py-4">
                    <Link href={`/offres/${o.id}`} className="text-[#7B2D8B] hover:underline text-xs font-bold">Voir</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
