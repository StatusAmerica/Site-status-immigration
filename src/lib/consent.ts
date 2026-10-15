export const CONSENT_KEY = "status_consent_v1";
export const CONSENT_EVENT = "status:consent";
export type Consent = { analytics: boolean; marketing: boolean; updatedAt: string; version: 1 };
let memory: Consent | null = null;
export function getConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  let raw;
  try {
    raw = window.localStorage.getItem(CONSENT_KEY);
  } catch {
    return memory;
  }
  try {
    const value = JSON.parse(raw || "null");
    const age = Date.now() - Date.parse(value?.updatedAt);
    if (
      value?.version === 1 &&
      typeof value.analytics === "boolean" &&
      typeof value.marketing === "boolean" &&
      age >= 0 &&
      age < 180 * 86400000
    )
      return value;
    return null;
  } catch {
    return null;
  }
}
export function hasAnalyticsConsent() {
  return getConsent()?.analytics === true;
}
export function hasMarketingConsent() {
  return getConsent()?.marketing === true;
}
export function saveConsent(analytics: boolean, marketing: boolean) {
  memory = { analytics, marketing, version: 1, updatedAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(memory));
  } catch {
    /* memory fallback */
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
  if (!analytics || !marketing) {
    const domains = window.location.hostname.split(".");
    for (const cookie of document.cookie.split(";")) {
      const name = cookie.split("=")[0].trim();
      if (
        (!analytics && /^(_ga|_gid|_gat)/.test(name)) ||
        (!marketing && /^(_gcl_|_fbp|_fbc)/.test(name))
      ) {
        document.cookie = `${name}=; Max-Age=0; path=/`;
        for (let index = 0; index < domains.length - 1; index++)
          document.cookie = `${name}=; Max-Age=0; path=/; domain=${domains.slice(index).join(".")}`;
      }
    }
  }
}
