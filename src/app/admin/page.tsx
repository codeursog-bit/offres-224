import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

async function getAdminStats() {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${base}/api/admin/stats`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

function BarChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-1 h-20 mt-2">
      {data.slice(-14).map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t transition-all" style={{ height: `${(d.count / max) * 64}px`, background: i === 13 ? "#7B2D8B" : "#E0F5F4", minHeight: d.count > 0 ? "4px" : "0" }} />
        </div>
      ))}
    </div>
  );
}

export default async function AdminDashboard() {
  const session = await auth();
  if (!session || (session.user as any).role !== "SUPER_ADMIN") redirect("/connexion");
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 font-display">Dashboard Admin</h1>
        <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de la plateforme Offres Emploi 242</p>
      </div>

      {/* Alertes urgentes */}
      {stats && (stats.kpis.offresEnAttente > 5 || stats.kpis.signalements > 0) && (
        <div className="space-y-2">
          {stats.kpis.offresEnAttente > 5 && (
            <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Icon name="warning" className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-semibold text-orange-800">{stats.kpis.offresEnAttente} offres en attente de validation depuis plus de 48h</span>
              </div>
              <Link href="/admin/validation" className="text-xs font-bold text-orange-700 bg-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-300 transition-colors">Traiter maintenant</Link>
            </div>
          )}
          {stats.kpis.signalements > 0 && (
            <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Icon name="flag" className="w-5 h-5 text-red-500" />
                <span className="text-sm font-semibold text-red-800">{stats.kpis.signalements} signalement{stats.kpis.signalements > 1 ? "s" : ""} non traité{stats.kpis.signalements > 1 ? "s" : ""}</span>
              </div>
              <Link href="/admin/signalements" className="text-xs font-bold text-red-700 bg-red-200 px-3 py-1.5 rounded-lg hover:bg-red-300 transition-colors">Voir</Link>
            </div>
          )}
        </div>
      )}

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Offres en attente", value: stats.kpis.offresEnAttente, icon: "clock" as const, color: "#E67E22", bg: "#FEF0E6", href: "/admin/validation" },
            { label: "Signalements ouverts", value: stats.kpis.signalements, icon: "flag" as const, color: stats.kpis.signalements > 0 ? "#C0392B" : "#27AE60", bg: stats.kpis.signalements > 0 ? "#FDECEB" : "#E8F8EE", href: "/admin/signalements" },
            { label: "Nouveaux utilisateurs", value: stats.kpis.nouveauxUsers, icon: "users" as const, color: "#7B2D8B", bg: "#F3E8F6", href: "/admin/utilisateurs", sub: "aujourd'hui" },
            { label: "RH non vérifiés", value: stats.kpis.rhNonVerifies, icon: "building" as const, color: "#00A99D", bg: "#E0F5F4", href: "/admin/utilisateurs?role=RH" },
          ].map((k, i) => (
            <Link key={i} href={k.href} className="bg-white rounded-2xl border border-gray-100 p-5 card-hover block">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: k.bg }}>
                <Icon name={k.icon} className="w-5 h-5" style={{ color: k.color }} />
              </div>
              <p className="text-2xl font-black text-gray-900 font-display">{k.value}</p>
              <p className="text-xs text-gray-500 mt-1">{k.label}</p>
              {(k as any).sub && <p className="text-xs font-medium mt-0.5" style={{ color: k.color }}>{(k as any).sub}</p>}
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inscriptions chart */}
        {stats?.inscriptionsParJour && (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 font-display">Inscriptions (14 derniers jours)</h2>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#7B2D8B] inline-block" />Candidats : {stats.users.totalCandidats}</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#E0F5F4] inline-block" />RH : {stats.users.totalRH}</span>
              </div>
            </div>
            <BarChart data={stats.inscriptionsParJour} />
          </div>
        )}

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 font-display mb-4">Actions rapides</h2>
          <div className="space-y-2">
            {[
              { href: "/admin/validation", label: "Valider une offre", icon: "checkCircle" as const, color: "#00A99D" },
              { href: "/admin/publicites", label: "Créer une publicité", icon: "star" as const, color: "#E67E22" },
              { href: "/admin/utilisateurs", label: "Gérer les utilisateurs", icon: "users" as const, color: "#7B2D8B" },
              { href: "/admin/logs", label: "Voir les logs", icon: "document" as const, color: "#555" },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: a.color + "20" }}>
                  <Icon name={a.icon} className="w-4 h-4" style={{ color: a.color }} />
                </div>
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Stats pub */}
      {stats?.ads && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 font-display mb-4">Publicités</h2>
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: "Campagnes actives", value: stats.ads.actives },
              { label: "Impressions totales", value: stats.ads.totalImpressions.toLocaleString("fr-FR") },
              { label: "Clics totaux", value: stats.ads.totalClics.toLocaleString("fr-FR") },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black text-[#E67E22] font-display">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
