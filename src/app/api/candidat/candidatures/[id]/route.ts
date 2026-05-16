// src/app/api/candidat/candidatures/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const candidature = await prisma.candidature.findUnique({
    where: { id: params.id, candidatId: session.user.id },
    include: {
      offre: {
        include: { entreprise: { select: { nomEntreprise: true, logoUrl: true, ville: true, siteWeb: true } } },
      },
      historique: { orderBy: { createdAt: "asc" } },
      entretiens: { orderBy: { dateHeure: "asc" } },
    },
  });
  if (!candidature) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json({ data: candidature });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const schema = z.object({ notesCandidatPrivee: z.string().max(2000).optional() });
  const body = schema.parse(await req.json());

  const candidature = await prisma.candidature.findUnique({
    where: { id: params.id, candidatId: session.user.id },
  });
  if (!candidature) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const updated = await prisma.candidature.update({
    where: { id: params.id },
    data: { notesCandidatPrivee: body.notesCandidatPrivee },
  });
  return NextResponse.json({ data: updated });
}
