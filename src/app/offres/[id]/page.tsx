import { notFound } from "next/navigation";
import Icon from "@/components/ui/Icon";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdSlot from "@/components/ads/AdSlot";
import OffreDetailClient from "@/components/offres/OffreDetailClient";
import type { Metadata } from "next";

async function getOffre(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/offres/${id}`, { next: { revalidate: 120 } });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const offre = await getOffre(params.id);
  if (!offre) return { title: "Offre introuvable" };
  return {
    title: `${offre.titre} — ${offre.entreprise.nomEntreprise}`,
    description: offre.description?.slice(0, 160),
    openGraph: { title: offre.titre, description: `${offre.entreprise.nomEntreprise} recrute à ${offre.ville}` },
  };
}

export default async function OffreDetailPage({ params }: { params: { id: string } }) {
  const offre = await getOffre(params.id);
  if (!offre) notFound();

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-[#F8F7FA]">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100 px-6 py-3">
          <nav className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#7B2D8B] transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/offres" className="hover:text-[#7B2D8B] transition-colors">Offres</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">{offre.titre}</span>
          </nav>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main column */}
            <div className="flex-1 min-w-0">
              <OffreDetailClient offre={offre} />
            </div>

            {/* Sidebar */}
            <aside className="lg:w-80 shrink-0 space-y-4">
              {/* Action card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
                <div className="mb-4">
                  {!offre.salaireNonDivulgue && (offre.salaireMin || offre.salaireMax) ? (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Salaire mensuel</p>
                      <p className="text-xl font-black text-green-700 font-display">
                        {offre.salaireMin && offre.salaireMax
                          ? `${(offre.salaireMin/1000).toFixed(0)}k – ${(offre.salaireMax/1000).toFixed(0)}k FCFA`
                          : offre.salaireMin ? `À partir de ${(offre.salaireMin/1000).toFixed(0)}k FCFA` : ""}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Salaire selon profil</p>
                  )}
                </div>
                {offre.dateLimite && (
                  <div className="flex items-center gap-2 text-sm mb-4 p-3 bg-orange-50 rounded-xl">
                    <span className="text-orange-500">⏰</span>
                    <span className="text-orange-700 font-medium">
                      Expire le {new Date(offre.dateLimite).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                    </span>
                  </div>
                )}
                <Link href={`/offres/${offre.id}/postuler`} className="btn-primary w-full text-center block py-3.5 text-sm">
                  Postuler maintenant
                </Link>
                <p className="text-xs text-gray-400 text-center mt-2">Candidature en moins de 5 minutes</p>
              </div>

              {/* Entreprise card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 text-sm mb-4">À propos de l'entreprise</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7B2D8B] to-[#00A99D] flex items-center justify-center text-white font-bold text-lg">
                    {offre.entreprise.nomEntreprise[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{offre.entreprise.nomEntreprise}</p>
                    {offre.entreprise.isVerifiee && (
                      <span className="text-xs text-[#00A99D] font-semibold flex items-center gap-1"><Icon name="check" className="w-4 h-4 text-green-600" /> Employeur vérifié</span>
                    )}
                  </div>
                </div>
                {offre.entreprise.description && (
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{offre.entreprise.description}</p>
                )}
                {offre.entreprise.siteWeb && (
                  <a href={offre.entreprise.siteWeb} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[#7B2D8B] font-semibold mt-2 block hover:underline">
                    Voir le site web →
                  </a>
                )}
              </div>

              {/* Ad */}
              <AdSlot placement="SIDEBAR_SQUARE" />
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
