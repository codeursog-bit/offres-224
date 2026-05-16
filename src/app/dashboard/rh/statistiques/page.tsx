// app/dashboard/rh/statistiques/page.tsx
export default function StatsRH() {
  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-black">Analytique du recrutement</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Graphique Donut SVG: Origine des candidats */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-col items-center">
          <h3 className="font-bold mb-8 w-full">Origine des candidats</h3>
          <svg className="w-48 h-48 -rotate-90" viewBox="0 0 32 32">
            <circle r="16" cx="16" cy="16" fill="transparent" stroke="#F3E8F6" strokeWidth="4" />
            <circle r="16" cx="16" cy="16" fill="transparent" stroke="#7B2D8B" strokeWidth="4" strokeDasharray="65 100" />
            <circle r="16" cx="16" cy="16" fill="transparent" stroke="#00A99D" strokeWidth="4" strokeDasharray="25 100" strokeDashoffset="-65" />
          </svg>
          <div className="mt-8 space-y-2 w-full">
            <div className="flex justify-between text-xs font-bold"><span className="text-[#7B2D8B]">Recherche Directe</span> <span>65%</span></div>
            <div className="flex justify-between text-xs font-bold"><span className="text-[#00A99D]">Réseaux Sociaux</span> <span>25%</span></div>
            <div className="flex justify-between text-xs font-bold"><span className="text-gray-300">Autres</span> <span>10%</span></div>
          </div>
        </div>

        {/* Heatmap Hebdomadaire Simple */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100">
          <h3 className="font-bold mb-8">Intensité des candidatures (Heures)</h3>
          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 72 }).map((_, i) => (
              <div 
                key={i} 
                className={`h-8 rounded-sm ${i % 7 === 0 ? 'bg-[#7B2D8B]' : i % 3 === 0 ? 'bg-[#7B2D8B]/40' : 'bg-gray-50'}`}
                title="Activité"
              />
            ))}
          </div>
          <div className="mt-4 flex justify-between text-[10px] font-black text-gray-300 uppercase tracking-widest">
            <span>Matin</span><span>Midi</span><span>Soir</span>
          </div>
        </div>
      </div>
    </div>
  );
}