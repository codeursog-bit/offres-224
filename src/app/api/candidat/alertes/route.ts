// src/app/api/candidat/alertes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  nom: z.string().min(1).max(100),
  motsCles: z.string().optional(),
  ville: z.string().optional(),
  secteur: z.string().optional(),
  contratType: z.enum(["CDI","CDD","STAGE","INTERIM","FREELANCE","TEMPS_PARTIEL"]).optional(),
  salaireMin: z.number().positive().optional(),
  niveauExp: z.enum(["SANS_EXPERIENCE","JUNIOR","INTERMEDIAIRE","SENIOR","EXPERT"]).optional(),
  frequence: z.enum(["IMMEDIATE","QUOTIDIENNE","HEBDOMADAIRE"]).default("QUOTIDIENNE"),
});

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const alertes = await prisma.alerteEmploi.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ data: alertes });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const count = await prisma.alerteEmploi.count({ where: { userId: session.user.id } });
  if (count >= 10) return NextResponse.json({ error: "Maximum 10 alertes" }, { status: 400 });

  const body = schema.parse(await req.json());
  const alerte = await prisma.alerteEmploi.create({ data: { userId: session.user.id, ...body } });
  return NextResponse.json({ data: alerte }, { status: 201 });
}
