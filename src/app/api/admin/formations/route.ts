// src/app/api/admin/formations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/logger";
import { z } from "zod";

const moduleSchema = z.object({
  titre: z.string().min(1).max(200),
  contenu: z.string().min(1),
  ordre: z.number().default(0),
  dureeMin: z.number().optional(),
});

const createSchema = z.object({
  titre: z.string().min(2).max(200),
  description: z.string().min(10),
  formateur: z.string().min(2).max(200),
  secteur: z.string().optional(),
  niveau: z.enum(["DEBUTANT","INTERMEDIAIRE","AVANCE"]).default("DEBUTANT"),
  dureeHeures: z.number().positive().optional(),
  prix: z.number().min(0).optional(),
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  statut: z.enum(["BROUILLON","PUBLIEE"]).default("BROUILLON"),
  dateDebut: z.string().optional(),
  modules: z.array(moduleSchema).default([]),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1");
  const statut = req.nextUrl.searchParams.get("statut");
  const limit = 20;
  const where: any = {};
  if (statut) where.statut = statut;

  const [formations, total] = await Promise.all([
    prisma.formationCourse.findMany({
      where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" },
      include: { _count: { select: { inscriptions: true, avis: true } } },
    }),
    prisma.formationCourse.count({ where }),
  ]);

  return NextResponse.json({ data: formations, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const body = createSchema.parse(await req.json());
    const { modules, ...formationData } = body;

    const formation = await prisma.$transaction(async (tx: any) => {
      const f = await tx.formationCourse.create({
        data: {
          ...formationData,
          prix: formationData.prix ?? null,
          dateDebut: formationData.dateDebut ? new Date(formationData.dateDebut) : null,
        },
      });
      if (modules.length > 0) {
        await tx.formationModule.createMany({
          data: modules.map((m) => ({ formationId: f.id, ...m })),
        });
      }
      return f;
    });

    await logAction({ action: "FORMATION_CREEE", userId: session.user.id, cible: formation.id });
    return NextResponse.json({ success: true, data: { id: formation.id } }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
