const STEPS = [
  { num: "01", title: "Créez votre profil", desc: "Inscrivez-vous gratuitement et complétez votre CV en quelques minutes.", color: "#7B2D8B" },
  { num: "02", title: "Explorez les offres", desc: "Filtrez par ville, secteur, contrat. Toutes les offres sont vérifiées par notre équipe.", color: "#00A99D" },
  { num: "03", title: "Postulez en 1 clic", desc: "Envoyez votre candidature directement depuis la plateforme. Suivez son avancement en temps réel.", color: "#E67E22" },
];
export default function HowItWorks() {
  return (
    <section className="py-20 bg-[#F8F7FA] px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-black text-gray-900 font-display">Comment ça marche ?</h2>
          <p className="text-gray-500 mt-2">Trouvez un emploi en 3 étapes simples</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-[#7B2D8B] via-[#00A99D] to-[#E67E22] opacity-30" />
          {STEPS.map((s, i) => (
            <div key={i} className="relative bg-white rounded-2xl p-7 border border-gray-100 card-hover">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg mb-5 font-display" style={{ background: s.color }}>
                {s.num}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2 font-display">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
