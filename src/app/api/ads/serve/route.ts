import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { $Enums } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  placement: z.nativeEnum($Enums.AdPlacement),
  city: z.string().optional(),
  secteur: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const { placement, city, secteur } = schema.parse(params);
    const now = new Date();

    const ad = await prisma.ad.findFirst({
      where: {
        placement,
        statut: "ACTIF",
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
        ...(city ? { OR: [{ cibleVilles: { isEmpty: true } }, { cibleVilles: { has: city } }] } : {}),
        ...(secteur ? { OR: [{ cibleSecteurs: { isEmpty: true } }, { cibleSecteurs: { has: secteur } }] } : {}),
      },
      orderBy: { priorite: "desc" },
      select: { id: true, imageUrl: true, linkUrl: true, titre: true, description: true, ctaText: true, annonceur: true, couleurFond: true, placement: true },
    });

    if (!ad) return NextResponse.json(null);

    prisma.ad.update({ where: { id: ad.id }, data: { impressionsCount: { increment: 1 } } }).catch(() => {});

    return NextResponse.json(ad);
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json(null);
    return NextResponse.json(null);
  }
}