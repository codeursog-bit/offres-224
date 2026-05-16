import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/logger";
import { $Enums } from "@prisma/client";
import { z } from "zod";

const adSchema = z.object({
  nomCampagne: z.string().min(2).max(200),
  annonceur: z.string().min(2).max(200),
  placement: z.nativeEnum($Enums.AdPlacement),
  priorite: z.number().min(1).max(10).default(5),
  imageUrl: z.string().url(),
  linkUrl: z.string().url(),
  titre: z.string().max(100).optional(),
  description: z.string().max(300).optional(),
  ctaText: z.string().max(50).optional(),
  couleurFond: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#FFFFFF"),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean().default(false),
  cibleVilles: z.array(z.string()).default([]),
  cibleSecteurs: z.array(z.string()).default([]),
  cibleUtilisateur: z.string().default("TOUS"),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1");
  const statut = req.nextUrl.searchParams.get("statut");
  const placement = req.nextUrl.searchParams.get("placement");
  const limit = 20;
  const where: any = {};
  if (statut) where.statut = statut;
  if (placement) where.placement = placement;

  const [ads, total] = await Promise.all([
    prisma.ad.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" }, include: { _count: { select: { events: true } } } }),
    prisma.ad.count({ where }),
  ]);

  return NextResponse.json({ data: ads, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const body = adSchema.parse(await req.json());
    const now = new Date();
    const start = new Date(body.startDate);
    const end = new Date(body.endDate);

    if (end <= start) return NextResponse.json({ error: "Date fin doit être après date début" }, { status: 422 });

    const statut: $Enums.AdStatut = start > now ? "PLANIFIE" : end < now ? "EXPIRE" : body.isActive ? "ACTIF" : "PAUSE";

    const ad = await prisma.ad.create({
      data: { ...body, startDate: start, endDate: end, statut, creePar: session.user.id, cibleUtilisateur: body.cibleUtilisateur as $Enums.AdCibleUtilisateur },
    });

    await logAction({ action: "AD_CREEE", userId: session.user.id, cible: ad.id, details: { nomCampagne: body.nomCampagne } });
    return NextResponse.json({ success: true, data: { id: ad.id } }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}