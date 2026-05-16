// src/app/api/admin/ads/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/logger";
import { z } from "zod";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const schema = z.object({
    isActive: z.boolean().optional(), priorite: z.number().min(1).max(10).optional(),
    startDate: z.string().optional(), endDate: z.string().optional(),
    titre: z.string().optional(), description: z.string().optional(),
    ctaText: z.string().optional(), linkUrl: z.string().url().optional(),
  });
  const body = schema.parse(await req.json());

  const now = new Date();
  const ad = await prisma.ad.findUnique({ where: { id: params.id } });
  if (!ad) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const start = body.startDate ? new Date(body.startDate) : ad.startDate;
  const end = body.endDate ? new Date(body.endDate) : ad.endDate;
  const isActive = body.isActive ?? ad.isActive;
  const statut = start > now ? "PLANIFIE" : end < now ? "EXPIRE" : isActive ? "ACTIF" : "PAUSE";

  const updated = await prisma.ad.update({ where: { id: params.id }, data: { ...body, startDate: start, endDate: end, statut: statut as any } });
  await logAction({ action: "AD_MODIFIEE", userId: session.user.id, cible: params.id });
  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  await prisma.ad.delete({ where: { id: params.id } });
  await logAction({ action: "AD_SUPPRIMEE", userId: session.user.id, cible: params.id });
  return NextResponse.json({ success: true });
}
