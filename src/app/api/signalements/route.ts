// src/app/api/signalements/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { notifierAdmins } from "@/lib/notifications";
import { z } from "zod";

const schema = z.object({
  type: z.enum(["OFFRE_FRAUDULEUSE","CONTENU_INAPPROPRIE","ENTREPRISE_ARNAQUE","CANDIDAT_SUSPECT","AUTRE"]),
  offreId: z.string().cuid().optional(),
  description: z.string().min(20, "Minimum 20 caractères").max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = schema.parse(await req.json());

    const signalement = await prisma.signalement.create({
      data: { signaleurId: session.user.id, ...body },
    });

    // Notifier les admins (urgence si fraude)
    await notifierAdmins({
      type: "SYSTEME",
      titre: body.type.includes("FRAUDE") || body.type.includes("ARNAQUE")
        ? "🚨 Signalement urgent"
        : "Nouveau signalement",
      contenu: `${body.type}: ${body.description.slice(0, 80)}`,
      lien: `/admin/signalements`,
    });

    return NextResponse.json({ success: true, data: { id: signalement.id } }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const statut = req.nextUrl.searchParams.get("statut");
  const type = req.nextUrl.searchParams.get("type");
  const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1");
  const limit = 20;

  const where: any = {};
  if (statut) where.statut = statut;
  if (type) where.type = type;

  const [signalements, total] = await Promise.all([
    prisma.signalement.findMany({
      where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" },
      include: {
        signaleur: { select: { id: true, email: true, profilCandidat: { select: { prenom: true, nom: true } } } },
        offre: { select: { id: true, titre: true, entreprise: { select: { nomEntreprise: true } } } },
      },
    }),
    prisma.signalement.count({ where }),
  ]);

  return NextResponse.json({ data: signalements, total, page, pages: Math.ceil(total / limit) });
}
