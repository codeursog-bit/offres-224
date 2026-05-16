// src/app/api/entreprises/[id]/avis/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  note: z.number().min(1).max(5),
  titre: z.string().max(200).optional(),
  commentaire: z.string().max(1000).optional(),
  isAnonyme: z.boolean().default(false),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = schema.parse(await req.json());

    // Vérifier que le candidat a postulé à une offre de cette entreprise
    const entreprise = await prisma.profilEntreprise.findUnique({ where: { id: params.id } });
    if (!entreprise) return NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 });

    const userId = (session.user as any).id;

    const existing = await prisma.avisEntreprise.findUnique({
      where: { entrepriseId_userId: { entrepriseId: params.id, userId } },
    });
    if (existing) return NextResponse.json({ error: "Vous avez déjà laissé un avis" }, { status: 409 });

    const avis = await prisma.$transaction(async (tx: any) => {
      const a = await tx.avisEntreprise.create({
        data: { entrepriseId: params.id, userId, ...body },
      });
      // Recalculer note globale
      const stats = await tx.avisEntreprise.aggregate({
        where: { entrepriseId: params.id },
        _avg: { note: true },
        _count: { note: true },
      });
      await tx.profilEntreprise.update({
        where: { id: params.id },
        data: { noteGlobale: stats._avg.note, nbAvis: stats._count.note },
      });
      return a;
    });

    return NextResponse.json({ data: avis }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Invalide" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
