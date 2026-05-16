// src/app/api/admin/formations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/logger";
import { z } from "zod";

const patchSchema = z.object({
  titre: z.string().min(2).max(200).optional(),
  description: z.string().min(10).optional(),
  formateur: z.string().optional(),
  secteur: z.string().optional(),
  niveau: z.enum(["DEBUTANT","INTERMEDIAIRE","AVANCE"]).optional(),
  dureeHeures: z.number().positive().optional(),
  prix: z.number().min(0).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  statut: z.enum(["BROUILLON","PUBLIEE","ARCHIVEE"]).optional(),
  dateDebut: z.string().optional().nullable(),
  modules: z.array(z.object({
    titre: z.string().min(1),
    contenu: z.string().min(1),
    ordre: z.number().default(0),
    dureeMin: z.number().optional(),
  })).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const body = patchSchema.parse(await req.json());
    const { modules, ...fields } = body;

    const updated = await prisma.$transaction(async (tx: any) => {
      const f = await tx.formationCourse.update({
        where: { id: params.id },
        data: {
          ...fields,
          dateDebut: fields.dateDebut ? new Date(fields.dateDebut) : fields.dateDebut === null ? null : undefined,
        },
      });
      if (modules !== undefined) {
        await tx.formationModule.deleteMany({ where: { formationId: params.id } });
        if (modules.length > 0) {
          await tx.formationModule.createMany({
            data: modules.map((m) => ({ formationId: params.id, ...m })),
          });
        }
      }
      return f;
    });

    await logAction({ action: "FORMATION_MODIFIEE", userId: session.user.id, cible: params.id });
    return NextResponse.json({ data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  await prisma.formationCourse.update({ where: { id: params.id }, data: { statut: "ARCHIVEE" } });
  await logAction({ action: "FORMATION_ARCHIVEE", userId: session.user.id, cible: params.id });
  return NextResponse.json({ success: true });
}
