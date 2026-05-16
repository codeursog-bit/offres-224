// src/app/api/formations/[id]/inscription/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const existing = await prisma.formationInscription.findUnique({
    where: { formationId_userId: { formationId: params.id, userId: session.user.id } },
  });
  if (existing) return NextResponse.json({ error: "Déjà inscrit" }, { status: 409 });

  const formation = await prisma.formationCourse.findUnique({ where: { id: params.id, statut: "PUBLIEE" } });
  if (!formation) return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });

  await prisma.$transaction([
    prisma.formationInscription.create({ data: { formationId: params.id, userId: session.user.id } }),
    prisma.formationCourse.update({ where: { id: params.id }, data: { nbInscrits: { increment: 1 } } }),
  ]);

  return NextResponse.json({ success: true }, { status: 201 });
}
