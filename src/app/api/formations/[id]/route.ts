// src/app/api/formations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();

  const formation = await prisma.formationCourse.findUnique({
    where: { id: params.id, statut: "PUBLIEE" },
    include: {
      modules: { orderBy: { ordre: "asc" } },
      avis: { orderBy: { createdAt: "desc" }, take: 10 },
      _count: { select: { inscriptions: true } },
    },
  });
  if (!formation) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  let isInscrit = false;
  if (session) {
    const insc = await prisma.formationInscription.findUnique({
      where: { formationId_userId: { formationId: params.id, userId: session.user.id } },
    });
    isInscrit = !!insc;
  }

  return NextResponse.json({ data: { ...formation, isInscrit } });
}
