// src/app/api/rh/entreprise/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/logger";
import { z } from "zod";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "RH") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const entreprise = await prisma.profilEntreprise.findUnique({
    where: { userId: session.user.id },
    include: { _count: { select: { offres: true, avisRecus: true } } },
  });
  if (!entreprise) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  return NextResponse.json({ data: entreprise });
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "RH") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const schema = z.object({
      nomEntreprise: z.string().min(2).max(100).optional(),
      secteur: z.string().optional(),
      tailleEntreprise: z.string().optional(),
      description: z.string().max(2000).optional(),
      logoUrl: z.string().url().optional().nullable(),
      siteWeb: z.string().url().optional().nullable(),
      adresse: z.string().max(200).optional(),
      ville: z.string().optional(),
      numeroRCCM: z.string().optional(),
    });
    const body = schema.parse(await req.json());

    const current = await prisma.profilEntreprise.findUnique({ where: { userId: session.user.id } });

    // Si RCCM modifié → reset vérification
    const resetVerif = body.numeroRCCM && body.numeroRCCM !== current?.numeroRCCM
      ? { isVerifiee: false, verifieeAt: null, verifieeBy: null }
      : {};

    const updated = await prisma.profilEntreprise.update({
      where: { userId: session.user.id },
      data: { ...body, ...resetVerif },
    });

    await logAction({ action: "ENTREPRISE_PROFIL_MODIFIE", userId: session.user.id, cible: updated.id });
    return NextResponse.json({ data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
