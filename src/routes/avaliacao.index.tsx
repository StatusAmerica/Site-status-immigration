/**
 * /avaliacao. LP dedicada de conversão (form como página).
 *
 * Layout vertical single-column, ocupando toda a página. Sem padronagem de
 * fundo: ink sólido + glow gold sutil no topo. O form é o protagonista.
 *
 * Query params:
 *  - ?seg=medicos|engenheiros|empresarios → pré-seleciona profissão e
 *    personaliza headline.
 *  - utm_*, src, gclid, fbclid etc. → preservados na captura.
 *
 * SEO: noindex,nofollow e fora do sitemap.
 */

import { useEffect, useMemo } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { LeadFormProgressive } from "@/components/site/LeadFormProgressive";
import { getOrigin } from "@/lib/origin";
import type { QualResult } from "@/lib/leadQualification";
import { saveQualificationResult, type QualificationResult } from "@/components/site/ObrigadoContent";
import avaliacaoBg from "@/assets/avaliacao-bg.jpg";
import { BrandLogo } from "@/components/site/BrandLogo";


type SegKey = "medicos" | "engenheiros" | "empresarios";

interface AvaliacaoSearch {
  seg?: string;
  src?: string;
  [k: string]: string | undefined;
}

const SEG_DEFAULTS: Record<SegKey, { headline: string; profissao: string }> = {
  medicos: {
    headline: "Triagem inicial para médicos brasileiros.",
    profissao: "medico",
  },
  engenheiros: {
    headline: "Triagem inicial para engenheiros brasileiros.",
    profissao: "engenheiro",
  },
  empresarios: {
    headline: "Triagem inicial para empresários brasileiros.",
    profissao: "empresario",
  },
};

export const Route = createFileRoute("/avaliacao/")({
  validateSearch: (s: Record<string, unknown>): AvaliacaoSearch => {
    const out: AvaliacaoSearch = {};
    Object.entries(s).forEach(([k, v]) => {
      if (typeof v === "string") out[k] = v;
    });
    return out;
  },
  head: () => ({
    meta: [
      { title: "Levantamento inicial de informações EB-2 NIW | Status Immigration Law Firm" },
      {
        name: "description",
        content:
          "Levantamento inicial de informações, gratuito e confidencial para o EB-2 NIW.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AvaliacaoPage,
});

function AvaliacaoPage() {
  const search = useSearch({ from: "/avaliacao/" });
  const navigate = useNavigate();


  // Captura origem silenciosamente, fica disponível no payload do lead (admin/tracking)
  useEffect(() => {
    getOrigin("/avaliacao");
  }, []);


  const segKey = useMemo<SegKey | null>(() => {
    const s = search.seg as SegKey | undefined;
    return s && SEG_DEFAULTS[s] ? s : null;
  }, [search.seg]);

  const headline = segKey
    ? SEG_DEFAULTS[segKey].headline
    : "Entenda quais documentos costumam ser exigidos pelo USCIS em cada categoria.";

  const goToThanks = (qualification: QualResult) => {
    saveQualificationResult(qualification as QualificationResult);
    navigate({
      to: qualification === "qualificado"
        ? "/avaliacao/obrigado-qualificado"
        : "/avaliacao/obrigado-nao-qualificado",
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header sticky compacto */}
      <header className="sticky top-0 z-20 px-3 pt-3">
        <div className="liquid-glass container-x flex h-[64px] items-center justify-between rounded-full">
          <Link to="/" className="flex items-center" aria-label="Status Immigration Law Firm. Início">
            <BrandLogo priority className="h-12 w-12" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-mono-label text-foreground/70 hover:text-gold"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Voltar ao site
          </Link>
        </div>
      </header>

      <main className="flex-1 relative">
        {/* Imagem de fundo: bairro americano ao crepúsculo, baixa opacidade */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[720px] pointer-events-none overflow-hidden"
        >
          <img
            src={avaliacaoBg}
            alt=""
            width={1920}
            height={1280}
            className="w-full h-full object-cover opacity-[0.07] brightness-110 saturate-50"
          />
          {/* Véu claro e champagne para manter legibilidade sem escurecer a jornada. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, color-mix(in oklab, white 76%, transparent) 0%, color-mix(in oklab, var(--champagne) 88%, transparent) 55%, var(--background) 100%), radial-gradient(ellipse at 50% 0%, color-mix(in oklab, var(--gold) 12%, transparent) 0%, transparent 65%)",
            }}
          />
        </div>


        <div className="relative mx-auto w-full max-w-[680px] px-5 md:px-6 py-10 md:py-12">
          {/* Intro */}
          <div className="text-center">
            <h1 className="display-2 text-foreground">
              {headline}
            </h1>

            <p className="mt-5 text-base md:text-lg text-foreground/80 leading-relaxed max-w-[560px] mx-auto">
              Perguntas rápidas sobre o seu perfil. Nossa equipe analisa e responde pelo
              canal informado.
            </p>

          </div>

          {/* Origem capturada silenciosamente, visível apenas no admin/tracking de cada lead */}


          <div className="mt-6">
            <LeadFormProgressive
              segmentId={segKey ?? undefined}
              defaultProfissao={segKey ? SEG_DEFAULTS[segKey].profissao : undefined}
              onSubmitted={(lead) => goToThanks(lead.qualification)}
              submitLabel="Enviar para análise"
              currentPath="/avaliacao"
            />
          </div>




          <div className="mt-8 flex items-start gap-3 text-xs text-foreground/80 border-l border-gold/40 pl-4">
            <ShieldCheck className="h-4 w-4 text-gold mt-0.5 shrink-0" />
            <span>
              Empresa registrada nos EUA (EIN 42-4745152) e no Brasil (CNPJ 62.917.376/0001-21).
              Sede em Orlando, FL · Filial em Barueri/SP.
            </span>
          </div>
        </div>
      </main>

      <footer className="border-t border-gold/15 bg-champagne">
        <div className="container-x py-8 text-xs text-foreground/80 leading-relaxed max-w-4xl">
          <p className="font-mono-label text-foreground/80">
            © {new Date().getFullYear()} STATUS IMMIGRATION LAW FIRM PLLC · EIN 42-4745152
          </p>
        </div>
      </footer>
    </div>
  );
}
