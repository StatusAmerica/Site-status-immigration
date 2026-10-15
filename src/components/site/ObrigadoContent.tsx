/**
 * Conteúdo das páginas de agradecimento pós-formulário.
 *
 * Os componentes são renderizados dentro de `/avaliacao/obrigado`, que decide
 * qual versão mostrar com base no `lastQualificationResult` do sessionStorage.
 * Assim o URL permanece discreto e não revela "qualificado" / "não qualificado".
 */
import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, BookOpen, FileText, ChevronLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/site/BrandLogo";

const SS_QUALIFICATION = "lastQualificationResult";

export type QualificationResult = "qualificado" | "nao_qualificado";

export function saveQualificationResult(result: QualificationResult) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SS_QUALIFICATION, result);
  } catch { /* noop */ }
}

export function readQualificationResult(): QualificationResult | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.sessionStorage.getItem(SS_QUALIFICATION);
    if (v === "qualificado" || v === "nao_qualificado") return v;
  } catch { /* noop */ }
  return null;
}

/** Layout compartilhado: header, footer e container central. */
function ObrigadoShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-20 px-3 pt-3">
        <div className="liquid-glass container-x flex h-[64px] items-center justify-between rounded-full">
          <Link to="/" className="flex items-center gap-3" aria-label="Status Immigration Law Firm">
            <BrandLogo priority className="h-12 w-12" />
          </Link>
          <Link to="/" className="inline-flex items-center gap-1 text-xs font-mono-label text-foreground/70 hover:text-gold">
            <ChevronLeft className="h-3.5 w-3.5" /> Voltar ao site
          </Link>
        </div>
      </header>

      <main className="flex-1 relative">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[420px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, color-mix(in oklab, var(--gold) 6%, transparent) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-[720px] px-5 md:px-6 py-12 md:py-16">
          {children}
        </div>
      </main>

      <footer className="border-t border-gold/15 bg-champagne">
        <div className="container-x py-8 text-xs text-foreground/80 leading-relaxed max-w-4xl">
          <p>
            Status Immigration Law Firm é um escritório de advocacia especializado em imigração federal.
            Licensed in NY and AZ. Federal immigration practice only.
          </p>
          <p className="mt-3 font-mono-label text-foreground/80">
            © {new Date().getFullYear()} STATUS IMMIGRATION LAW FIRM PLLC · EIN 42-4745152
          </p>
        </div>
      </footer>
    </div>
  );
}

export function ObrigadoQualificado() {

  return (
    <ObrigadoShell>
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center border border-gold/60 text-gold rounded-full">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="mt-8 inline-flex items-center justify-center gap-3">
          <span aria-hidden className="h-px w-10 bg-gold" />
          <span className="font-mono-label text-[11px] text-gold">PERFIL RECEBIDO</span>
          <span aria-hidden className="h-px w-10 bg-gold" />
        </div>

        <h1 className="mt-6 display-2 text-foreground">
          Obrigado. Sua análise está em andamento.
        </h1>

        <p className="mt-6 text-base md:text-lg text-foreground/80 leading-relaxed max-w-[560px] mx-auto">
          Nossa equipe vai analisar o seu perfil com atenção e entrar em contato em
          até 48h pelo canal informado.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://www.instagram.com/statusamerica.br/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" variant="outline" className="btn-label h-12 px-6 border-gold/40 text-foreground hover:bg-gold/10">
              Conheça nossas redes sociais
            </Button>
          </a>
          <Link to="/">
            <Button size="lg" variant="outline" className="btn-label h-12 px-6 border-gold/40 text-foreground hover:bg-gold/10">
              Voltar ao site
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid sm:grid-cols-3 gap-4 text-left">
          {[
            { n: "01", t: "Análise individual", d: "Olhamos o seu histórico, formação, impacto e contexto familiar." },
            { n: "02", t: "Sugestão de caminho", d: "Sinalizamos a categoria EB mais coerente com o seu perfil." },
            { n: "03", t: "Próximos passos", d: "Se fizer sentido, agendamos uma conversa para encaminhar a análise jurídica do caso." },
          ].map((s) => (
            <div key={s.n} className="liquid-card p-4 rounded-xl">
              <div className="font-display text-3xl text-gold leading-none">{s.n}</div>
              <h3 className="mt-3 font-display text-base">{s.t}</h3>
              <p className="mt-2 text-sm text-foreground/70 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </ObrigadoShell>
  );
}

export function ObrigadoNaoQualificado() {

  return (
    <ObrigadoShell>
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center border border-border bg-card text-foreground/80 rounded-full shadow-soft">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="mt-8 inline-flex items-center justify-center gap-3">
          <span aria-hidden className="h-px w-10 bg-foreground/30" />
          <span className="font-mono-label text-[11px] text-foreground/70">PERFIL REGISTRADO</span>
          <span aria-hidden className="h-px w-10 bg-foreground/30" />
        </div>

        <h1 className="mt-6 display-2 text-foreground">
          Recebemos seu perfil, vamos guardar seu contato.
        </h1>

        <p className="mt-6 text-base md:text-lg text-foreground/80 leading-relaxed max-w-[600px] mx-auto">
          Pelo que você compartilhou, hoje o seu perfil ainda não atende a todos os
          critérios mínimos que costumamos recomendar para os vistos EB-2 NIW ou EB-1.
          Isso pode mudar conforme sua carreira evolui, e nós continuamos por aqui.
        </p>

        <div className="mt-12">
          <div className="text-center mb-6">
            <span className="font-mono-label text-[11px] text-gold">ENQUANTO ISSO, CONHEÇA O CAMINHO</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Link
              to="/vistos/$slug"
              params={{ slug: "eb2-niw" }}
              className="liquid-card group p-6 rounded-2xl hover:border-gold/60 transition-colors"
            >
              <FileText className="h-6 w-6 text-gold" />
              <h3 className="mt-4 font-display text-lg text-foreground">Guia do EB-2 NIW</h3>
              <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
                Entenda os critérios, o processo e o que costuma fortalecer um caso.
              </p>
              <span className="mt-4 inline-block font-mono-label text-[11px] text-gold group-hover:underline">
                LER O GUIA →
              </span>
            </Link>

            <Link
              to="/blog"
              className="liquid-card group p-6 rounded-2xl hover:border-gold/60 transition-colors"
            >
              <BookOpen className="h-6 w-6 text-gold" />
              <h3 className="mt-4 font-display text-lg text-foreground">Artigos do blog</h3>
              <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
                Conteúdo prático sobre carreira, documentação e preparação para o processo.
              </p>
              <span className="mt-4 inline-block font-mono-label text-[11px] text-gold group-hover:underline">
                VER ARTIGOS →
              </span>
            </Link>
          </div>
        </div>

        <div className="mt-12 border-t border-border/50 pt-6 flex items-start gap-3 text-sm text-foreground/70">
          <Mail className="h-4 w-4 text-gold mt-0.5 shrink-0" />
          <span>
            Quer conversar mesmo assim? Escreva para{" "}
            <a href="mailto:contato@statusnaamerica.com" className="text-gold hover:underline">
              contato@statusnaamerica.com
            </a>{" "}
           , vamos te orientar.
          </span>
        </div>

        <div className="mt-10 text-center">
          <Link to="/">
            <Button size="lg" variant="outline" className="btn-label h-12 px-6 border-gold/40 text-foreground hover:border-gold hover:bg-gold/5">
              Voltar para o site
            </Button>
          </Link>
        </div>
      </div>
    </ObrigadoShell>
  );
}

export function ObrigadoFallback() {
  return (
    <ObrigadoShell>
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center border border-gold/60 text-gold rounded-full">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="mt-8 inline-flex items-center justify-center gap-3">
          <span aria-hidden className="h-px w-10 bg-gold" />
          <span className="font-mono-label text-[11px] text-gold">PERFIL RECEBIDO</span>
          <span aria-hidden className="h-px w-10 bg-gold" />
        </div>

        <h1 className="mt-6 display-2 text-foreground">
          Obrigado pelo envio.
        </h1>

        <p className="mt-6 text-base md:text-lg text-foreground/80 leading-relaxed max-w-[560px] mx-auto">
          Recebemos seu perfil. Nossa equipe vai analisar e entrar em contato em até 48h.
        </p>

        <div className="mt-10 text-center">
          <Link to="/">
            <Button size="lg" variant="outline" className="btn-label h-12 px-6 border-gold/40 text-foreground hover:border-gold hover:bg-gold/5">
              Voltar para o site
            </Button>
          </Link>
        </div>
      </div>
    </ObrigadoShell>
  );
}
