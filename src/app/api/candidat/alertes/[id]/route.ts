// src/app/api/candidat/alertes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const schema = z.object({ isActive: z.boolean().optional(), nom: z.string().optional(), frequence: z.enum(["IMMEDIATE","QUOTIDIENNE","HEBDOMADAIRE"]).optional() });
  const body = schema.parse(await req.json());

  const alerte = await prisma.alerteEmploi.findUnique({ where: { id: params.id, userId: session.user.id } });
  if (!alerte) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const updated = await prisma.alerteEmploi.update({ where: { id: params.id }, data: body });
  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const alerte = await prisma.alerteEmploi.findUnique({ where: { id: params.id, userId: session.user.id } });
  if (!alerte) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  await prisma.alerteEmploi.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
