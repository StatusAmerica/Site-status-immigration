import { hasAnalyticsConsent, hasMarketingConsent } from "./consent";
export const ATTRIBUTION_KEY = "status_attribution_v1";
const CAMPAIGN_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;
export type Touch = {
  params: Record<string, string>;
  landing_page: string;
  referrer: string;
  captured_at: string;
};
export type Attribution = { first: Touch; last: Touch; expires_at: number };
let memory: Attribution | null = null;
// Analytics never receives arbitrary URL paths, query strings or result tokens.
export function safePage(path: string): string {
  const clean = path.split(/[?#]/)[0];
  if (/^\/pre-qualificacao\/r\//.test(clean)) return "/pre-qualificacao/r/:token";
  if (/^\/(admin|auth|api)(\/|$)/.test(clean)) return "/private";
  const pages = [
    "/",
    "/avaliacao",
    "/avaliacao/whatsapp",
    "/avaliacao/obrigado",
    "/avaliacao/obrigado-qualificado",
    "/avaliacao/obrigado-nao-qualificado",
    "/contato",
    "/pre-qualificacao",
    "/privacidade",
    "/termos",
    "/sobre",
    "/blog",
  ];
  const normalized = clean.replace(/\/$/, "") || "/";
  if (pages.includes(normalized)) return normalized;
  for (const prefix of ["/blog/", "/vistos/", "/lp/"])
    if (clean.startsWith(prefix)) return prefix + ":slug";
  return "/other";
}
export function clearAttribution() {
  memory = null;
  try {
    window.localStorage.removeItem(ATTRIBUTION_KEY);
    for (const key of [
      "sna_last_path",
      "sna_last_title",
      "sna_prev_path",
      "sna_prev_title",
      "sna_landing",
      "sna_referrer",
      "sna_session_id",
    ])
      window.sessionStorage.removeItem(key);
    for (const key of ["status_sessions", "status_ab_assignments", "status_ab_stats"])
      window.localStorage.removeItem(key);
  } catch {
    /* unavailable */
  }
}
export function captureAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  if (!hasAnalyticsConsent()) {
    clearAttribution();
    return null;
  }
  let raw;
  try {
    raw = window.localStorage.getItem(ATTRIBUTION_KEY);
  } catch {
    /* use memory */
  }
  if (raw !== undefined) {
    try {
      memory = JSON.parse(raw || "null");
    } catch {
      memory = null;
    }
  }
  const validTouch = (touch: Touch | undefined) =>
    touch &&
    typeof touch.landing_page === "string" &&
    typeof touch.referrer === "string" &&
    Number.isFinite(Date.parse(touch.captured_at)) &&
    touch.params &&
    typeof touch.params === "object" &&
    !Array.isArray(touch.params) &&
    Object.values(touch.params).every((value) => typeof value === "string" && value.length <= 200);
  if (
    !validTouch(memory?.first) ||
    !validTouch(memory?.last) ||
    !Number.isFinite(memory?.expires_at) ||
    memory!.expires_at <= Date.now() ||
    memory!.expires_at > Date.now() + 30 * 86400000
  )
    memory = null;
  const params: Record<string, string> = {};
  const search = new URLSearchParams(window.location.search);
  for (const key of [...CAMPAIGN_KEYS, ...(hasMarketingConsent() ? ["gclid", "fbclid"] : [])]) {
    const value = search.get(key)?.trim();
    if (value) params[key] = value.slice(0, 200);
  }
  // Floating CTA navigation must not replace the acquisition campaign.
  if (params.utm_source === "whatsapp_popup")
    for (const key of Object.keys(params)) delete params[key];
  let referrer = "";
  try {
    const ref = new URL(document.referrer);
    if (ref.origin !== window.location.origin) referrer = ref.origin;
  } catch {
    /* absent */
  }
  const touch: Touch = {
    params,
    landing_page: safePage(window.location.pathname),
    referrer,
    captured_at: new Date().toISOString(),
  };
  if (!memory) memory = { first: touch, last: touch, expires_at: Date.now() + 30 * 86400000 };
  else if (
    Object.keys(params).length &&
    JSON.stringify(params) !== JSON.stringify(memory.last.params)
  )
    memory.last = touch;
  if (!hasMarketingConsent())
    for (const item of [memory.first, memory.last]) {
      delete item.params.gclid;
      delete item.params.fbclid;
    }
  try {
    window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(memory));
  } catch {
    /* memory fallback */
  }
  return memory;
}
