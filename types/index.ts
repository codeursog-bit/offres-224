// types/index.ts
import { Role, ContratType, OffreStatut, CandidatureStatut, AdPlacement } from "@prisma/client";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserPublic {
  id: string;
  email: string;
  role: Role;
  prenom?: string;
  nom?: string;
}

export interface OffreWithEntreprise {
  id: string;
  titre: string;
  entreprise: {
    nomEntreprise: string;
    logoUrl: string | null;
    isVerifiee: boolean;
    ville: string | null;
  };
  ville: string;
  contratType: ContratType;
  salaireMin: number | null;
  salaireMax: number | null;
  publishedAt: Date | null;
  isPremium: boolean;
  isUrgent: boolean;
}