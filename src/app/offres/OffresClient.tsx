"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import OffreCard from "@/components/offres/OffreCard";
import { OffreSkeleton } from "@/components/ui/Skeleton";
import AdSlot from "@/components/ads/AdSlot";
import Icon from "@/components/ui/Icon";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const VILLES = ["Pointe-Noire","Brazzaville","Dolisie","Owando","Impfondo","Ouesso"];
const CONTRATS = ["CDI","CDD","STAGE","INTERIM","FREELANCE","TEMPS_PARTIEL"];
const EXPERIENCES = [
  { value: "SANS_EXPERIENCE", label: "Sans expérience" },
  { value: "JUNIOR", label: "Junior (0-2 ans)" },
  { value: "INTERMEDIAIRE", label: "Intermédiaire (2-5 ans)" },
  { value: "SENIOR", label: "Senior (5-10 ans)" },
  { value: "EXPERT", label: "Expert (10+ ans)" },
];

export default function OffresClient() {
  const searchParams = useSearchParams();
  const [offres, setOffres] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [ville, setVille] = useState(searchParams.get("ville") ?? "");
  const [contrats, setContrats] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);

  const fetchOffres = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ sort, page: page.toString() });
    if (q) params.set("q", q);
    if (ville) params.set("ville", ville);
    if (contrats.length === 1) params.set("contrat", contrats[0]);
    if (experience) params.set("experience", experience);
    try {
      const res = await fetch(`/api/offres?${params}`);
      const d = await res.json();
      setOffres(d.data ?? []);
      setTotal(d.total ?? 0);
      setPages(d.pages ?? 1);
    } catch { setOffres([]); }
    setLoading(false);
  }, [q, ville, contrats, experience, sort, page]);

  useEffect(() => { fetchOffres(); }, [fetchOffres]);

  const resetFilters = () => { setQ(""); setVille(""); setContrats([]); setExperience(""); setPage(1); };

  const FiltersPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Filtres</h3>
        <button onClick={resetFilters} className="text-xs text-red-500 hover:text-red-700 font-medium">Effacer tout</button>
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Ville</label>
        <select value={ville} onChange={e => { setVille(e.target.value); setPage(1); }} className="input-base text-sm">
          <option value="">Toutes les villes</option>
          {VILLES.map(v => <option key={v}>{v}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Type de contrat</label>
        <div className="space-y-1.5">
          {CONTRATS.map(c => (
            <label key={c} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={contrats.includes(c)} onChange={e => {
                setContrats(prev => e.target.checked ? [...prev, c] : prev.filter(x => x !== c));
                setPage(1);
              }} className="w-4 h-4 accent-[#7B2D8B] rounded" />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{c.replace("_", " ")}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Expérience</label>
        <div className="space-y-1.5">
          {EXPERIENCES.map(e => (
            <label key={e.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="radio" name="exp" checked={experience === e.value} onChange={() => { setExperience(e.value); setPage(1); }}
                className="w-4 h-4 accent-[#7B2D8B]" />
              <span className="text-sm text-gray-700">{e.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-[#F8F7FA]">
        <div className="bg-white border-b border-gray-100 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-black text-gray-900 font-display">Offres d&apos;emploi</h1>
            <p className="text-gray-500 mt-1 text-sm">Toutes les offres vérifiées au Congo-Brazzaville</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex gap-8">
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
                <FiltersPanel />
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 flex-1">
                  <Icon name="search" className="w-4 h-4 text-gray-400 shrink-0" />
                  <input value={q} onChange={e => { setQ(e.target.value); setPage(1); }}
                    placeholder="Rechercher une offre..."
                    className="flex-1 py-3 outline-none text-sm text-gray-900 placeholder:text-gray-400 bg-transparent" />
                  {q && <button onClick={() => setQ("")}><Icon name="x" className="w-4 h-4 text-gray-400 hover:text-gray-700" /></button>}
                </div>
                <select value={sort} onChange={e => setSort(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none cursor-pointer">
                  <option value="recent">Plus récent</option>
                  <option value="salaire">Salaire ↓</option>
                  <option value="pertinence">Pertinence</option>
                </select>
                <button onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 bg-[#7B2D8B] text-white px-4 py-3 rounded-xl text-sm font-bold">
                  <Icon name="filter" className="w-4 h-4" /> Filtres
                </button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  {loading ? "Chargement..." : <><span className="font-bold text-gray-900">{total}</span> offre{total !== 1 ? "s" : ""} trouvée{total !== 1 ? "s" : ""}</>}
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array(8).fill(0).map((_, i) => <OffreSkeleton key={i} />)}
                </div>
              ) : offres.length === 0 ? (
                <div className="text-center py-20">
                  <h3 className="font-bold text-gray-900 text-lg">Aucune offre trouvée</h3>
                  <p className="text-gray-500 mt-2 text-sm">Essayez de modifier vos filtres</p>
                  <button onClick={resetFilters} className="mt-4 btn-outline text-sm">Effacer les filtres</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {offres.map((o: any, i: number) => (
                    <div key={o.id}>
                      <OffreCard offre={o} />
                      {(i + 1) % 5 === 0 && i < offres.length - 1 && (
                        <AdSlot placement="FEED_CARD" className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                    className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                    <Icon name="chevronLeft" className="w-5 h-5 text-gray-600" />
                  </button>
                  {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${page === p ? "bg-[#7B2D8B] text-white" : "border border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                      {p}
                    </button>
                  ))}
                  <button disabled={page === pages} onClick={() => setPage(p => p + 1)}
                    className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                    <Icon name="chevronRight" className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {mobileFiltersOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileFiltersOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto animate-slide-up lg:hidden">
            <FiltersPanel />
            <button onClick={() => setMobileFiltersOpen(false)} className="btn-primary w-full mt-6">
              Appliquer les filtres
            </button>
          </div>
        </>
      )}

      <Footer />
    </>
  );
}