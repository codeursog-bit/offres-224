// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/logger";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères").max(128),
  role: z.enum(["CANDIDAT", "RH"]),
  prenom: z.string().min(1).max(50).optional().or(z.literal("")),
  nom: z.string().min(1).max(50).optional().or(z.literal("")),
  telephone: z.string().optional().or(z.literal("")),
  ville: z.string().optional().or(z.literal("")),
  nomEntreprise: z.string().max(100).optional().or(z.literal("")),
  secteur: z.string().optional().or(z.literal("")),
  numeroRCCM: z.string().optional().or(z.literal("")),
  nomResponsable: z.string().optional().or(z.literal("")),
  cgu: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });
    if (existing) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.$transaction(async (tx: any) => {
      const u = await tx.user.create({
        data: {
          email: data.email.toLowerCase().trim(),
          passwordHash,
          role: data.role,
        },
      });

      if (data.role === "CANDIDAT") {
        await tx.profilCandidat.create({
          data: {
            userId: u.id,
            prenom: data.prenom || "",
            nom: data.nom || "",
            telephone: data.telephone || null,
            ville: data.ville || null,
            profilComplete: 20,
          },
        });
      } else {
        await tx.profilEntreprise.create({
          data: {
            userId: u.id,
            nomEntreprise: data.nomEntreprise || "",
            secteur: data.secteur || null,
            numeroRCCM: data.numeroRCCM || null,
            ville: data.ville || null,
          },
        });
      }

      return u;
    });

    await logAction({ action: "USER_REGISTER", userId: user.id, details: { role: data.role } });

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    }
    console.error("[REGISTER]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}