import { createFileRoute } from "@tanstack/react-router";
// The former public URL proxy is retired. CRM delivery awaits a verified contract.
export const Route = createFileRoute("/api/public/lead-webhook")({
  server: {
    handlers: {
      POST: async () =>
        new Response(
          JSON.stringify({ ok: false, error: "Integração pendente de CRM_INTEGRATION_SPEC.md" }),
          {
            status: 410,
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
          },
        ),
    },
  },
});
