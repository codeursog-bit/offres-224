// src/app/api/messages/route.ts — Conversations & messages
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { notifierUser, sseEmit } from "@/lib/notifications";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const conversationId = req.nextUrl.searchParams.get("conversationId");

  if (conversationId) {
    // Messages d'une conversation
    const membre = await prisma.conversationMembre.findUnique({
      where: { conversationId_userId: { conversationId, userId: session.user.id } },
    });
    if (!membre) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const messages = await prisma.message.findMany({
      where: { conversationId, isDeleted: false },
      orderBy: { createdAt: "asc" },
      include: { expediteur: { select: { id: true, profilCandidat: { select: { prenom: true, nom: true, photoUrl: true } }, profilEntreprise: { select: { nomEntreprise: true, logoUrl: true } } } } },
    });

    // Marquer comme lus
    await prisma.conversationMembre.update({
      where: { conversationId_userId: { conversationId, userId: session.user.id } },
      data: { lastReadAt: new Date() },
    });

    return NextResponse.json({ data: messages });
  }

  // Liste des conversations
  const conversations = await prisma.conversation.findMany({
    where: { membres: { some: { userId: session.user.id } } },
    orderBy: { updatedAt: "desc" },
    include: {
      membres: {
        include: {
          user: {
            select: {
              id: true,
              profilCandidat: { select: { prenom: true, nom: true, photoUrl: true } },
              profilEntreprise: { select: { nomEntreprise: true, logoUrl: true } },
            },
          },
        },
      },
      messages: { where: { isDeleted: false }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  // Calculer nb non lus par conversation
  const withUnread = await Promise.all(
    conversations.map(async (conv: any) => {
      const membre = conv.membres.find((m: any) => m.userId === session.user.id);
      const nbNonLus = await prisma.message.count({
        where: {
          conversationId: conv.id,
          expediteurId: { not: session.user.id },
          createdAt: membre?.lastReadAt ? { gt: membre.lastReadAt } : undefined,
          isDeleted: false,
        },
      });
      return { ...conv, nbNonLus };
    })
  );

  return NextResponse.json({ data: withUnread });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const schema = z.object({
      conversationId: z.string().cuid().optional(),
      destinataireId: z.string().cuid().optional(),
      contenu: z.string().min(1).max(5000),
      fichierUrl: z.string().url().optional(),
      fichierNom: z.string().max(200).optional(),
      fichierTaille: z.number().optional(),
    });
    const body = schema.parse(await req.json());

    let conversationId = body.conversationId;

    if (!conversationId) {
      if (!body.destinataireId) return NextResponse.json({ error: "destinataireId requis" }, { status: 422 });

      // Chercher conversation existante entre les 2 users
      const existing = await prisma.conversation.findFirst({
        where: {
          AND: [
            { membres: { some: { userId: session.user.id } } },
            { membres: { some: { userId: body.destinataireId } } },
          ],
        },
      });

      if (existing) {
        conversationId = existing.id;
      } else {
        const conv = await prisma.conversation.create({
          data: {
            membres: {
              create: [{ userId: session.user.id }, { userId: body.destinataireId }],
            },
          },
        });
        conversationId = conv.id;
      }
    }

    // Vérifier membership
    const membre = await prisma.conversationMembre.findUnique({
      where: { conversationId_userId: { conversationId, userId: session.user.id } },
    });
    if (!membre) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const message = await prisma.message.create({
      data: {
        conversationId,
        expediteurId: session.user.id,
        contenu: body.contenu,
        fichierUrl: body.fichierUrl,
        fichierNom: body.fichierNom,
        fichierTaille: body.fichierTaille,
      },
      include: {
        expediteur: { select: { id: true, profilCandidat: { select: { prenom: true, nom: true, photoUrl: true } }, profilEntreprise: { select: { nomEntreprise: true, logoUrl: true } } } },
      },
    });

    // Mettre à jour updatedAt conversation
    await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });

    // Notifier + SSE pour chaque autre membre
    const autres = await prisma.conversationMembre.findMany({
      where: { conversationId, userId: { not: session.user.id } },
    });
    for (const m of autres) {
      sseEmit(m.userId, "message", { conversationId, message });
      await notifierUser(m.userId, {
        type: "NOUVEAU_MESSAGE",
        titre: "Nouveau message",
        contenu: body.contenu.slice(0, 80),
        lien: `/dashboard/candidat/messagerie`,
      });
    }

    return NextResponse.json({ data: message }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
