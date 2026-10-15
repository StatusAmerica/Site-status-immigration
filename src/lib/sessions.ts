import { hasAnalyticsConsent } from "./consent";
/**
 * sessions.ts, rastreio de sessões do site (client-side).
 *
 * Uma "sessão" = uma aba do navegador (sessionStorage). Para cada sessão
 * registramos UM documento em dataStore["sessions"] com:
 *   - origem (UTM + referrer + landing_path)
 *   - flags incrementais de conversão (form iniciado, completo, qualificado)
 *
 * Usado em /admin/origens para calcular:
 *   - total de sessões
 *   - taxa de conversão sessão → lead
 *   - taxa de qualidade qualificados / sessões
 *
 * Persistência via dataStore (localStorage). Para SSR, todos os métodos
 * fazem no-op no servidor.
 */
import { newId, get, set } from "./dataStore";
import { getOrigin, type LeadOrigin } from "./origin";

const SS_SESSION_ID = "sna_session_id";

export interface SessionRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  origin: LeadOrigin;
  /** Usuário começou o formulário (1+ campo válido). */
  startedForm: boolean;
  /** Usuário concluiu o formulário (lead completo). */
  converted: boolean;
  /** Lead concluído foi avaliado como qualificado (heurística + score). */
  qualified: boolean;
  /** Score do lead (quando completo), referência para score médio por canal. */
  score: number | null;
}

const isBrowser = () => typeof window !== "undefined";

function currentSessionId(): string | null {
  if (!isBrowser() || !hasAnalyticsConsent()) return null;
  try { return window.sessionStorage.getItem(SS_SESSION_ID); } catch { return null; }
}

/**
 * Garante que existe uma sessão para a aba atual. Chamado uma vez por
 * pageview no __root.tsx, só cria o registro na primeira vez.
 */
export async function ensureSession(currentPath?: string): Promise<void> {
  if (!isBrowser() || !hasAnalyticsConsent()) return;
  try {
    const existingId = window.sessionStorage.getItem(SS_SESSION_ID);
    if (existingId) {
      const existing = await get<SessionRecord>("sessions", existingId);
      if (existing) return;
    }
    const id = newId("ses");
    window.sessionStorage.setItem(SS_SESSION_ID, id);
    const rec: SessionRecord = {
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      origin: getOrigin(currentPath),
      startedForm: false,
      converted: false,
      qualified: false,
      score: null,
    };
    await set("sessions", id, rec);
  } catch {
    /* ignore */
  }
}

async function patchSession(patch: Partial<SessionRecord>): Promise<void> {
  if (!hasAnalyticsConsent()) return;
  const id = currentSessionId();
  if (!id) return;
  try {
    const cur = await get<SessionRecord>("sessions", id);
    if (!cur) return;
    await set("sessions", id, { ...cur, ...patch, updatedAt: new Date().toISOString() });
  } catch { /* ignore */ }
}

export function markSessionStartedForm(): Promise<void> {
  return patchSession({ startedForm: true });
}

export function markSessionConverted(opts: { qualified: boolean; score: number | null }): Promise<void> {
  return patchSession({ converted: true, startedForm: true, qualified: opts.qualified, score: opts.score });
}
