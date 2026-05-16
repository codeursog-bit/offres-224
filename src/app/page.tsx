import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdSlot from "@/components/ads/AdSlot";
import HeroSection from "@/components/home/HeroSection";
import OffresRecentes from "@/components/home/OffresRecentes";
import StatsSection from "@/components/home/StatsSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import HowItWorks from "@/components/home/HowItWorks";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <CategoriesSection />
        <AdSlot placement="HERO_BANNER" className="max-w-7xl mx-auto px-6 my-8" />
        <OffresRecentes />
        <AdSlot placement="CONSEILS_INLINE" className="max-w-7xl mx-auto px-6 my-4" />
        <HowItWorks />
        {/* CTA Section */}
        <section className="py-20 px-6" style={{ background: "linear-gradient(135deg, #5B1A6B 0%, #7B2D8B 50%, #00A99D 100%)" }}>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 font-display">
              Rejoignez la communauté<br />Offres Emploi 242
            </h2>
            <p className="text-white/80 mb-8 text-lg">Plus de 8 500 candidats et 300 entreprises font confiance à notre plateforme</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/inscription" className="bg-white text-[#7B2D8B] font-bold px-8 py-4 rounded-2xl hover:bg-gray-50 transition-colors text-sm shadow-lg">
                Créer mon profil candidat
              </Link>
              <Link href="/inscription?role=RH" className="bg-white/20 backdrop-blur-sm text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/30 transition-colors text-sm border border-white/30">
                Recruter maintenant
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
