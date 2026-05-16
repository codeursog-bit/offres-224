// types/index.ts — Types globaux sans dépendance Prisma
export interface ApiResponse<T = unknown> { success: boolean; data?: T; error?: string; }
export interface PaginatedResponse<T> { data: T[]; total: number; page: number; pages: number; hasNext: boolean; }
export interface SessionUser { id: string; email: string; role: string; prenom?: string; nom?: string; }
export interface OffrePublique {
  id: string; titre: string; ville: string; contratType: string; secteur?: string | null;
  salaireMin?: number | null; salaireMax?: number | null; salaireNonDivulgue: boolean;
  isPremium: boolean; isUrgent: boolean; publishedAt?: Date | string | null;
  dateLimite?: Date | string | null; vues: number;
  entreprise: { nomEntreprise: string; logoUrl?: string | null; isVerifiee?: boolean; ville?: string | null; };
}
export interface EntreprisePublique {
  id: string; nomEntreprise: string; secteur?: string | null; ville?: string | null;
  logoUrl?: string | null; isVerifiee: boolean; noteGlobale?: number | null; nbAvis: number;
}
