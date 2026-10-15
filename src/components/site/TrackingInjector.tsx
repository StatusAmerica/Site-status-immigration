import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { CONSENT_EVENT, CONSENT_KEY, getConsent, saveConsent } from "@/lib/consent";
import { captureAttribution, safePage } from "@/lib/attribution";
import { trackEvent } from "@/lib/tracking";
import { getTrackingSettings } from "@/lib/admin/settings";
export const GTM_ID = "GTM-5ZFTCPP6";
let initialized = false;
let loaded = false;
let previousPage = "";
function command(..._args: unknown[]) {
  // Google's command queue expects the Arguments object used by the gtag snippet.
  // eslint-disable-next-line prefer-rest-params
  (window.dataLayer ||= []).push(arguments);
}
function applyConsent() {
  loaded ||= !!document.getElementById("status-gtm");
  if (!initialized) {
    command("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    initialized = true;
  }
  const consent = getConsent();
  command("consent", "update", {
    analytics_storage: consent?.analytics ? "granted" : "denied",
    ad_storage: consent?.marketing ? "granted" : "denied",
    ad_user_data: consent?.marketing ? "granted" : "denied",
    ad_personalization: consent?.marketing ? "granted" : "denied",
  });
  captureAttribution();
  if (safePage(window.location.pathname) === "/private") {
    if (loaded) window.location.reload();
    return;
  }
  if (!consent?.analytics) return;
  if (!loaded) {
    loaded = true;
    (window.dataLayer ||= []).push({ "gtm.start": Date.now(), event: "gtm.js" });
    const script = document.createElement("script");
    script.id = "status-gtm";
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtm.js?id=" + GTM_ID;
    document.head.appendChild(script);
  }
  const page = window.location.pathname;
  if (previousPage !== page) {
    previousPage = page;
    trackEvent("page_view");
  }
}
export function TrackingInjector() {
  const href = useRouterState({ select: (s) => s.location.href });
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void getTrackingSettings().then((settings) => {
      if (cancelled || !settings.gsc_enabled || !settings.gsc_verification) return;
      if (document.querySelector('meta[name="google-site-verification"]')) return;
      const meta = document.createElement("meta");
      meta.name = "google-site-verification";
      meta.content = settings.gsc_verification;
      document.head.appendChild(meta);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    const sync = () => {
      const c = getConsent();
      setAnalytics(c?.analytics ?? false);
      setMarketing(c?.marketing ?? false);
      setOpen(!c);
      applyConsent();
    };
    sync();
    const storage = (event: StorageEvent) => {
      if (event.key === CONSENT_KEY || event.key === null) {
        sync();
        window.location.reload();
      }
    };
    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener("storage", storage);
    const click = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!link) return;
      try {
        const url = new URL(link.getAttribute("href")!, window.location.origin);
        if (
          ["wa.me", "api.whatsapp.com", "web.whatsapp.com"].includes(url.hostname) ||
          url.protocol === "whatsapp:"
        )
          trackEvent("click_whatsapp");
      } catch {
        /* invalid href */
      }
    };
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener("storage", storage);
      document.removeEventListener("click", click, true);
    };
  }, []);
  useEffect(() => {
    applyConsent();
  }, [href]);
  if (safePage(href) === "/private") return null;
  const choose = (a: boolean, m: boolean) => {
    const old = getConsent();
    saveConsent(a, a && m);
    setOpen(false);
    // Third-party code cannot be unloaded reliably; reload on revocation.
    if ((old?.analytics && !a) || (old?.marketing && !m)) window.location.reload();
  };
  return (
    <>
      <button
        className="fixed bottom-2 left-2 z-50 rounded bg-background px-3 py-2 text-xs shadow"
        onClick={() => setOpen(true)}
      >
        Preferências de privacidade
      </button>
      {open && (
        <section
          role="dialog"
          aria-label="Preferências de privacidade"
          className="fixed bottom-12 left-4 right-4 z-[100] max-w-xl rounded-xl border bg-background p-5 shadow-xl"
        >
          <h2 className="font-semibold">Sua privacidade</h2>
          <p className="my-3 text-sm">
            Com sua permissão, usamos ferramentas para medir visitas e campanhas. Você pode enviar
            formulários sem aceitar.{" "}
            <a href="/privacidade" className="underline">
              Política de privacidade
            </a>
            .
          </p>
          <label className="block text-sm">
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => {
                setAnalytics(e.target.checked);
                if (!e.target.checked) setMarketing(false);
              }}
            />{" "}
            Medição de visitas e origem das campanhas
          </label>
          <label className="my-3 block text-sm">
            <input
              type="checkbox"
              checked={marketing}
              disabled={!analytics}
              onChange={(e) => setMarketing(e.target.checked)}
            />{" "}
            Publicidade e identificadores de clique
          </label>
          <div className="flex flex-wrap gap-3 text-sm">
            <button className="rounded border px-3 py-2" onClick={() => choose(false, false)}>
              Recusar opcionais
            </button>
            <button
              className="rounded border px-3 py-2"
              onClick={() => choose(analytics, marketing)}
            >
              Salvar escolhas
            </button>
            <button className="rounded border px-3 py-2" onClick={() => choose(true, true)}>
              Aceitar todos
            </button>
          </div>
        </section>
      )}
    </>
  );
}
