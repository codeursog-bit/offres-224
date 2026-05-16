// src/app/api/admin/parametres/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/logger";
import { z } from "zod";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const params = await prisma.parametre.findMany({ orderBy: { cle: "asc" } });
  return NextResponse.json({ data: params });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const schema = z.object({ cle: z.string().min(1), valeur: z.string(), label: z.string().optional(), type: z.string().optional() });
  const body = schema.parse(await req.json());

  const param = await prisma.parametre.upsert({
    where: { cle: body.cle },
    create: { cle: body.cle, valeur: body.valeur, label: body.label, type: body.type ?? "string" },
    update: { valeur: body.valeur },
  });

  await logAction({ action: "PARAMETRE_MODIFIE", userId: session.user.id, details: { cle: body.cle, valeur: body.valeur } });
  return NextResponse.json({ data: param });
}
