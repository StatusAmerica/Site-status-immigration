import { hasAnalyticsConsent } from "./consent";
import { safePage } from "./attribution";
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
type Params = Record<string, unknown>;
const received = new Set<string>();
export const FORM_IDS = [
  "avaliacao",
  "avaliacao-whatsapp",
  "avaliacao-legacy",
  "contato",
  "pre-qualificacao",
] as const;
export type FormId = (typeof FORM_IDS)[number];
export function trackEvent(
  event: "page_view" | "form_start" | "generate_lead" | "click_whatsapp",
  meta: Params = {},
) {
  if (
    typeof window === "undefined" ||
    !hasAnalyticsConsent() ||
    safePage(window.location.pathname) === "/private"
  )
    return;
  const page = safePage(window.location.pathname);
  // Explicit allowlist; nulls prevent values from leaking between GTM events.
  const params: Params = {
    page_path: page,
    page_location: window.location.origin + page,
    page_title: page,
    page_referrer: "",
    form_id: null,
    form_name: null,
    lead_channel: null,
    link_type: null,
  };
  if (FORM_IDS.includes(meta.form_name as FormId))
    params.form_id = params.form_name = meta.form_name;
  if (event === "generate_lead") params.lead_channel = "form";
  if (event === "click_whatsapp") params.link_type = "whatsapp";
  (window.dataLayer ||= []).push({ event, ...params });
}
export function trackFormStart(meta: Params = {}) {
  trackEvent("form_start", { form_name: "avaliacao", ...meta });
}
/** Only acknowledged dataStore submissions call this. Receipts stay out of GA4. */
export function trackReceivedLead(receipt: string, form: FormId) {
  if (received.has(receipt)) return;
  received.add(receipt);
  trackEvent("generate_lead", { form_name: form });
}
export function trackWhatsAppOpened(_meta?: Params) {
  trackEvent("click_whatsapp");
}
