"use client";
import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";

function formatDate(d: string | Date) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  if (diff < 30) return `Il y a ${diff}j`;
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
function formatSalaire(min?: number | null, max?: number | null) {
  if (!min && !max) return null;
  const f = (n: number) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(0)}k` : n.toString();
  if (min && max) return `${f(min)}–${f(max)} FCFA`;
  if (min) return `Dès ${f(min)} FCFA`;
  return null;
}

interface OffreCardProps {
  offre: {
    id: string; titre: string; ville: string; contratType: string;
    secteur?: string | null; salaireMin?: number | null; salaireMax?: number | null;
    salaireNonDivulgue?: boolean; isPremium?: boolean; isUrgent?: boolean;
    publishedAt?: string | Date | null; dateLimite?: string | Date | null;
    vues?: number;
    entreprise: { nomEntreprise: string; logoUrl?: string | null; isVerifiee?: boolean; ville?: string | null };
  };
  saved?: boolean;
  onSave?: (id: string) => void;
  compact?: boolean;
}

export default function OffreCard({ offre, saved = false, onSave, compact }: OffreCardProps) {
  const [isSaved, setIsSaved] = useState(saved);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/offres/${offre.id}/save`, { method: "POST" });
      const data = await res.json();
      setIsSaved(data.saved);
      onSave?.(offre.id);
    } catch { /* ignore */ }
    setSaving(false);
  };

  const salaire = !offre.salaireNonDivulgue ? formatSalaire(offre.salaireMin, offre.salaireMax) : null;

  return (
    <Link href={`/offres/${offre.id}`} className="block group">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 card-hover relative overflow-hidden">
        {/* Premium accent */}
        {offre.isPremium && (
          <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
            <div className="absolute top-3 right-[-20px] bg-yellow-400 text-yellow-900 text-[10px] font-bold py-0.5 px-6 rotate-45 transform">PREMIUM</div>
          </div>
        )}

        <div className="flex items-start gap-4">
          <Avatar name={offre.entreprise.nomEntreprise} src={offre.entreprise.logoUrl} size={48} className="rounded-xl shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 group-hover:text-[#7B2D8B] transition-colors font-display">
                  {offre.titre}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <span className="font-medium text-gray-700">{offre.entreprise.nomEntreprise}</span>
                  {offre.entreprise.isVerifiee && (
                    <span className="text-[#00A99D]" title="Employeur vérifié">
                      <Icon name="checkCircle" className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
              {/* Save button */}
              <button onClick={handleSave} aria-label={isSaved ? "Retirer des favoris" : "Sauvegarder"}
                className="shrink-0 p-1.5 hover:bg-gray-100 rounded-lg transition-colors mt-0.5">
                <svg className={`w-5 h-5 transition-colors ${isSaved ? "text-red-500 fill-red-500" : "text-gray-300 hover:text-red-400"}`}
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              <Badge variant={offre.contratType as any}>{offre.contratType.replace("_", " ")}</Badge>
              {offre.isUrgent && <Badge variant="urgent"><Icon name="warning" className="w-3 h-3 text-red-500" /> Urgent</Badge>}
              {salaire && (
                <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">{salaire}/mois</span>
              )}
            </div>

            {/* Location + date */}
            <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Icon name="mapPin" className="w-3.5 h-3.5" />
                {offre.ville}
                {offre.secteur && <span className="text-gray-300 mx-1">·</span>}
                {offre.secteur && <span>{offre.secteur}</span>}
              </span>
              <span>{offre.publishedAt ? formatDate(offre.publishedAt) : ""}</span>
            </div>
          </div>
        </div>

        {/* Hover CTA */}
        {!compact && (
          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Icon name="eye" className="w-3.5 h-3.5" /> {offre.vues ?? 0} vues
            </span>
            <span className="text-xs font-bold text-[#7B2D8B] flex items-center gap-1">
              Voir l'offre <Icon name="arrowRight" className="w-3.5 h-3.5" />
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
