// lib/logger.ts
import { prisma } from "./prisma";
import { LogNiveau, Prisma } from "@prisma/client";

/**
 * Enregistre une action dans les logs système.
 * Le type LogNiveau provient directement de ton schéma Prisma.
 */
export async function logAction(
  niveau: "info" | "warning" | "error", 
  action: string, 
  userId?: string, 
  details?: any
) {
  try {
    // Mapping pour transformer tes strings minuscules en Enum Prisma (souvent en MAJUSCULES)
    const niveauEnum: LogNiveau = 
      niveau === 'error' ? LogNiveau.ERROR : 
      niveau === 'warning' ? LogNiveau.WARNING : 
      LogNiveau.INFO;

    await prisma.logSysteme.create({
      data: { 
        niveau: niveauEnum, 
        action, 
        userId,
        // On s'assure que details est compatible avec le type JSON de Prisma
        details: details ? (details as Prisma.InputJsonValue) : Prisma.DbNull 
      }
    });
  } catch (e) { 
    console.error("Logging failed:", e); 
  }
}