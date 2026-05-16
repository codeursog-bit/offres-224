// src/app/api/messages/stream/route.ts — SSE temps réel (next-auth v5)
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { sseRegister, sseUnregister } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const userId = (session.user as any).id as string;
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const writer = {
        write: (data: string) => {
          try { controller.enqueue(encoder.encode(data)); }
          catch { /* client disconnected */ }
        },
      };

      sseRegister(userId, writer);

      // Ping toutes les 25s pour garder la connexion alive
      const pingInterval = setInterval(() => {
        try { controller.enqueue(encoder.encode("event:ping\ndata:{}\n\n")); }
        catch { clearInterval(pingInterval); }
      }, 25000);

      // Message de connexion initial
      controller.enqueue(encoder.encode(`event:connected\ndata:{"userId":"${userId}"}\n\n`));

      req.signal.addEventListener("abort", () => {
        clearInterval(pingInterval);
        sseUnregister(userId);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
    cancel() {
      sseUnregister(userId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
