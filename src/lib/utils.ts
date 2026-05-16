// lib/utils.ts — Utilitaires partagés
export function formatSalaire(min?: number | null, max?: number | null): string {
  if (!min && !max) return "À discuter";
  const fmt = (n: number) => n.toLocaleString("fr-FR");
  if (min && max) return `${fmt(min)} – ${fmt(max)} FCFA/mois`;
  if (min) return `À partir de ${fmt(min)} FCFA/mois`;
  return `Jusqu'à ${fmt(max!)} FCFA/mois`;
}

export function formatDateRelative(date: Date | string): string {
  const d = new Date(date);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function genererAvatarColor(nom: string): string {
  const colors = ["#7B2D8B", "#00A99D", "#E67E22", "#2980B9", "#27AE60", "#C0392B", "#8E44AD", "#16A085"];
  let hash = 0;
  for (let i = 0; i < nom.length; i++) hash = nom.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function genererSlug(titre: string): string {
  return titre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "...";
}

export function calculerProfilComplete(profil: {
  photoUrl?: string | null;
  bio?: string | null;
  ville?: string | null;
  titreProfessionnel?: string | null;
  telephone?: string | null;
  cvFileUrl?: string | null;
  experiences?: unknown[];
  formations?: unknown[];
  competences?: unknown[];
  langues?: unknown[];
}): number {
  let score = 10; // base
  if (profil.photoUrl) score += 10;
  if (profil.bio) score += 10;
  if (profil.ville) score += 5;
  if (profil.telephone) score += 5;
  if (profil.titreProfessionnel) score += 10;
  if (profil.cvFileUrl) score += 20;
  if (profil.experiences && profil.experiences.length > 0) score += 15;
  if (profil.formations && profil.formations.length > 0) score += 10;
  if (profil.competences && profil.competences.length >= 3) score += 10;
  if (profil.langues && profil.langues.length > 0) score += 5;
  return Math.min(score, 100);
}

export function calculerScore(profilCompetences: string[], offreCompetences: string[]): number {
  if (offreCompetences.length === 0) return 0;
  const norm = (s: string) => s.toLowerCase().trim();
  const profil = profilCompetences.map(norm);
  const offre = offreCompetences.map(norm);
  const intersection = profil.filter((c) => offre.includes(c)).length;
  const combined = profil.concat(offre.filter(c => !profil.includes(c)));
  const union = combined.length;
  if (union === 0) return 0;
  return Math.round((intersection / union) * 100);
}

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}

export function hashIp(ip: string): string {
  // Simple hash côté lib (utiliser crypto.createHash dans les routes API)
  let hash = 5381;
  for (let i = 0; i < ip.length; i++) {
    hash = (hash << 5) + hash + ip.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}
