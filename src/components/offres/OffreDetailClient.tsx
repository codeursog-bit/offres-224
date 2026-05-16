"use client";
import { useState } from "react";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";

const TABS = ["Description", "Profil requis", "Avantages"] as const;

export default function OffreDetailClient({ offre }: { offre: any }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Description");
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: offre.titre, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7B2D8B] to-[#00A99D] flex items-center justify-center text-white font-black text-xl shrink-0">
              {offre.entreprise.nomEntreprise[0]}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-black text-gray-900 font-display leading-tight">{offre.titre}</h1>
              <p className="text-gray-600 mt-1 font-medium">{offre.entreprise.nomEntreprise}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Icon name="mapPin" className="w-4 h-4" />{offre.ville}</span>
                {offre.secteur && <span>{offre.secteur}</span>}
                <span className="flex items-center gap-1"><Icon name="eye" className="w-4 h-4" />{offre.vues} vues</span>
              </div>
            </div>
          </div>
          <button onClick={handleShare} className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shrink-0">
            <Icon name={copied ? "checkCircle" : "share"} className={`w-5 h-5 ${copied ? "text-green-500" : "text-gray-500"}`} />
          </button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant={offre.contratType}>{offre.contratType.replace("_", " ")}</Badge>
          {offre.isUrgent && <Badge variant="urgent"><Icon name="warning" className="w-3 h-3 text-red-500" /> Urgent</Badge>}
          {offre.isPremium && <Badge variant="premium"><Icon name="star" className="w-4 h-4 text-yellow-400" /> Premium</Badge>}
          {offre.niveauExperience && <Badge variant="gray">{offre.niveauExperience.replace("_", " ")}</Badge>}
          {offre.entreprise.isVerifiee && <Badge variant="teal"><Icon name="check" className="w-4 h-4 text-green-600" /> Vérifié</Badge>}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100 px-6">
        <div className="flex gap-0">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${tab === t ? "border-[#7B2D8B] text-[#7B2D8B]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="p-6 prose prose-sm max-w-none text-gray-700 leading-relaxed">
        {tab === "Description" && (
          <div dangerouslySetInnerHTML={{ __html: offre.description.replace(/\n/g, "<br/>") }} />
        )}
        {tab === "Profil requis" && (
          <div>
            {offre.profilRecherche ? (
              <div dangerouslySetInnerHTML={{ __html: offre.profilRecherche.replace(/\n/g, "<br/>") }} />
            ) : (
              <p className="text-gray-400 italic">Aucune information disponible</p>
            )}
            {offre.competencesRequises?.length > 0 && (
              <div className="mt-4">
                <h4 className="font-bold text-gray-900 mb-2">Compétences requises</h4>
                <div className="flex flex-wrap gap-2">
                  {offre.competencesRequises.map((c: any) => (
                    <span key={c.competenceId} className="px-3 py-1 bg-[#F3E8F6] text-[#7B2D8B] text-xs font-semibold rounded-full">{c.competence.nom}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {tab === "Avantages" && (
          <div>
            {offre.avantages ? (
              <div dangerouslySetInnerHTML={{ __html: offre.avantages.replace(/\n/g, "<br/>") }} />
            ) : (
              <p className="text-gray-400 italic">Non précisé</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
