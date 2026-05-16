"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import Drawer from "@/components/ui/Drawer";

const STATUT_COLORS: Record<string, string> = {
  ENVOYEE:"gray",VUE:"blue",SHORTLISTED:"violet",ENTRETIEN_PREVU:"orange",
  OFFRE_RECUE:"teal",ACCEPTEE:"green",REFUSEE:"red",ARCHIVEE:"gray"
};
const STATUT_LABELS: Record<string, string> = {
  ENVOYEE:"Envoyée",VUE:"Vue",SHORTLISTED:"Sélectionné(e)",ENTRETIEN_PREVU:"Entretien prévu",
  OFFRE_RECUE:"Offre reçue",ACCEPTEE:"Acceptée",REFUSEE:"Non retenu(e)",ARCHIVEE:"Archivée"
};
const TABS = ["Toutes","En cours","Entretien","Réponse reçue","Archivées"];

export default function CandidaturesPage() {
  const [candidatures, setCandidatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Toutes");
  const [selected, setSelected] = useState<any>(null);
  const [view, setView] = useState<"liste"|"kanban">("liste");

  useEffect(() => {
    fetch("/api/applications").then(r=>r.json()).then(d=>{ setCandidatures(d.data||[]); setLoading(false); }).catch(()=>setLoading(false));
  }, []);

  const filtered = candidatures.filter(c => {
    if (activeTab === "Toutes") return true;
    if (activeTab === "En cours") return ["ENVOYEE","VUE","SHORTLISTED"].includes(c.statut);
    if (activeTab === "Entretien") return ["ENTRETIEN_PREVU","ENTRETIEN_REALISE"].includes(c.statut);
    if (activeTab === "Réponse reçue") return ["OFFRE_RECUE","ACCEPTEE","REFUSEE"].includes(c.statut);
    if (activeTab === "Archivées") return c.statut === "ARCHIVEE";
    return true;
  });

  const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

  const exportCSV = () => {
    const rows = [["Poste","Entreprise","Date","Statut"], ...filtered.map(c => [c.offre?.titre, c.offre?.entreprise?.nomEntreprise, formatDate(c.createdAt), STATUT_LABELS[c.statut]])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "mes_candidatures.csv"; a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 font-display">Mes candidatures</h1>
          <p className="text-gray-500 text-sm mt-1">{candidatures.length} candidature{candidatures.length!==1?"s":""} au total</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Icon name="download" className="w-4 h-4" /> Export CSV
          </button>
          <div className="flex bg-gray-100 rounded-xl p-1">
            {(["liste","kanban"] as const).map(v=>(
              <button key={v} onClick={()=>setView(v)} className={`p-2 rounded-lg transition-all ${view===v?"bg-white shadow-sm text-[#7B2D8B]":"text-gray-400 hover:text-gray-700"}`}>
                <Icon name={v==="liste"?"list":"grid"} className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${activeTab===t?"bg-[#7B2D8B] text-white":"bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#7B2D8B] border-t-transparent rounded-full animate-spin"/></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-4"><Icon name="bell" className="w-12 h-12 text-gray-300 mx-auto mb-4" /></div>
          <h3 className="font-bold text-gray-900 font-display mb-2">Aucune candidature ici</h3>
          <Link href="/offres" className="btn-primary inline-block px-6 py-2.5 text-sm mt-3">Voir les offres</Link>
        </div>
      ) : view === "liste" ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{["Offre","Entreprise","Date","Statut","Action"].map(h=>(
                <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(c=>(
                <tr key={c.id} className="table-row cursor-pointer" onClick={()=>setSelected(c)}>
                  <td className="px-5 py-4 font-semibold text-gray-900 text-sm max-w-[180px] truncate">{c.offre?.titre}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{c.offre?.entreprise?.nomEntreprise}</td>
                  <td className="px-5 py-4 text-sm text-gray-400">{formatDate(c.createdAt)}</td>
                  <td className="px-5 py-4"><Badge variant={STATUT_COLORS[c.statut] as any}>{STATUT_LABELS[c.statut]}</Badge></td>
                  <td className="px-5 py-4">
                    <button className="text-[#7B2D8B] hover:underline text-xs font-bold">Voir détail →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Kanban view */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[["ENVOYEE","Envoyées","gray"],["VUE","Vues","blue"],["SHORTLISTED","Sélectionné(e)s","violet"],["ENTRETIEN_PREVU","Entretien","orange"],["OFFRE_RECUE","Offre reçue","teal"]].map(([statut,label,color])=>{
            const items = candidatures.filter(c=>c.statut===statut);
            return (
              <div key={statut} className="min-w-[220px] flex-1">
                <div className={`flex items-center justify-between px-3 py-2 rounded-xl mb-3 text-sm font-bold badge-${color} bg-opacity-20`}>
                  <span>{label}</span><span className="bg-white rounded-full w-5 h-5 text-center text-xs flex items-center justify-center">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map(c=>(
                    <div key={c.id} onClick={()=>setSelected(c)} className="bg-white rounded-xl border border-gray-100 p-3 cursor-pointer hover:shadow-md transition-shadow">
                      <p className="font-semibold text-gray-900 text-xs truncate">{c.offre?.titre}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{c.offre?.entreprise?.nomEntreprise}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{formatDate(c.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Drawer */}
      <Drawer open={!!selected} onClose={()=>setSelected(null)} title="Détail candidature">
        {selected && (
          <div className="p-6 space-y-5">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-900">{selected.offre?.titre}</h3>
              <p className="text-sm text-gray-600 mt-1">{selected.offre?.entreprise?.nomEntreprise} · {selected.offre?.ville}</p>
              <div className="mt-2"><Badge variant={STATUT_COLORS[selected.statut] as any}>{STATUT_LABELS[selected.statut]}</Badge></div>
            </div>
            {/* Timeline */}
            {selected.historique?.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-3">Historique</h4>
                <div className="space-y-3">
                  {selected.historique.map((h: any, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#F3E8F6] flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-[#7B2D8B]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{STATUT_LABELS[h.statut]}</p>
                        <p className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                        {h.note && <p className="text-xs text-gray-600 mt-1 italic">{h.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Lettre */}
            {selected.lettreMotivation && (
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-2">Lettre de motivation</h4>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-6">{selected.lettreMotivation}</p>
              </div>
            )}
            <Link href={`/offres/${selected.offreId}`} className="btn-outline w-full text-center block py-2.5 text-sm">
              Voir l'offre
            </Link>
          </div>
        )}
      </Drawer>
    </div>
  );
}
