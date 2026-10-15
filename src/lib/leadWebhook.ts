/** CRM delivery is intentionally disabled until CRM_INTEGRATION_SPEC.md is supplied. */
export async function sendLeadWebhook(_lead: Record<string, unknown>): Promise<void> {}
export async function testLeadWebhook(_url: string): Promise<void> {
  throw new Error("Integração pendente de CRM_INTEGRATION_SPEC.md");
}
