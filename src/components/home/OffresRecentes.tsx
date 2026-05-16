import Link from "next/link";
import OffreCard from "@/components/offres/OffreCard";
async function getOffres() {
  try {
    const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/offres?limit=6&sort=recent`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const d = await res.json();
    return d.data ?? [];
  } catch { return []; }
}
export default async function OffresRecentes() {
  const offres = await getOffres();
  if (!offres.length) return null;
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 font-display">Offres récentes</h2>
          <p className="text-gray-500 text-sm mt-1">Les dernières opportunités publiées</p>
        </div>
        <Link href="/offres" className="text-sm font-bold text-[#7B2D8B] hover:text-[#5B1A6B] flex items-center gap-1 transition-colors">
          Toutes les offres
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
        {offres.map((o: any) => <OffreCard key={o.id} offre={o} />)}
      </div>
    </section>
  );
}
