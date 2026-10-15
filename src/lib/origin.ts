import { hasAnalyticsConsent } from "./consent";
import { captureAttribution, safePage } from "./attribution";
/**
 * origin.ts, captura de origem do lead (UTM + página interna).
 *
 * Combina:
 *  - utm_*, gclid, fbclid, src (querystring no momento do submit)
 *  - referrer externo (document.referrer)
 *  - última rota interna conhecida ANTES de chegar em /avaliacao
 *    (mantida por um listener no __root.tsx em sessionStorage)
 *  - landing path/title (primeira página vista nesta sessão)
 *
 * Persistência puramente client-side (sessionStorage). Nada aqui toca
 * scoring, A/B ou tracking, é só metadado para o admin.
 */
export interface LeadOrigin {
  utm: Record<string, string>;
  internal: {
    from_path: string | null;   // rota interna anterior à /avaliacao
    from_title: string | null;
    referrer: string | null;    // document.referrer (externo)
    landing_path: string | null; // primeira rota da sessão
    landing_ts: string | null;
  };
}

const SS_LAST_PATH = "sna_last_path";
const SS_LAST_TITLE = "sna_last_title";
const SS_PREV_PATH = "sna_prev_path";
const SS_PREV_TITLE = "sna_prev_title";
const SS_LANDING = "sna_landing";
const SS_REFERRER = "sna_referrer";

const isBrowser = () => typeof window !== "undefined";

/**
 * Chamado pelo __root.tsx a cada mudança de rota.
 *
 * Mantém DOIS slots: `last` (rota atual) e `prev` (rota imediatamente
 * anterior). Ao chegar em /avaliacao, `prev` guarda a LP de origem,
 * `last` seria a própria /avaliacao (e por isso é filtrada em getOrigin).
 */
export function trackRouteChange(pathname: string, title?: string) {
  if (!isBrowser() || !hasAnalyticsConsent()) return;
  pathname = safePage(pathname);
  captureAttribution();
  try {
    // landing: só seta uma vez por sessão
    if (!sessionStorage.getItem(SS_LANDING)) {
      sessionStorage.setItem(
        SS_LANDING,
        JSON.stringify({ path: pathname, ts: new Date().toISOString() }),
      );
      if (document.referrer) { try { sessionStorage.setItem(SS_REFERRER, new URL(document.referrer).origin); } catch { /* invalid */ } }
    }
    // Antes de sobrescrever "last", promove o valor atual para "prev",
    // desde que seja uma rota diferente (evita prev == last após reload/StrictMode).
    const currentLast = sessionStorage.getItem(SS_LAST_PATH);
    const currentLastTitle = sessionStorage.getItem(SS_LAST_TITLE);
    if (currentLast && currentLast !== pathname) {
      sessionStorage.setItem(SS_PREV_PATH, currentLast);
      if (currentLastTitle) sessionStorage.setItem(SS_PREV_TITLE, currentLastTitle);
      else sessionStorage.removeItem(SS_PREV_TITLE);
    }
    sessionStorage.setItem(SS_LAST_PATH, pathname);
    sessionStorage.setItem(SS_LAST_TITLE, pathname);
  } catch {
    /* sessionStorage indisponível, ignorar */
  }
}

/**
 * Snapshot da origem para gravar junto do lead (parcial ou completo).
 * `currentPath` é passado para não confundir a própria rota de captura
 * (ex.: /avaliacao) com a "origem".
 */
export function getOrigin(currentPath?: string): LeadOrigin {
  const utm: Record<string, string> = {};
  if (!isBrowser() || !hasAnalyticsConsent()) {
    return {
      utm,
      internal: { from_path: null, from_title: null, referrer: null, landing_path: null, landing_ts: null },
    };
  }
  try {
    Object.assign(utm, captureAttribution()?.last.params ?? {});

    const lastPath = sessionStorage.getItem(SS_LAST_PATH);
    const lastTitle = sessionStorage.getItem(SS_LAST_TITLE);
    const prevPath = sessionStorage.getItem(SS_PREV_PATH);
    const prevTitle = sessionStorage.getItem(SS_PREV_TITLE);
    const referrer = sessionStorage.getItem(SS_REFERRER) || null;
    const landingRaw = sessionStorage.getItem(SS_LANDING);
    let landing_path: string | null = null;
    let landing_ts: string | null = null;
    if (landingRaw) {
      try {
        const l = JSON.parse(landingRaw) as { path: string; ts: string };
        landing_path = l.path;
        landing_ts = l.ts;
      } catch { /* ignore */ }
    }
    // Escolhe a melhor "página interna anterior":
    // 1) `last` se for diferente da rota atual (usuário chegou aqui de outra página)
    // 2) `prev` se `last` for a própria rota atual (ex.: já está em /avaliacao)
    let from_path: string | null = null;
    let from_title: string | null = null;
    if (lastPath && lastPath !== currentPath) {
      from_path = lastPath;
      from_title = lastTitle;
    } else if (prevPath && prevPath !== currentPath) {
      from_path = prevPath;
      from_title = prevTitle;
    }
    return {
      utm,
      internal: {
        from_path,
        from_title,
        referrer: referrer || null,
        landing_path,
        landing_ts,
      },
    };
  } catch {
    return {
      utm,
      internal: { from_path: null, from_title: null, referrer: null, landing_path: null, landing_ts: null },
    };
  }
}

/**
 * Texto curto para exibir na LP ("Você veio de: …").
 * Prioriza utm_campaign / utm_source; cai para from_path; depois referrer.
 */
export function describeOrigin(o: LeadOrigin): string | null {
  const { utm, internal } = o;
  const parts: string[] = [];
  if (utm.utm_campaign) parts.push(`Campanha: ${utm.utm_campaign}`);
  else if (utm.utm_source) parts.push(`Fonte: ${utm.utm_source}`);
  if (internal.from_path) parts.push(`Página: ${internal.from_path}`);
  else if (internal.referrer && !internal.from_path) {
    try {
      const host = new URL(internal.referrer).host;
      parts.push(`Origem: ${host}`);
    } catch { /* ignore */ }
  }
  return parts.length ? parts.join(" · ") : null;
}
