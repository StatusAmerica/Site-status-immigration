/** TEMPORÁRIO — diagnóstico do envio de leads ao CRM. Requer admin logado.
 * Remover junto com o log quando o problema do webhook estiver resolvido. */
import { createFileRoute } from "@tanstack/react-router";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/admin/crm-diag")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { getAdminEmail } = await import("@/lib/adminAuth.server");
        if (!(await getAdminEmail(request))) return json({ error: "não autorizado" }, 401);
        try {
          const { readCrmDiag } = await import("@/lib/crm.server");
          const rows = await readCrmDiag(50);
          return json({ count: rows.length, rows });
        } catch (e) {
          return json({ error: String(e) }, 200);
        }
      },
    },
  },
});
