import { createFileRoute } from "@tanstack/react-router";
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...(status === 429 ? { "Retry-After": "600" } : {}),
    },
  });
}
export const Route = createFileRoute("/api/kv")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { runKv } = await import("@/lib/kv.server");
        const { getAdminEmail } = await import("@/lib/adminAuth.server");
        const origin = request.headers.get("origin");
        if (origin && origin !== new URL(request.url).origin)
          return json({ error: "origem inválida" }, 403);
        if (!request.headers.get("content-type")?.includes("application/json"))
          return json({ error: "JSON obrigatório" }, 415);
        const admin = !!(await getAdminEmail(request));
        const maxBody = admin ? 1_900_000 : 32_768;
        const reader = request.body?.getReader();
        if (!reader) return json({ error: "JSON inválido" }, 400);
        const chunks: Uint8Array[] = [];
        let length = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          length += value.byteLength;
          if (length > maxBody) {
            await reader.cancel();
            return json({ error: "payload grande demais" }, 413);
          }
          chunks.push(value);
        }
        const bytes = new Uint8Array(length);
        let offset = 0;
        for (const chunk of chunks) {
          bytes.set(chunk, offset);
          offset += chunk.byteLength;
        }
        let body;
        try {
          body = JSON.parse(new TextDecoder().decode(bytes));
        } catch {
          return json({ error: "JSON inválido" }, 400);
        }
        const token = (request.headers.get("x-client-token") ?? "").slice(0, 100) || "anon";
        try {
          // CF-Connecting-IP is supplied by Cloudflare, never trust X-Forwarded-For.
          const result = await runKv(body, {
            admin,
            token,
            ip: request.headers.get("CF-Connecting-IP") || "local",
          });
          return json({ data: result.data ?? null, error: result.error }, result.status);
        } catch (err) {
          console.error("[api/kv] storage_operation_failed", err);
          return json({ error: "Não foi possível confirmar o recebimento. Tente novamente." }, 500);
        }
      },
    },
  },
});
