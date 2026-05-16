// src/app/api/rh/pipeline/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "RH") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const schema = z.object({ etape: z.enum(["A_CONTACTER","CONTACTE","ENTRETIEN","RETENU","REFUSE"]), noteInterne: z.string().max(1000).optional() });
  const body = schema.parse(await req.json());

  const entreprise = await prisma.profilEntreprise.findUnique({ where: { userId: session.user.id } });
  if (!entreprise) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const entry = await prisma.pipelineCandidat.findUnique({ where: { id: params.id, entrepriseId: entreprise.id } });
  if (!entry) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const updated = await prisma.pipelineCandidat.update({ where: { id: params.id }, data: body });
  return NextResponse.json({ data: updated });
}
