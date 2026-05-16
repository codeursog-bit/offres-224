import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EntreprisesClient from "@/components/entreprises/EntreprisesClient";

export const metadata = { title: "Entreprises — Offres Emploi 242" };

export default function EntreprisesPage() {
  return (
    <>
      <Navbar/>
      <main className="pt-16 min-h-screen bg-[#F8F7FA]">
        <div className="bg-white border-b border-gray-100 px-6 py-10">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-black text-gray-900 font-display">Nos entreprises partenaires</h1>
            <p className="text-gray-500 mt-1 text-sm">Découvrez les employeurs qui recrutent au Congo-Brazzaville</p>
          </div>
        </div>
        <EntreprisesClient/>
      </main>
      <Footer/>
    </>
  );
}
