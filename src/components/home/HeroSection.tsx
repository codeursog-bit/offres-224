"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";

const VILLES = ["Pointe-Noire","Brazzaville","Dolisie","Owando","Impfondo","Ouesso","Nkayi","Loubomo"];

export default function HeroSection() {
  const [q, setQ] = useState("");
  const [ville, setVille] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (ville) params.set("ville", ville);
    router.push(`/offres?${params}`);
  };

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden" style={{ background: "linear-gradient(135deg, #5B1A6B 0%, #7B2D8B 40%, #00A99D 100%)" }}>
      {/* Background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #fff, transparent)" }} />
        <div className="absolute top-1/2 -left-24 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #00A99D, transparent)" }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #fff, transparent)" }} />
        {/* Grid dots */}
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="white" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-16 w-full">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full mb-8 border border-white/20 animate-fade-in">
          <span className="w-2 h-2 bg-[#00A99D] rounded-full animate-pulse" />
          N°1 des plateformes emploi au Congo
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6 font-display animate-fade-up">
          Trouvez votre<br />
          <span style={{ background: "linear-gradient(90deg, #A8F0EC, #00A99D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            emploi au Congo
          </span>
        </h1>

        <p className="text-white/80 text-lg md:text-xl mb-10 max-w-2xl animate-fade-up" style={{ animationDelay: "100ms" }}>
          Des offres sérieuses, vérifiées et mises à jour quotidiennement. Postulez directement, sans intermédiaire.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl max-w-2xl animate-fade-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-3 flex-1 px-3">
            <Icon name="search" className="w-5 h-5 text-gray-400 shrink-0" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Métier, compétence, entreprise..."
              className="flex-1 outline-none text-gray-900 text-sm placeholder:text-gray-400 py-2 bg-transparent" />
          </div>
          <div className="h-px sm:h-auto sm:w-px bg-gray-100" />
          <div className="flex items-center gap-3 px-3">
            <Icon name="mapPin" className="w-5 h-5 text-gray-400 shrink-0" />
            <select value={ville} onChange={e => setVille(e.target.value)}
              className="outline-none text-gray-900 text-sm bg-transparent py-2 pr-2 cursor-pointer">
              <option value="">Toutes les villes</option>
              {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-teal whitespace-nowrap text-sm px-6">
            Rechercher
          </button>
        </form>

        {/* Quick links */}
        <div className="flex flex-wrap gap-2 mt-6 animate-fade-up" style={{ animationDelay: "300ms" }}>
          <span className="text-white/60 text-sm">Populaire :</span>
          {["Ingénieur pétrolier","Comptable","Chauffeur","Informaticien","Médecin"].map(t => (
            <button key={t} onClick={() => { setQ(t); handleSearch({ preventDefault: () => {} } as any); }}
              className="text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-all">
              {t}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
