import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { TrackingInjector } from "../components/site/TrackingInjector";
import { trackRouteChange } from "../lib/origin";
import { ensureSession } from "../lib/sessions";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#FCFCFB" },
      { property: "og:site_name", content: "Status Immigration Law Firm" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:type", content: "website" },
      { title: "Status Immigration Law Firm | Mobilidade Imigratória para brasileiros" },
      { property: "og:title", content: "Status Immigration Law Firm | Mobilidade Imigratória para brasileiros" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Status Immigration Law Firm | Mobilidade Imigratória para brasileiros" },
      { name: "description", content: "Imigração legal aos EUA por mérito profissional. Levantamento inicial de informações para vistos EB-2 NIW, EB-1 e EB-3, com Green Card para cônjuge e filhos, junto do requerente principal." },
      { property: "og:description", content: "Imigração legal aos EUA por mérito profissional. Levantamento inicial de informações para vistos EB-2 NIW, EB-1 e EB-3, com Green Card para cônjuge e filhos, junto do requerente principal." },
      { name: "twitter:description", content: "Imigração legal aos EUA por mérito profissional. Levantamento inicial de informações para vistos EB-2 NIW, EB-1 e EB-3, com Green Card para cônjuge e filhos, junto do requerente principal." },
      { property: "og:image", content: "https://statusimmigrationlaw.com.br/__l5e/assets-v1/db6af206-dff3-4b36-b8f2-a6d534ba74a4/og-home.jpg" },
      { name: "twitter:image", content: "https://statusimmigrationlaw.com.br/__l5e/assets-v1/db6af206-dff3-4b36-b8f2-a6d534ba74a4/og-home.jpg" },
      { name: "facebook-domain-verification", content: "yeorkfek3h2k9nnm3dr34cgy4lx6ga" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      // Fontes Sora + Manrope auto-hospedadas via @fontsource em styles.css.
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  // key muda a cada pathname → reanima o fade na troca de rota
  const pathname = router.state.location.pathname;

  // Rastreia rota interna anterior em sessionStorage para o admin saber
  // de onde o lead veio (página do site, não só utm_*).
  useEffect(() => {
    trackRouteChange(pathname, typeof document !== "undefined" ? document.title : undefined);
    // Garante uma sessão por aba, alimenta /admin/origens com total de
    // visitantes, não só leads.
    void ensureSession(pathname);
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <TrackingInjector />
      <div key={pathname} id="conteudo" tabIndex={-1} className="route-fade focus:outline-none">
        <Outlet />
      </div>
    </QueryClientProvider>
  );
}

