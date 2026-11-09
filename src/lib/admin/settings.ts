/**
 * Settings store, wrappers tipados sobre a tabela `settings` (chave/valor).
 *
 * Centraliza branding, contatos, links sociais e tracking. Lido pelo site
 * público com fallback aos defaults abaixo; editado no admin (Links,
 * Tracking, Configurações).
 */

import { get, set } from "@/lib/dataStore";

export interface SiteSettings {
  // Configurações gerais
  site_name: string;
  site_tagline: string;
  primary_color: string; // hex
  accent_color: string;  // hex

  // Contatos
  whatsapp_br: string;       // E.164 sem +, ex 5511999999999
  whatsapp_us: string;
  email: string;
  phone_br: string;
  phone_us: string;
  endereco_orlando?: string;
  endereco_dc: string;
  cnpj?: string;

  // Redes
  instagram_url: string;
  facebook_url: string;
  linkedin_url: string;
  youtube_url: string;

  // CTAs globais
  cta_hero_label: string;
  cta_form_label: string;
}

export interface TrackingSettings {
  ga4_id: string;          ga4_enabled: boolean;
  gtm_id: string;          gtm_enabled: boolean;
  meta_pixel_id: string;   meta_pixel_enabled: boolean;
  gsc_verification: string; gsc_enabled: boolean;
  rdstation_id: string;    rdstation_enabled: boolean;
  custom_head: string;     custom_head_enabled: boolean;
  webhook_url: string;     webhook_enabled: boolean;
}

export const defaultSettings: SiteSettings = {
  site_name: "Status Immigration Law Firm",
  site_tagline: "Green Card EB-2 NIW para profissionais brasileiros",
  primary_color: "#C9A24B",
  accent_color: "#0B0B0C",

  // Contatos reais (Prompt 5). WhatsApp Brasil configurado para triagem via /avaliacao/whatsapp.
  whatsapp_br: "5531973386303",
  whatsapp_us: "",
  email: "rogerio@statusimmigrationlaw.com",
  phone_br: "+55 31 9 7338-6303",
  phone_us: "",
  endereco_orlando: "",
  endereco_dc: "1500 K Street NW, 2nd Floor, Washington, DC 20005, United States",
  cnpj: "",

  instagram_url: "https://www.instagram.com/statusimmigrationbr/",
  facebook_url: "https://www.facebook.com/StatusAdvocaciaBrasil/",
  linkedin_url: "",
  youtube_url: "https://youtube.com/@status.naamerica",

  cta_hero_label: "Iniciar triagem do meu caso",
  cta_form_label: "Iniciar triagem do meu caso",
};

export const defaultTracking: TrackingSettings = {
  ga4_id: "", ga4_enabled: false,
  gtm_id: "", gtm_enabled: false,
  meta_pixel_id: "", meta_pixel_enabled: false,
  gsc_verification: "", gsc_enabled: false,
  rdstation_id: "", rdstation_enabled: false,
  custom_head: "", custom_head_enabled: false,
  webhook_url: "", webhook_enabled: false,
};

const SETTINGS_KEY = "site";
const TRACKING_KEY = "tracking";

export async function getSiteSettings(): Promise<SiteSettings> {
  const row = await get<SiteSettings>("settings", SETTINGS_KEY);
  const merged: SiteSettings = { ...defaultSettings, ...(row ?? {}) };
  if (!merged.email?.trim() || /statusnaamerica\.com/i.test(merged.email)) {
    merged.email = defaultSettings.email;
  }
  if (!merged.phone_br?.trim()) {
    merged.phone_br = defaultSettings.phone_br;
  }
  if (!merged.endereco_dc?.trim()) {
    merged.endereco_dc = defaultSettings.endereco_dc;
  }
  if (!merged.instagram_url?.trim() || /status_america|statusamerica/i.test(merged.instagram_url)) {
    merged.instagram_url = defaultSettings.instagram_url;
  }
  if (!merged.facebook_url?.trim() || /statusnaamerica/i.test(merged.facebook_url)) {
    merged.facebook_url = defaultSettings.facebook_url;
  }
  merged.endereco_orlando = "";
  merged.cnpj = "";
  return merged;
}

export async function saveSiteSettings(values: Partial<SiteSettings>): Promise<void> {
  const current = await getSiteSettings();
  await set("settings", SETTINGS_KEY, { ...current, ...values });
  broadcast();
}

export async function getTrackingSettings(): Promise<TrackingSettings> {
  const row = await get<TrackingSettings>("settings", TRACKING_KEY);
  return { ...defaultTracking, ...(row ?? {}) };
}

export async function saveTrackingSettings(values: Partial<TrackingSettings>): Promise<void> {
  const current = await getTrackingSettings();
  await set("settings", TRACKING_KEY, { ...current, ...values });
  broadcast();
}

/* -------- media (logo/og/heros) -------- */

export interface MediaAsset {
  id: string;        // slot: logo, favicon, og_default, hero_home, hero_<segment>
  url: string;       // URL ou data:base64
  alt?: string;
  updatedAt: string;
}

export const mediaSlots = [
  { id: "logo", label: "Logo principal" },
  { id: "favicon", label: "Favicon" },
  { id: "og_default", label: "OG Image padrão" },
  { id: "hero_home", label: "Hero da Home" },
  { id: "hero_medicos", label: "Hero. Médicos" },
  { id: "hero_engenheiros", label: "Hero. Engenheiros" },
  { id: "hero_empresarios", label: "Hero. Empresários" },
];

export async function getMedia(slot: string): Promise<MediaAsset | null> {
  return get<MediaAsset>("media", slot);
}

export async function saveMedia(slot: string, url: string, alt?: string): Promise<void> {
  const asset: MediaAsset = { id: slot, url, alt, updatedAt: new Date().toISOString() };
  await set("media", slot, asset);
  broadcast();
}

/* -------- broadcast (sincroniza abas) -------- */

const CHANNEL = "status_admin_change";

export function broadcast() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHANNEL, String(Date.now()));
    window.dispatchEvent(new CustomEvent("status:admin-change"));
  } catch { /* noop */ }
}
