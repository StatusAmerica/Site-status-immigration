/**
 * Seções da Home. Sistema "Dossiê / Credencial".
 *
 * Prompt 5: dados reais + CTAs apontando para LP /avaliacao com src/seg/utms.
 *  - ProcessSteps: substituído pelo processo real EB-2 NIW (4 etapas).
 *  - WhyUs: estatísticas institucionais (todas pendentes de validação
 *           documental — ver src/config/credentials.ts).
 *  - Testimonials: vídeos de casos reais (Helder + slot secundário).
 *  - FAQ: perguntas reais (confiança, experiência, atendimento remoto, valor).
 *  - LegacySection: nova dobra "Muito mais que um visto. Um legado.".
 *  - CtaForm (com form inline) → CtaBanner (CTA forte para /avaliacao).
 *  - AuthorityStrip: credenciais reais (BBB A, EIN, sede Orlando).
 *  - Todos os CTAs usam avaliacaoHref(src[, seg]), preserva utms/seg.
 */

import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, Award, Briefcase, Building2, CheckCircle2, FileText,
  GraduationCap, Heart, Landmark, Layers, MapPin, PlayCircle, Scale, ShieldCheck,
  Sparkles, Star, Stamp, Star as StarIcon, Stethoscope, TrendingUp, Users, Wrench, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Velaris from "@/components/ui/velaris";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { useContent, useVisibleSlot } from "@/lib/siteContent";
import { avaliacaoHref, useAvaliacaoHref } from "@/lib/ctaLinks";
import {
  CLAIM_FAMILIAS,
  CLAIM_PROCESSOS,
  CLAIM_SATISFACAO,
  CLAIM_AVALIACOES,
  BBB_LABEL,
  BBB_PENDING,
  EIN,
  NY_BAR,
} from "@/config/credentials";
import { SectionHead } from "./SectionHead";
import { VideoPlayer } from "./VideoPlayer";
import { FamilySealBackdrop } from "./visuals/FamilySealBackdrop";
import { ProcessIconStrip } from "./visuals/ProcessIconStrip";
import { LeadFormProgressive } from "./LeadFormProgressive";
import { useLocation } from "@tanstack/react-router";
import { FlagsBRUS, FlagBR, FlagUS } from "./flags";
import { PatchBBB, PatchGoogle, PatchEIN } from "./credentialPatches";

import { FlagsBRUSDual } from "./visuals/DualFlagIcons";
import { CardRail } from "./CardRail";


import passportDocuments from "@/assets/passport-documents.jpg";
import usMapEngraving from "@/assets/us-map-engraving.webp";


import visaFamilyFuture from "@/assets/visa-family-future.jpg";
import { PhotoFrame } from "./visa/PhotoFrame";
import { loadSalaryList, SEED_SALARY, type SalaryRow } from "@/lib/salaryList";
import { loadBrList, loadUsList, SEED_BR, SEED_US } from "@/lib/contrastLists";

/* ============================================================
 * 1. HERO
 * ============================================================ */
export function Hero() {
  const eyebrow = useContent("hero.eyebrow");
  const title = useContent("hero.title");
  const sub = useContent("hero.subtitle");
  const cta = useContent("hero.cta");
  const proof = useContent("hero.proof");
  const heroVideoUrl = useContent("hero.videoUrl");
  const heroPosterUrl = useContent("hero.posterUrl");
  // Só renderiza o slot depois que o conteúdo foi resolvido: enquanto não
  // sabemos, o vídeo NÃO aparece (evita o flash do slot oculto).
  const showHeroVideo = useVisibleSlot("hero.videoHidden");
  const heroVideoHidden = !showHeroVideo;
  return (
    <section
      id="abertura"
      aria-label="Abertura"
      className="section-anchor relative overflow-hidden pt-32 md:pt-44 pb-16 md:pb-28 min-h-[92vh] flex items-center"
    >
      <Velaris className="pointer-events-none absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background/20 via-transparent to-background/85" />

      <div className={`container-x grid gap-10 md:gap-16 lg:gap-12 items-center ${heroVideoHidden ? "" : "lg:grid-cols-[1fr_1.1fr]"}`}>
        <div className={`relative min-w-0 ${heroVideoHidden ? "hero-glass-halo mx-auto w-full max-w-5xl px-2 py-8 text-center sm:px-8 md:py-12" : ""}`}>
          <div className={`flex items-center gap-3 ${heroVideoHidden ? "justify-center" : ""}`}>
            <FlagsBRUS size={16} />
            <span aria-hidden className="h-px w-6 bg-gold" />
            <span className="font-mono-label text-gold">{eyebrow}</span>
          </div>

          <h1 className="display-1 mx-auto mt-6 max-w-[19ch] text-balance md:mt-8 [overflow-wrap:normal] [hyphens:none]">
            {renderEmphasis(title)}
          </h1>

          <div className={`mt-10 h-px w-28 bg-gold ${heroVideoHidden ? "mx-auto" : ""}`} />

          <p className={`lead mt-7 max-w-2xl text-balance ${heroVideoHidden ? "mx-auto" : ""}`}>
            {sub}
          </p>

          <div className={`mt-10 grid gap-3 sm:flex sm:flex-wrap ${heroVideoHidden ? "sm:justify-center" : ""}`}>
            <Link to={useAvaliacaoHref("home_hero")} aria-label="Ir para o formulário de triagem inicial">
               <Button size="lg" variant="cta" className="btn-label btn-sweep h-12 w-full px-7 text-[13px] sm:w-auto sm:text-[15px] active:scale-[0.98]">
                {cta}
              </Button>
            </Link>

            <a href="#eb-2-niw">
              <Button
                size="lg" variant="outline"
                 className="liquid-glass btn-label h-12 w-full px-6 text-[13px] border-gold/40 text-foreground hover:border-gold hover:bg-gold/5 sm:w-auto sm:text-[15px]"
              >
                <PlayCircle className="mr-2 h-4 w-4" /> Entenda o EB-2 NIW
              </Button>
            </a>
          </div>

          <div className={`mt-12 flex items-start gap-3 text-sm text-foreground/80 border-l border-gold/50 pl-4 max-w-md ${heroVideoHidden ? "mx-auto text-left" : ""}`}>
            <Star className="h-4 w-4 text-gold mt-0.5 shrink-0 fill-gold" />
            <span>{proof}</span>
          </div>



        </div>

        {/* Bloco editorial estático. Tratamento de cor único (.photo-treatment)
            unifica a foto com o restante do site. */}
        {/* Slot de vídeo horizontal (16:9) — pode ser ocultado no admin (hero.videoHidden). */}
        {!heroVideoHidden && (
          <div className="relative mt-10 lg:mt-0 min-w-0">
            <div className="liquid-glass relative aspect-video w-full overflow-hidden rounded-2xl ring-1 ring-gold/10">
              <VideoPlayer
                url={heroVideoUrl}
                title="Vídeo institucional Status Immigration Law Firm"
                facade
                poster={heroPosterUrl}
              />
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

function renderEmphasis(text: string) {
  const parts = text.split(/(mérito)/i);
  return parts.map((p, i) =>
    /^mérito$/i.test(p)
      ? <span key={i} className="font-display italic text-gold">{p}</span>
      : <span key={i}>{p}</span>
  );
}

/* ============================================================
 * 2. APRESENTAÇÃO DA EMPRESA
 * ============================================================ */
export function CompanyIntroduction() {
  const pillars = [
    {
      icon: Building2,
      eyebrow: "QUEM SOMOS",
      title: "Advocacia de imigração, dos EUA para o Brasil.",
      text: "A Status Immigration Law Firm é um escritório de advocacia especializado exclusivamente em imigração federal, com escritório em Washington, DC e atendimento em português no Brasil e nos Estados Unidos.",
      className: "md:col-span-2",
    },
    {
      icon: FileText,
      eyebrow: "O QUE FAZEMOS",
      title: "Estratégia jurídica e dossiê completo.",
      text: "Atuamos do enquadramento jurídico à construção do dossiê, incluindo formulários, business plan, respostas a RFE e acompanhamento até a decisão.",
      className: "",
    },
    {
      icon: Award,
      eyebrow: "ESPECIALIDADES",
      title: "EB-1, EB-2 NIW e O-1.",
      text: "Nossa atuação para brasileiros é concentrada em EB-1, EB-2 NIW e O-1, conforme os requisitos publicados pelo USCIS.",
      className: "",
    },
  ];

  return (
    <Reveal as="section" id="quem-somos" className="section-champagne relative overflow-hidden border-y border-gold/15 py-12 md:py-16">
      <div className="container-x">
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-mono-label text-gold">STATUS IMMIGRATION LAW FIRM</span>
          <h2 className="display-2 mt-5 text-balance">Segurança jurídica para a sua mobilidade imigratória.</h2>
          <p className="lead mx-auto mt-6 max-w-2xl text-balance">
            Entenda suas possibilidades ainda no Brasil com um escritório dedicado exclusivamente à imigração federal.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2">
          {pillars.map(({ icon: Icon, eyebrow, title: pillarTitle, text, className }, index) => (
            <article
              key={eyebrow}
              className={`liquid-card glass-interactive group rounded-2xl p-5 text-center md:text-left ${className}`}
              style={{ transitionDelay: `${index * 55}ms` }}
            >
              <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl border border-gold/25 bg-white/65 text-gold shadow-soft md:mx-0">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <p className="font-mono-label mt-4 text-gold">{eyebrow}</p>
              <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-foreground sm:text-2xl">{pillarTitle}</h3>
              <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-foreground/72 md:mx-0">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </Reveal>
  );
}


/* ============================================================
 * 3. BRASIL vs EUA
 * ============================================================ */
export function ContrastBrasilEUA() {
  const [brasil, setBrasil] = useState<string[]>(SEED_BR.map((i) => i.texto));
  const [eua, setEua] = useState<string[]>(SEED_US.map((i) => i.texto));
  useEffect(() => {
    let active = true;
    Promise.all([loadBrList(), loadUsList()]).then(([br, us]) => {
      if (!active) return;
      setBrasil(br.filter((i) => i.ativo).map((i) => i.texto));
      setEua(us.filter((i) => i.ativo).map((i) => i.texto));
    });
    return () => { active = false; };
  }, []);
  const title = useContent("contrast.title");
  const subtitle = useContent("contrast.subtitle");

  const cards = [
    {
      code: "BR",
      side: "from" as const,
      eyebrow: "O QUE VOCÊ DEIXA PARA TRÁS",
      title: "Realidade no Brasil",
      items: brasil,
      accent: "#B23A3A",
      cardBg: "bg-[#FBEEEE]",
      Icon: XCircle,
    },
    {
      code: "US",
      side: "to" as const,
      eyebrow: "O QUE VOCÊ CONQUISTA",
      title: "Oportunidades nos EUA",
      items: eua,
      accent: "#2E7D5B",
      cardBg: "bg-[#EEF6F1]",
      Icon: CheckCircle2,
    },
  ] as const;

  return (
    <Reveal as="section" id="brasil-vs-eua" className="section-cream-light relative py-12 md:py-16">
      <div aria-hidden className="tricolor-rule absolute inset-x-0 top-0" />
      <div className="container-x">
        <SectionHead num="01" eyebrow="POR QUE MIGRAR AGORA" title="Duas realidades. Uma decisão." />

        <div className="relative mt-8 grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Divisor central "BR → US" (md+) */}
          <div
            aria-hidden
            className="hidden md:flex absolute inset-y-4 left-1/2 -translate-x-1/2 items-center justify-center z-10 pointer-events-none"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-parchment border border-gold/40 shadow-soft">
              <ArrowRight className="h-3.5 w-3.5 text-gold" />
            </span>
          </div>

          {cards.map(({ code, side, eyebrow, title: cardTitle, items, accent, cardBg, Icon }) => (
            <div
              key={code}
              className={`relative rounded-2xl border border-ink-text/10 shadow-soft ${cardBg} ${
                side === "to" ? "md:ring-1 md:ring-gold/25" : ""
              }`}
              style={{ borderTop: `3px solid ${accent}` }}
            >
              <div className="p-5 md:p-6">
                <div className="flex items-center gap-2.5">
                  <span
                    className="inline-flex items-center justify-center h-7 px-1.5 rounded-full border bg-white/80 shadow-sm"
                    style={{ borderColor: `color-mix(in oklab, ${accent} 55%, transparent)` }}
                    aria-label={code === "BR" ? "Brasil" : "Estados Unidos"}
                  >
                    {code === "BR" ? (
                      <FlagBR color="brand" style={{ width: 22, height: 15 }} />
                    ) : (
                      <FlagUS color="brand" style={{ width: 22, height: 15 }} />
                    )}
                  </span>
                  <span
                    className="font-mono-label text-[10px] tracking-[0.22em]"
                    style={{ color: `color-mix(in oklab, ${accent} 85%, #000 15%)` }}
                  >
                    {eyebrow}
                  </span>
                </div>

                <h3 className="mt-3 font-display uppercase tracking-[0.01em] font-bold text-[clamp(1.125rem,1.9vw,1.4rem)] text-ink-text leading-snug">
                  {cardTitle}
                </h3>

                <ul className="mt-4 space-y-2">
                  {items.map((b) => (
                    <li key={b} className="flex gap-2 text-[15px] text-ink-text/90 leading-snug">
                      <Icon
                        aria-hidden
                        className="mt-[0.15rem] h-[18px] w-[18px] shrink-0"
                        strokeWidth={1.8}
                        style={{ color: accent }}
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 max-w-3xl mx-auto text-center font-display text-lg md:text-xl text-ink-text/70 leading-snug">
          {title} <span className="text-gold italic">{subtitle}</span>
        </p>
      </div>
    </Reveal>
  );
}

/* ============================================================
 * 4. EB-2 NIW
 * ============================================================ */
export function NiwSection() {
  const title = useContent("niw.title");
  const lead = useContent("niw.lead");
  const bullets = [
    { icon: ShieldCheck, t: "Sem necessidade de empregador patrocinador" },
    { icon: Award, t: "Baseado no seu histórico e contribuição profissional" },
    { icon: Heart, t: "Green Card para cônjuge e filhos, junto do requerente principal" },
    { icon: Sparkles, t: "Após cinco anos como residente permanente, é possível solicitar a naturalização, cumpridos os requisitos de residência contínua, presença física e demais exigências do USCIS." },
  ];
  return (
    <Reveal as="section" id="eb-2-niw" className="section-champagne-deep section-pad relative border-y border-gold/10">

      <div className="container-x grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        <div className="min-w-0">
          <SectionHead num="02" eyebrow="VISTO EB-2 NIW" title={title} />
          <p className="mt-6 text-[17px] text-foreground/80 leading-relaxed max-w-xl">{lead}</p>

          <ul className="mt-9 grid sm:grid-cols-2 gap-3">
            {bullets.map(({ icon: Icon, t }) => (
               <li key={t} className="relative gold-tick rounded-xl border border-gold/25 bg-ink-raise/50 p-4">
                <Icon className="h-5 w-5 text-gold mb-3" />
                <span className="text-sm leading-snug text-foreground/90">{t}</span>
              </li>
            ))}
          </ul>
          <a href={useAvaliacaoHref("home_niw")} className="mt-10 block sm:inline-block">
            <Button size="lg" className="btn-label btn-sweep h-12 w-full px-7 sm:w-auto">Quero saber se tenho perfil</Button>
          </a>
        </div>

        <div className="relative min-w-0">

          <div className="photo-treatment aspect-[4/3] overflow-hidden rounded-2xl border border-gold/30 bg-champagne relative shadow-soft max-h-[420px]">
            {/* Foto editorial, passaporte brasileiro + documentos sobre mesa de madeira. */}
            <img
              src={passportDocuments}
              alt="Passaporte brasileiro, documentos e mapa dos Estados Unidos sobre mesa de madeira"
              width={1600}
              height={1024}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div aria-hidden className="photo-treatment__grain" />
            <div aria-hidden className="photo-treatment__vignette" />
            <div className="absolute inset-0 bg-gradient-to-tr from-ink-deep/90 via-ink-deep/55 to-ink-deep/15" />
            <div className="absolute inset-3 rounded-xl border border-gold/30 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
              <p className="font-mono-label text-gold/80 text-[11px] tracking-wider">DOSSIÊ EB-2 NIW</p>
              <p className="mt-1 text-sm text-foreground leading-snug">
                Documentação organizada segundo os requisitos publicados pelo USCIS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ============================================================
 * 5. CARDS DE VISTOS
 * ============================================================ */
export function VisaCards() {
  const visas = [
    { slug: "eb1", tag: "HABILIDADE EXTRAORDINÁRIA", title: "EB-1",
      desc: "Para profissionais com habilidade extraordinária comprovada na área." },
    { slug: "eb2-niw", tag: "EM DESTAQUE", title: "EB-2 NIW",
      desc: "Green Card por mérito profissional, sem patrocinador, com a família inclusa.", featured: true },
    { slug: "o1", tag: "SEM PATROCINADOR OBRIGATÓRIO", title: "O-1",
      desc: "Visto temporário para profissionais de habilidade extraordinária, sem depender de oferta de emprego." },
  ];
  return (
    <Reveal as="section" id="vistos-eb" className="section-champagne-deep section-pad border-y border-gold/10 relative overflow-hidden">
      {/* Profundidade limpa: filete dourado no topo (sem padrão de fundo). */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="container-x relative">

        <SectionHead num="03" eyebrow="CAMINHOS IMIGRATÓRIOS" title="Três caminhos. Uma estratégia jurídica para cada perfil." />
        <CardRail
          className="mt-10 md:mt-14"
          mdClassName="md:grid md:grid-cols-3 md:gap-5"
          count={visas.length}
          ariaLabel="Caminhos imigratórios"
        >
          {visas.map((v) => (
            <Link key={v.slug} to="/vistos/$slug" params={{ slug: v.slug }} className="group block">
              <article className={`liquid-card relative gold-tick h-full rounded-2xl p-5 sm:p-6 transition-colors ${
                v.featured ? "border-gold" : "hover:border-gold/60"
              }`}>
                <span className="font-mono-label text-gold">{v.tag}</span>
                <h3 className="mt-4 font-display text-[34px] sm:text-[40px] leading-none">{v.title}</h3>
                <p className="mt-4 text-sm text-foreground/75 leading-relaxed">{v.desc}</p>
                <span className="mt-6 inline-flex items-center text-sm text-gold">
                  Conhecer este visto <span aria-hidden className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </span>
              </article>
            </Link>
          ))}
        </CardRail>

        <div className="mt-12 flex justify-center">
          <a href={useAvaliacaoHref("home_vistos")}>
            <Button size="lg" variant="cta" className="btn-label btn-sweep h-12 px-7 w-full sm:w-auto">
              Analisar meu perfil
            </Button>
          </a>
        </div>
      </div>
    </Reveal>
  );
}

/* ============================================================
 * 6. PERFIS QUE ATENDEMOS. CTA leva para /avaliacao
 * ============================================================ */
export function PersonaCards() {
  const personas = [
    { icon: Stethoscope, title: "Médicos", seg: "medicos",
      accent: "border-t-usa-blue text-usa-blue",
      headline: "Sua trajetória clínica é um ativo de interesse americano." },
    { icon: Wrench, title: "Engenheiros", seg: "engenheiros",
      accent: "border-t-gold text-gold",
      headline: "Da infraestrutura à tecnologia: o mercado americano valoriza o que você já faz." },
    { icon: Building2, title: "Empresários", seg: "empresarios",
      accent: "border-t-brazil-green text-brazil-yellow",
      headline: "Geração de empregos e impostos pesa positivamente no seu processo." },
  ];
  return (
    <Reveal as="section" id="perfis-atendidos" className="section-pad">
      <div className="container-x">
        <SectionHead num="04" eyebrow="PERFIS QUE ATENDEMOS" title="Profissões consolidadas têm caminho mais curto pelo EB-2 NIW." />
        <CardRail
          className="mt-10 md:mt-14"
          mdClassName="md:grid md:grid-cols-3 md:gap-5"
          count={personas.length}
          ariaLabel="Perfis atendidos"
        >
          {personas.map((p) => {
            const Icon = p.icon;
            return (
              <article key={p.title} className={`liquid-card glass-interactive relative h-full rounded-2xl border-t-2 p-5 sm:p-6 transition-[border-color,box-shadow,transform] ${p.accent}`}>
                <span className="grid h-11 w-11 place-items-center rounded-lg border border-current/50">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-2xl text-foreground">{p.title}</h3>
                <p className="mt-3 text-foreground/75 leading-relaxed">{p.headline}</p>
                {/* CTA leva à LP /avaliacao com seg + src, preserva utms da URL atual. */}
                <a
                  href={avaliacaoHref(`home_persona_${p.seg}`, p.seg)}
                  className="mt-6 inline-flex items-center text-sm text-gold hover:text-gold"
                >
                  Analisar meu perfil <span aria-hidden className="ml-2">→</span>
                </a>
              </article>
            );
          })}
        </CardRail>
      </div>
    </Reveal>
  );
}

/* ============================================================
 * 7. PROCESSO EB-2 NIW (Prompt 5, 4 etapas reais)
 * ============================================================ */
export function ProcessSteps() {
  const steps = [
    { n: "01", icon: GraduationCap, t: "Análise Jurídica",
      d: "A advogada avalia histórico, formação, objetivos e evidências para definir o enquadramento possível." },
    { n: "02", icon: Layers, t: "Organização Documental",
      d: "Organizamos a documentação que demonstra mérito substancial e importância nacional da atuação proposta." },
    { n: "03", icon: FileText, t: "Construção do Dossiê",
      d: "Preparamos formulários, evidências, cartas e demais peças necessárias para apresentar o caso com clareza." },
    { n: "04", icon: Briefcase, t: "Protocolo e Acompanhamento",
      d: "Revisamos o conjunto final e acompanhamos o processo, inclusive em eventual solicitação de evidências." },
  ];
  return (
    <Reveal as="section" id="processo-eb-2-niw" className="section-parchment section-pad relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 text-ink-text/10"><ProcessIconStrip /></div>
      <div className="container-x relative">
        <SectionHead num="05" eyebrow="PROCESSO EB-2 NIW" title="Quatro etapas, conduzidas com rigor." variant="parchment" />
        <CardRail
          className="mt-10 md:mt-14"
          mdClassName="md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-5 md:auto-rows-fr md:items-stretch"
          count={steps.length}
          ariaLabel="Etapas do processo"
        >
          {steps.map(({ n, icon: Icon, t, d }) => (
            <div key={n} className="relative gold-tick rounded-2xl bg-white/90 border border-gold/15 p-5 flex flex-col h-full shadow-soft">
              <span className="font-display text-[36px] sm:text-[40px] leading-none text-gold">{n}</span>
              <Icon className="h-5 w-5 text-ink-text/60 mt-4" />
              <h3 className="mt-3 font-display text-base text-ink-text md:min-h-[3rem]">{t}</h3>
              <p className="mt-1 text-ink-text/75 text-[14px] leading-relaxed">{d}</p>
            </div>
          ))}
        </CardRail>

        <div className="mt-12 flex justify-center">
          <a href={useAvaliacaoHref("home_processo")}>
            <Button size="lg" variant="cta" className="btn-label btn-sweep h-12 px-7 w-full sm:w-auto">
              Receber o mapa do meu processo
            </Button>
          </a>
        </div>
      </div>
    </Reveal>
  );
}

/* ============================================================
 * 8. POR QUE A STATUS, estatísticas reais
 * ============================================================ */
export function WhyUs() {
  const title = useContent("why.title");
  const lead = useContent("why.lead");

  // COMPLIANCE (FTC §5 / FDUTPA): números vêm de src/config/credentials.ts
  // e estão PENDENTES DE VALIDAÇÃO até o cliente enviar documento de lastro.
  const stats = [CLAIM_PROCESSOS, CLAIM_SATISFACAO, CLAIM_FAMILIAS]
    .filter((claim) => !claim.pending)
    .map((claim) => ({ value: claim.value, label: claim.label.toUpperCase() }));
  const items = [
     {
       icon: Landmark,
       title: "Escritório em Washington, DC",
       meta: `1500 K Street NW, 2nd Floor · EIN ${EIN}`,
       desc: "Atendimento somente com hora marcada.",
     },
     {
       icon: Scale,
       title: "Advogada: Meagan Zabadal",
       meta: `Registro de advogada em Nova York nº ${NY_BAR}`,
       desc: "Licensed in NY and AZ · Federal immigration practice only.",
     },
     ...(!BBB_PENDING ? [{ icon: ShieldCheck, title: BBB_LABEL, desc: "Better Business Bureau: órgão privado dos EUA/Canadá que avalia a ética e confiabilidade das empresas." }] : []),
     ...(!CLAIM_AVALIACOES.pending ? [{ icon: Star, title: `${CLAIM_AVALIACOES.value} ${CLAIM_AVALIACOES.label} no Google e Facebook` }] : []),
  ];
  return (
    <Reveal as="section" id="por-que-status" className="section-champagne-deep section-pad relative border-y border-gold/10">
      <div className="container-x">

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12">
          <div>
            <SectionHead num="06" eyebrow="POR QUE A STATUS" title={title} />
            <MobileClamp className="mt-6 text-foreground/80 leading-relaxed max-w-md">{lead}</MobileClamp>
          </div>
          <ul className="grid self-start sm:grid-cols-2 gap-3">
            {items.map(({ icon: Icon, title: itemTitle, meta, desc }) => (
              <li key={itemTitle} className="compact-info-card">
                <Icon className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <span className="min-w-0 text-[14px] leading-snug text-foreground/85">
                  <strong className="block font-medium">{itemTitle}</strong>
                  {meta && <span className="mt-1 block text-xs text-foreground/55">{meta}</span>}
                  {desc && <span className="mt-2 block text-xs leading-relaxed text-foreground/60">{desc}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {stats.length > 0 && <div className="mt-16 border-y border-gold/30">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((s, i) => (
              <div key={s.label} className={`relative py-10 px-6 ${i > 0 ? "md:border-l border-gold/15" : ""}`}>
                <div className="absolute top-0 left-6 h-[2px] w-8 bg-gold" />
                <CountUp value={s.value} className="stat-num text-foreground" />
                <p className="mt-3 font-mono-label text-gold/85">{s.label}</p>
              </div>
            ))}
          </div>
        </div>}

        <div className="mt-10 flex justify-center">
          <a href={useAvaliacaoHref("home_por_que_status")} className="w-full sm:w-auto">
            <Button size="lg" variant="cta" className="btn-label btn-sweep h-12 px-7 w-full sm:w-auto">
              Falar com a nossa equipe
            </Button>
          </a>
        </div>
      </div>
    </Reveal>
  );
}

/* ============================================================
 * 7b. VÍDEO INSTITUCIONAL — slot reservado 16:9.
 * Enquanto a URL não estiver preenchida no admin, mostra placeholder.
 * ============================================================ */
export function InstitutionalVideo() {
  const eyebrow = useContent("institutional.eyebrow");
  const title = useContent("institutional.title");
  const lead = useContent("institutional.lead");
  const url = useContent("institutional.videoUrl");
  // Enquanto o conteúdo não é resolvido a dobra não é montada.
  const visible = useVisibleSlot("institutional.videoHidden");
  if (!visible) return null;


  return (
    <Reveal as="section" id="video-institucional" className="section-pad relative section-champagne-deep border-y border-gold/10">
      <div className="container-x">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-14 items-center">
          {/* Coluna de texto (editorial) */}
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-gold" />
              <span className="font-mono-label text-gold/85">{eyebrow || "VÍDEO INSTITUCIONAL"}</span>
            </div>
            <h2 className="mt-5 font-display text-[clamp(1.8rem,3.6vw,2.8rem)] leading-[1.05] text-foreground">
              {title || "Conheça a Status Immigration Law Firm."}
            </h2>
            <div className="mt-6 h-px w-16 bg-gold/60" />
            {lead && (
              <p className="mt-6 text-foreground/80 leading-relaxed max-w-md">{lead}</p>
            )}
          </div>

          {/* Coluna do vídeo (moldura dourada, formato horizontal) */}
          <div className="relative">
            <div className="liquid-glass relative aspect-video w-full overflow-hidden rounded-2xl ring-1 ring-gold/10">
              <VideoPlayer url={url} title={title || "Vídeo institucional Status Immigration Law Firm"} />
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ============================================================
 * 8b. LEGADO. "Muito mais que um visto. Um legado." (Prompt 5)
 * ============================================================ */
export function LegacySection() {
  const pillars = [
    { icon: ShieldCheck, t: "Green Card Direto",
      d: "Residência permanente para você e família. Após cinco anos, cumpridos os requisitos, é possível solicitar a naturalização." },
    { icon: Heart, t: "Segurança Familiar",
      d: "Cônjuge e filhos solteiros menores de 21 acompanham o requerente principal. A idade pode ser protegida pelo CSPA." },
    { icon: GraduationCap, t: "Futuro dos Filhos",
      d: "Educação de qualidade e universidade a custo de residente, com os mesmos direitos de quem já mora nos EUA." },
  ];
  return (
    <Reveal as="section" id="legado" className="section-verde-brasil section-pad border-y border-gold/20 relative overflow-hidden">
      {/* Backdrops sobrepostos: mapa dos EUA gravado + selo de família. */}
      <div aria-hidden className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src={usMapEngraving}
          alt=""
          width={1600}
          height={1024}
          loading="lazy"
          className="w-[120%] max-w-none opacity-[0.05] mix-blend-multiply select-none"
        />
      </div>
      <div aria-hidden className="absolute inset-0 text-gold"><FamilySealBackdrop /></div>
      <div className="container-x relative">
        <SectionHead
          num="07"
          eyebrow="O QUE VOCÊ CONQUISTA"
          title="Muito mais que um visto. Um legado."
          kicker="Com o Green Card aprovado pelo EB-2 NIW, três coisas mudam para a sua família."
        />

        {/* Bloco editorial de família (dobra mais emocional da Home). */}
        <div className="mt-12 grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-center">
          <PhotoFrame
            src={visaFamilyFuture}
            alt="Família brasileira com filhos em ambiente escolar americano, futuro e pertencimento"
            ratio="16/10"
            className="border border-gold/30 shadow-elevated"
            width={1600}
            height={1000}
          />
          <div className="liquid-card relative rounded-2xl p-5 md:p-6">
            <span className="font-mono-label text-gold">FUTURO DOS FILHOS</span>
            <p className="mt-3 font-display text-xl md:text-2xl leading-tight text-foreground">
              A decisão que muda três gerações.
            </p>
            <MobileClamp className="mt-3 text-foreground/75 text-[15px] leading-relaxed">
              Green Card para cônjuge e filhos solteiros menores de 21, junto do requerente
              principal. A idade é protegida pelo Child Status Protection Act, que pode preservar
              o benefício mesmo após os 21 anos — o tempo de processamento influencia esse cálculo.
              Escola pública de qualidade, universidade a custo de residente e, após cinco anos,
              é possível solicitar a naturalização, cumpridos os requisitos do USCIS.
            </MobileClamp>
          </div>
        </div>

        {/* Mobile: trilha deslizante; md+: grid de 3 colunas. */}
        <CardRail
          className="mt-10 md:mt-12"
          mdClassName="md:grid md:grid-cols-3 md:gap-4"
          count={pillars.length}
          ariaLabel="O que você conquista"
        >
          {pillars.map(({ icon: Icon, t, d }) => (
            <article key={t} className="liquid-card relative gold-tick rounded-2xl p-5 h-full transition-[border-color,box-shadow] hover:border-gold/55 hover:shadow-elevated">
              <Icon className="h-5 w-5 text-gold" />
              <h3 className="mt-4 font-display text-[17px]">{t}</h3>
              <p className="mt-2 text-foreground/75 leading-snug text-[13px]">{d}</p>
            </article>
          ))}
        </CardRail>

        <div className="mt-10 flex justify-center">
          <a href={useAvaliacaoHref("home_legado")} className="w-full sm:w-auto">
            <Button size="lg" variant="cta" className="btn-label btn-sweep h-12 px-7 w-full sm:w-auto">
              Analisar meu perfil
            </Button>
          </a>
        </div>
      </div>
    </Reveal>
  );
}

/* ============================================================
 * 9. SALÁRIO BRASIL vs EUA
 *
 * Lista de profissões em alta demanda. Colunas com unidade explícita:
 * Brasil = por MÊS, EUA = por ANO (formato usual de cada país).
 * Dados vêm de salary_list (editável em /admin/salarios), com fallback
 * para o seed.
 * ============================================================ */
export function SalaryCompare() {
  const [rows, setRows] = useState<SalaryRow[]>(SEED_SALARY);
  useEffect(() => {
    loadSalaryList().then((list) => setRows(list.filter((r) => r.ativo)));
  }, []);

  return (
    <Reveal as="section" id="renda-em-dolar" className="section-sky section-pad relative">
      <div aria-hidden className="tricolor-rule absolute inset-x-0 top-0" />
      <div className="container-x">
        <SectionHead
          num="08"
          eyebrow="RENDA EM DÓLAR"
          title="A mesma carreira. Outra faixa de remuneração."
          kicker="Profissões em alta demanda nos EUA. Referência de mercado, valores brutos anuais nas duas colunas."
          variant="parchment"
        />

        {/* Tabela (md+) */}
        <div className="liquid-card mt-14 hidden md:block rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1.6fr_1fr_1fr] bg-parchment-deep px-6 py-4">
            <span className="font-mono-label text-ink-text/70">PROFISSÃO</span>
            <span className="font-mono-label text-ink-text/70">NO BRASIL · POR ANO</span>
            <span className="font-mono-label text-gold">NOS EUA · POR ANO</span>
          </div>
          {rows.map((r, i) => (
            <div
              key={r.id}
              className={`grid grid-cols-[1.6fr_1fr_1fr] items-start px-6 py-5 border-t border-ink-text/5 ${
                i % 2 === 1 ? "bg-ink-text/[0.03]" : "bg-transparent"
              }`}
            >
              <div className="pr-4">
                <span className="font-display text-lg text-ink-text">{r.profissao}</span>
                {r.regulamentada && (
                  <span className="mt-2 inline-flex items-start gap-1.5 rounded border border-oxblood/40 bg-oxblood/5 px-2 py-1 text-[11px] leading-snug text-oxblood">
                    <ShieldCheck className="h-3 w-3 mt-[2px] shrink-0" />
                    <span>Exige licenciamento nos EUA. Para médicos, envolve ECFMG/USMLE e residência americana.</span>
                  </span>
                )}
              </div>
              <span className="text-ink-text/75 font-mono text-sm">
                {r.br_anual} <span className="text-ink-text/45">/ ano</span>
              </span>
              <div className="text-gold font-mono text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 shrink-0" />
                  <span>{r.eua_anual} <span className="text-gold/70">/ ano</span></span>
                </div>
                <div className="mt-1 text-[11px] font-mono-label text-ink-text/55">{r.fonte}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Cards empilhados (mobile) */}
        <div className="mt-10 md:hidden space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl border border-gold/25 bg-white/70 p-4 shadow-soft">
              <p className="font-display text-lg text-ink-text leading-tight">{r.profissao}</p>
              {r.regulamentada && (
                <p className="mt-2 inline-flex items-start gap-1.5 rounded border border-oxblood/40 bg-oxblood/5 px-2 py-1 text-[11px] leading-snug text-oxblood">
                  <ShieldCheck className="h-3 w-3 mt-[2px] shrink-0" />
                  <span>Exige licenciamento nos EUA. Para médicos, envolve ECFMG/USMLE e residência americana.</span>
                </p>
              )}
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="font-mono-label text-ink-text/55 text-[10px]">NO BRASIL · POR ANO</div>
                  <div className="mt-1 font-mono text-ink-text/85">{r.br_anual}</div>
                </div>
                <div>
                  <div className="font-mono-label text-gold text-[10px]">NOS EUA · POR ANO</div>
                  <div className="mt-1 font-mono text-gold flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                    {r.eua_anual}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[11px] font-mono-label text-ink-text/55">{r.fonte}</div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-base text-ink-text/75 leading-relaxed max-w-3xl">
          Valores brutos de referência, em base anual, para fins comparativos. Não são promessa
          nem estimativa de renda. A remuneração efetiva depende de licenciamento profissional,
          região, empregador e experiência local. Profissões regulamentadas exigem processo de
          licenciamento nos EUA, independente do status imigratório. Impostos e encargos reduzem
          o valor líquido em ambos os países.
        </p>

        <div className="mt-10 flex justify-start md:justify-center">
          <a href={useAvaliacaoHref("home_salarios")}>
            <Button size="lg" variant="cta" className="btn-label btn-sweep h-12 px-7 w-full sm:w-auto">
              Analisar meu potencial nos EUA
            </Button>
          </a>
        </div>
      </div>
    </Reveal>
  );
}


/* ============================================================
 * 10. DEPOIMENTOS. Vídeo (EB-2 do Helder) + slot secundário
 *
 * NOTA DE CONTEÚDO (não visível ao usuário):
 * O depoimento âncora em vídeo para o pilar EB-2 é do HELDER (sócio da
 * Status Immigration Law Firm que obteve o Green Card por EB-2 NIW). Os demais
 * sócios seguiram caminhos migratórios distintos; para on-message do
 * EB-2 usar exclusivamente o caso do Helder. Segundo slot fica
 * reservado para vídeo de cliente real (engenheiro/empresário
 * aprovado) conforme os estudos de caso do YouTube ficarem prontos.
 * URLs dos vídeos são editáveis em /admin/conteudo (site_content).
 * ============================================================ */
export function Testimonials() {

  const videoEyebrow = useContent("testimonials.videoEyebrow");
  const videoTitle = useContent("testimonials.videoTitle");
  const helderName = useContent("testimonials.helderName");
  const helderCaption = useContent("testimonials.helderCaption");
  const helderRole = useContent("testimonials.helderRole");
  const helderVideoUrl = useContent("testimonials.helderVideoUrl");
  const secondaryName = useContent("testimonials.secondaryName");
  const secondaryCaption = useContent("testimonials.secondaryCaption");
  const secondaryRole = useContent("testimonials.secondaryRole");
  const secondaryVideoUrl = useContent("testimonials.secondaryVideoUrl");
  

  const videoSlots = [
    { name: helderName, role: helderRole, caption: helderCaption, url: helderVideoUrl, primary: true },
    { name: secondaryName, role: secondaryRole, caption: secondaryCaption, url: secondaryVideoUrl, primary: false },
  ];

  return (
    <Reveal as="section" id="depoimentos" className="section-parchment section-pad">
      <div className="container-x">
        <SectionHead
          num="09"
          eyebrow="QUEM JÁ CONFIOU NA STATUS"
          title="Avaliações reais de quem foi atendido pela equipe."
          kicker="Mais de 130 avaliações 5★ no Google e no Facebook."
          variant="parchment"
        />

        {/* --- Vídeos de caso (EB-2 do Helder + slot secundário) --- */}
        <div className="mt-14">
          <div className="flex items-center gap-3">
            <span aria-hidden className="h-px w-8 bg-gold" />
            <span className="font-mono-label text-oxblood">{videoEyebrow}</span>
          </div>
          <h3 className="mt-4 font-display text-[clamp(1.4rem,2.6vw,1.9rem)] leading-tight text-ink-text max-w-2xl">
            {videoTitle}
          </h3>

          <CardRail
            className="mt-8"
            mdClassName="md:grid md:grid-cols-2 md:gap-6"
            count={videoSlots.length}
            ariaLabel="Depoimentos em vídeo"
          >
            {videoSlots.map((v) => (
              <article
                key={v.caption + v.name}
                className={`relative rounded-2xl overflow-hidden border bg-white shadow-soft ${
                  v.primary ? "border-gold/60 ring-1 ring-gold/40" : "border-ink-text/10"
                }`}
              >
                <div className="relative aspect-video bg-ink">
                  <VideoPlayer url={v.url} title={v.name || "Depoimento em vídeo"} />

                  {v.primary && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-gold/95 text-ink px-3 py-1 font-mono-label text-[11px] shadow-elevated">
                      <Award className="h-3 w-3" /> ÂNCORA EB-2 NIW
                    </span>
                  )}
                </div>
                <div className="p-4 sm:p-5">
                  <p className="font-mono-label text-oxblood text-[11px]">{v.caption}</p>
                  <p className="mt-2 font-display text-ink-text text-lg">{v.name}</p>
                </div>
              </article>
            ))}
          </CardRail>
        </div>

        <div className="mt-12 flex justify-center">
          <a href={useAvaliacaoHref("home_depoimentos")}>
            <Button size="lg" variant="cta" className="btn-label btn-sweep h-12 px-7 w-full sm:w-auto">
              Quero meu caso também
            </Button>
          </a>
        </div>

      </div>
    </Reveal>
  );
}

/* ============================================================
 * 10b. SELOS & PARCEIROS, moldura dourada, editável via admin
 * ============================================================ */
function PatchIcon({ label }: { label: string }) {
  const l = (label || "").toLowerCase();
  // Patches desenhados referenciando o conteúdo do campo
  if (l.includes("bbb")) return <PatchBBB />;
  if (l.includes("google")) return <PatchGoogle />;
  if (l.includes("ein")) return <PatchEIN />;

  let Icon: typeof ShieldCheck = ShieldCheck;
  let tint = "text-gold";
  if (l.includes("aila") || l.includes("bar") || l.includes("advogad")) { Icon = Scale; tint = "text-oxblood"; }
  else if (l.includes("uscis") || l.includes("document")) { Icon = Stamp; tint = "text-gold"; }
  else if (l.includes("orlando") || l.includes("washington") || l.includes("sede")) { Icon = Landmark; tint = "text-ink-text"; }
  else if (l.includes("parceiro")) { Icon = Users; tint = "text-oxblood"; }
  return (
    <span className={`inline-grid place-items-center h-16 w-16 rounded-full border border-gold/50 bg-white shadow-soft ${tint}`}>
      <Icon className="h-9 w-9" strokeWidth={1.5} aria-hidden />
    </span>
  );
}

function CredentialDescription({ label }: { label: string }) {
  const l = (label || "").toLowerCase();
  if (l.includes("bbb")) {
    return (
      <span className="block w-full break-words font-body text-ink-text/60 text-[10.5px] sm:text-[11px] leading-snug">
        Órgão privado dos EUA/Canadá que avalia a confiabilidade e ética empresarial.
      </span>
    );
  }
  return null;
}



export function PartnersBadges() {
  const eyebrow = useContent("partners.eyebrow");
  const title = useContent("partners.title");
  const slots: Array<{ label: string; url: string }> = [
    { label: useContent("partners.slot1.label"), url: useContent("partners.slot1.url") },
    { label: useContent("partners.slot2.label"), url: useContent("partners.slot2.url") },
    { label: useContent("partners.slot3.label"), url: useContent("partners.slot3.url") },
    { label: useContent("partners.slot4.label"), url: useContent("partners.slot4.url") },
  ];

  return (
    <section
      id="selos-parceiros"
      aria-label="Credenciais e parceiros"
      className="section-anchor section-parchment border-y border-gold/20 py-10 relative"
    >
      <div aria-hidden className="tricolor-rule absolute inset-x-0 top-0" />
      <div className="container-x">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px w-10 bg-gold" />
          <span className="font-mono-label text-oxblood">{eyebrow}</span>
        </div>
        <h2 className="mt-3 font-display text-[clamp(1.2rem,2.2vw,1.6rem)] text-ink-text max-w-2xl">
          {title}
        </h2>

        <ul
          style={{ ["--rail-item" as string]: "46vw" }}
          className="card-rail mt-7 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-3 md:auto-rows-fr md:items-stretch"
        >
          {slots.map((s, idx) => (
            <li
              key={idx}
              className="group relative h-full min-w-0 rounded-xl border border-gold/30 bg-white/75 p-3 sm:p-4 flex flex-col items-center justify-center gap-2 text-center shadow-soft transition-transform duration-300 hover:-translate-y-0.5"
              style={{
                boxShadow: "inset 0 0 0 1px rgba(196,161,72,0.25)",
              }}
              title={s.label}
            >

              {/* moldura dourada dupla estilo credencial */}
              <span aria-hidden className="absolute inset-1 rounded-lg border border-gold/25 pointer-events-none" />
              {s.url ? (
                <img
                  src={s.url}
                  alt={s.label}
                  className="max-h-[70%] max-w-[80%] object-contain"
                  loading="lazy"
                />
              ) : (
                <>
                  <span className="shrink-0">
                    <PatchIcon label={s.label} />
                  </span>
                  <span
                    className={`block w-full break-words font-mono-label text-ink-text/70 leading-tight tabular-nums ${
                      (s.label || "").length > 14
                        ? "text-[9.5px] tracking-normal sm:text-[11px]"
                        : "text-[11px] sm:text-[12.5px]"
                    }`}
                  >
                    {s.label}
                  </span>

                  <CredentialDescription label={s.label} />
                </>
              )}

            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}


/* ============================================================
 * 11. FAQ. REAIS (Prompt 5)
 * ============================================================ */
export function FAQ() {
  const faqs = [
    {
      q: "A Status Immigration Law Firm é um escritório de advocacia?",
      a: `Sim. A prática jurídica é conduzida por Meagan Zabadal (Registro de advogada em Nova York nº ${NY_BAR} · AZ Bar 040403), advogada licenciada em Nova York e Arizona, exclusivamente em matéria federal de imigração. O escritório mantém escritório em Washington, DC (atendimento somente com hora marcada), com atendimento em português. EIN ${EIN}.`,
    },
    {
      q: "Qual a experiência de vocês?",
      a: "Somos um escritório de advocacia especializado exclusivamente em imigração federal, com foco em EB-1, EB-2 NIW e O-1. A análise jurídica é conduzida por Meagan Zabadal, licenciada em Nova York e Arizona.",
    },
    {
      q: "Posso confiar mesmo sem ir presencialmente?",
      a: "Sim. A empresa é verificável por EIN, Google Business, BBB e por avaliações reais de clientes. Nosso atendimento é 100% documentado e remoto, em todo o Brasil e nos Estados Unidos, com registros e contratos formais em cada etapa.",
    },
    {
      q: "Já fui enganado antes. Como sei que não é mais uma promessa?",
      a: "Não prometemos o que nenhum escritório pode garantir. Explicamos requisitos, limites e riscos com clareza; prazos e decisões pertencem ao USCIS e aos consulados. Nosso compromisso é com a análise jurídica e a qualidade do dossiê.",
    },
    {
      q: "Meu caso é complicado, vale tentar?",
      a: "Casos complexos são exatamente onde o método faz mais diferença. Antes de concluir que é inviável, agende uma análise: é gratuita e individual. Se houver caminho, indicamos com clareza; se não houver, dizemos com a mesma honestidade.",
    },
    {
      q: "Não tenho dinheiro sobrando, compensa?",
      a: "É um investimento significativo, e por isso a análise inicial é gratuita: para que a decisão seja informada. Valores são apresentados com clareza após a triagem inicial, sem pressão e sem letras miúdas. Não trabalhamos com promessas de ganho garantido.",
    },
    {
      q: "As taxas do governo americano estão incluídas nos honorários?",
      a: "Não. As taxas oficiais do governo americano são pagas separadamente e podem mudar. Os honorários profissionais cobrem o escopo jurídico definido no contrato. Na triagem inicial, explicamos quais custos costumam se aplicar ao perfil e à família.",
    },
    {
      q: "Preciso pagar taxas separadas para minha família?",
      a: "Na etapa da petição inicial, a taxa é do requerente principal. Já na etapa final de Green Card, cônjuge e filhos entram com seus próprios formulários e taxas — portanto, há custos individuais por pessoa nessa fase. Detalhamos isso na análise, conforme o tamanho da sua família.",
    },
  ];
  return (
    <Reveal as="section" id="duvidas-frequentes" className="section-champagne section-pad border-t border-gold/15">
      <div className="container-x max-w-3xl">
        <SectionHead num="10" eyebrow="DÚVIDAS FREQUENTES" title="Antes que você pergunte." />
        <Accordion type="single" collapsible className="mt-12">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`f-${i}`} className="border-gold/15">
              <AccordionTrigger className="text-left font-display text-lg md:text-xl hover:text-gold hover:no-underline py-5">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-foreground/75 leading-relaxed pb-6 text-[15.5px]">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 flex flex-col items-center text-center">
          <p className="text-foreground/80 mb-5 max-w-md">
            Ainda tem dúvidas? Peça um levantamento inicial de informações.
          </p>
          <a href={useAvaliacaoHref("home_faq")}>
            <Button size="lg" variant="cta" className="btn-label btn-sweep h-12 px-7 w-full sm:w-auto">
              Fale com a nossa equipe
            </Button>
          </a>
        </div>
      </div>
    </Reveal>
  );
}

/* ============================================================
 * 12. CTA FINAL, dobra única de fechamento com duas ofertas.
 * Fusão do antigo CtaBanner (levantamento inicial de informações) + PreQualPromo,
 * apresentando as duas rotas como escolha lado a lado.
 * ============================================================ */
export function CtaBanner() {
  const title = useContent("cta.title");
  const sub = useContent("cta.subtitle");
  return (
    <section
      id="avaliacao-gratuita"
      aria-label="Duas formas de começar"
      className="section-anchor section-champagne-deep section-pad relative border-t border-gold/20"
    >
      <div className="container-x">
        <div className="max-w-3xl">
          <SectionHead num="11" eyebrow="DUAS FORMAS DE COMEÇAR" title={title} kicker={sub} />
        </div>

        <div className="mt-10 grid lg:grid-cols-2 gap-4 lg:gap-5 items-stretch">
          {/* Oferta principal. Levantamento inicial de informações */}
          <div className="liquid-card relative min-w-0 rounded-2xl border-gold/40 p-5 sm:p-6 flex flex-col">
            <span className="absolute -top-3 left-5 sm:left-6 rounded-full bg-gold px-3 py-1 font-mono-label text-[10px] text-ink">
              RECOMENDADO
            </span>
            <p className="font-mono-label text-gold/85">ANÁLISE COMPLETA</p>
            <h3 className="mt-3 font-display text-2xl leading-tight break-words">
              Descubra seu caminho para os EUA.
            </h3>
            <p className="mt-3 text-foreground/75 text-[15px] leading-relaxed">
              Preencha o formulário. Nossa equipe retornará explicando os serviços de preparação
              documental disponíveis e as próximas etapas.
            </p>
            <ul className="mt-5 space-y-2 text-[14px] text-foreground/80">
              {[
                "Levantamento inicial de informações, gratuito",
                "Resposta personalizada",
                "Confidencial e sem compromisso",
              ].map((i) => (
                <li key={i} className="flex gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
            <a href={useAvaliacaoHref("home_cta_final")} className="mt-7 block sm:inline-block">
              <Button size="lg" variant="cta" className="btn-label btn-sweep h-12 px-4 sm:px-7 w-full sm:w-auto whitespace-normal text-center leading-tight">
                Iniciar triagem do meu caso
              </Button>
            </a>
            <p className="mt-3 text-[12px] text-foreground/80">
              Para quem quer uma triagem inicial completa do perfil.
            </p>
          </div>

          {/* Oferta secundária. Pré-qualificação */}
          <div className="liquid-card min-w-0 rounded-2xl p-5 sm:p-6 flex flex-col">
            <div className="flex items-center gap-2 text-gold/80">
              <Sparkles className="h-4 w-4 shrink-0" />
              <p className="font-mono-label text-gold/80">RESPOSTA NA HORA</p>
            </div>
            <h3 className="mt-3 font-display text-2xl leading-tight break-words">
              Teste rápido: um mapa do seu perfil em 2 minutos.
            </h3>
            <p className="mt-3 text-foreground/70 text-[15px] leading-relaxed">
              Poucas perguntas objetivas sobre formação e experiência. Ao final,
              um mapa de quais documentos costumam ser exigidos nas categorias EB-1A, EB-2 NIW e O-1.
            </p>
            <ul className="mt-5 space-y-2 text-[14px] text-foreground/75">
              {[
                "Resultado imediato",
                "Mapa das categorias aplicáveis",
                "Sem cadastro inicial",
              ].map((i) => (
                <li key={i} className="flex gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-gold/70 mt-0.5 shrink-0" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
            <Link to="/pre-qualificacao" className="mt-7 block sm:inline-block">
              <Button
                size="lg"
                variant="outline"
                className="btn-label h-12 px-4 sm:px-7 w-full sm:w-auto whitespace-normal text-center leading-tight border-gold/50 text-gold hover:bg-gold/10 hover:text-gold"
              >
                Iniciar triagem do meu caso
              </Button>
            </Link>
            <p className="mt-3 text-[12px] text-foreground/80">
              Para quem quer saber em 2 minutos se tem encaixe.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}


/* ============================================================
 * Helpers
 * ============================================================ */
/**
 * Reveal, fade+slide leve via IntersectionObserver + classe CSS.
 * Substitui o `motion.div` por um reveal CSS leve, disparado uma única vez.
 * Evita `content-visibility` nas dobras para não reservar alturas estimadas
 * que possam deslocar o scroll quando a seção entra na viewport.
 */
function Reveal({
  children, className, as: As = "section", id,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div";
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setShown(true); return; }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "-80px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Comp = As as any;
  return (
    <Comp
      ref={ref as any}
      id={id}
      aria-label={id ? id.replace(/-/g, " ") : undefined}
      className={`section-anchor reveal ${shown ? "reveal-in" : ""} ${className ?? ""}`}
    >
      {children}
    </Comp>
  );
}


/**
 * MobileClamp — no mobile, colapsa o texto em 4 linhas com "ler mais".
 * No desktop (md+) o texto aparece inteiro, sem botão.
 */
function MobileClamp({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={className}>
      <p className={open ? "" : "clamp-mobile"}>{children}</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-2 font-mono-label text-[11px] text-gold underline-offset-4 hover:underline md:hidden"
      >
        {open ? "Ler menos" : "Ler mais"}
      </button>
    </div>
  );
}

function CountUp({ value, className }: { value: string; className?: string }) {
  return <span className={className}>{value}</span>;
}

// ──────────────────────────────────────────────────────────────────────────────
// HeroAssessment: bloco "Avaliação gratuita" embutido logo após o Hero, com
// o formulário progressivo (LeadFormProgressive) inline, sem mandar o usuário
// para outra página. A CTA principal do Hero ancora para #avaliacao-rapida.
// ──────────────────────────────────────────────────────────────────────────────
export function HeroAssessment() {
  const loc = useLocation();
  return (
    <section
      id="avaliacao-rapida"
      aria-label="Levantamento inicial de informações"
      className="section-anchor section-pad relative border-t border-gold/15"
    >
      <div className="container-x grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-14 items-start">
        <div>
          <p className="font-mono-label text-gold">LEVANTAMENTO INICIAL DE INFORMAÇÕES</p>
          <h2 className="mt-4 font-display text-[clamp(1.75rem,3.4vw,2.6rem)] leading-tight">
            Comece sua análise aqui mesmo.
          </h2>
          <p className="mt-5 text-foreground/80 max-w-md leading-relaxed">
            Responda algumas perguntas curtas sobre o seu perfil. Suas respostas
            ficam salvas no seu dispositivo, se sair, retoma de onde parou. Nossa
            equipe responde por e-mail em até 48h.
          </p>
          <ul className="mt-7 space-y-3 text-sm text-foreground/80">
            {[
              "Sem compromisso, 100% confidencial",
              "Mapa das categorias com maior afinidade (EB-2 NIW, EB-1, O-1)",
              "Triagem inicial com possibilidade de encaminhamento para análise jurídica",
            ].map((i) => (
              <li key={i} className="flex gap-3 border-l border-gold/40 pl-3">
                <CheckCircle2 aria-hidden className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                <span>{i}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <LeadFormProgressive
            segmentId={undefined}
            currentPath={loc.pathname}
            submitLabel="Enviar para análise"
          />
        </div>
      </div>
    </section>
  );
}

