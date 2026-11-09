/**
 * /sobre — página institucional de autoridade e confiança.
 *
 * Dois pilares narrativos:
 *   1) Presença nos EUA (Washington, DC) — acompanhamento além do processo.
 *   2) História da fundadora Lia — ex-insider que saiu para construir algo melhor.
 *
 * Toda copy/imagem editável via `site_content` (chaves `sobre.*`).
 * CTA primário sempre → /avaliacao. Sem textura. Fundos sólidos.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  BadgeCheck,
  Home as HomeIcon,
  Landmark,
  GraduationCap,
  Heart,
  Plane,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { FlagUS } from "@/components/site/flags";
import { PartnersBadges } from "@/components/site/sections";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/siteContent";
import { getPageSeoFn, buildSeoTags } from "@/lib/pageSeo.functions";

export const Route = createFileRoute("/sobre")({
  loader: () => getPageSeoFn({ data: { page: "sobre" } }),
  head: ({ loaderData }) => {
    const { meta, links } = buildSeoTags(
      {
        title: "Sobre | Status Immigration Law Firm — advocacia de imigração",
        description:
          "Conheça a Status Immigration Law Firm, escritório de advocacia especializado em imigração federal, com escritório em Washington, DC e atendimento a brasileiros.",
        ogTitle: "Sobre | Status Immigration Law Firm",
        ogDescription:
          "Advocacia de imigração federal para brasileiros, com escritório em Washington, DC e atendimento no Brasil e nos Estados Unidos.",
        canonical: "/sobre",
      },
      loaderData,
    );
    return {
      meta,
      links,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LegalService",
            name: "Status Immigration Law Firm",
            legalName: "Status Immigration Law Firm PLLC",
            url: "https://statusimmigrationlaw.com.br",
            taxID: "42-4745152",
            description: "Escritório de advocacia especializado em imigração federal. Licensed in NY and AZ.",
            sameAs: [
              "https://www.instagram.com/statusimmigrationbr/",
              "https://www.facebook.com/StatusAdvocaciaBrasil/",
              "https://youtube.com/@status.naamerica",
            ],
            address: {
              "@type": "PostalAddress",
              streetAddress: "1500 K Street NW, 2nd Floor",
              addressLocality: "Washington",
              addressRegion: "DC",
              postalCode: "20005",
              addressCountry: "US",
            },
          }),
        },
      ],
    };
  },
  component: SobrePage,
});

function SobrePage() {
  return (
    <>
      <Header />
      <main className="bg-background text-foreground">
        <SobreHero />
        <NossaHistoria />
        <DiferencialEUA />
        <NumerosCredenciais />
        <PartnersBadges />
        <OndeEstamos />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}

/* --------------------------------- Hero --------------------------------- */

function SobreHero() {
  const eyebrow = useContent("sobre.hero.eyebrow");
  const title = useContent("sobre.hero.title");
  const subtitle = useContent("sobre.hero.subtitle");
  const image = useContent("sobre.hero.image");

  return (
    <section className="page-hero text-foreground">
      {image && (
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center opacity-20 saturate-50 brightness-110"
          style={{ backgroundImage: `url(${image})` }}
        />
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/82 to-background"
      />
      <div className="container-x relative max-w-3xl">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px w-10 bg-gold" />
          <span className="font-mono-label text-gold">{eyebrow}</span>
        </div>
        <h1 className="mt-4 font-display display-1 text-foreground">{title}</h1>
        <p className="mt-5 text-foreground/80 text-lg leading-relaxed max-w-2xl">
          {subtitle}
        </p>
        <div className="mt-8">
          <Link to="/avaliacao" className="block sm:inline-block">
            <Button size="lg" className="btn-label w-full sm:w-auto">
              Iniciar triagem do meu caso <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Nossa história -------------------------- */

function NossaHistoria() {
  const eyebrow = useContent("sobre.historia.eyebrow");
  const title = useContent("sobre.historia.title");
  const body = useContent("sobre.historia.body");
  const image = useContent("sobre.historia.image");

  return (
    <section className="section-parchment section-pad border-b border-gold/15">
      <div className="container-x grid gap-10 lg:grid-cols-[1.2fr_1fr] items-start">
        <div>
          <div className="flex items-center gap-3">
            <span aria-hidden className="h-px w-10 bg-gold" />
            <span className="font-mono-label text-oxblood">{eyebrow}</span>
          </div>
          <h2 className="mt-3 font-display display-2 text-ink-text max-w-2xl">
            {title}
          </h2>
          <div className="mt-6 space-y-4 text-ink-text/85 leading-relaxed max-w-2xl">
            {body.split(/\n+/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
        <div className="compact-panel overflow-hidden">
          {image ? (
            <img
              src={image}
              alt="Equipe Status Immigration Law Firm"
              className="w-full aspect-[4/5] object-cover"
              loading="lazy"
            />
          ) : (
            <div className="aspect-[4/5] bg-ink/5 flex flex-col items-center justify-center text-center p-6">
              <Building2 className="h-10 w-10 text-gold" />
              <p className="mt-3 font-mono-label text-xs text-ink-text/60">
                Imagem a completar pelo cliente
              </p>
              <p className="mt-1 text-sm text-ink-text/50">
                Escritório em Washington, DC ou foto da equipe.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Diferencial EUA ---------------------------- */

function DiferencialEUA() {
  const eyebrow = useContent("sobre.diferencial.eyebrow");
  const title = useContent("sobre.diferencial.title");
  const lead = useContent("sobre.diferencial.lead");

  const pontos = [
    {
      icon: <Plane className="h-5 w-5 text-gold" />,
      title: useContent("sobre.diferencial.p1.title"),
      text: useContent("sobre.diferencial.p1.text"),
    },
    {
      icon: <Landmark className="h-5 w-5 text-gold" />,
      title: useContent("sobre.diferencial.p2.title"),
      text: useContent("sobre.diferencial.p2.text"),
    },
    {
      icon: <GraduationCap className="h-5 w-5 text-gold" />,
      title: useContent("sobre.diferencial.p3.title"),
      text: useContent("sobre.diferencial.p3.text"),
    },
    {
      icon: <Heart className="h-5 w-5 text-gold" />,
      title: useContent("sobre.diferencial.p4.title"),
      text: useContent("sobre.diferencial.p4.text"),
    },
  ];

  return (
    <section className="section-champagne-deep section-pad border-b border-gold/15">
      <div className="container-x">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span aria-hidden className="h-px w-10 bg-gold" />
            <span className="font-mono-label text-gold">{eyebrow}</span>
          </div>
          <h2 className="mt-3 font-display display-2 text-foreground">{title}</h2>
          <p className="mt-4 text-foreground/80 leading-relaxed">{lead}</p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {pontos.map((p, i) => (
            <div
              key={i}
              className="liquid-card glass-interactive rounded-2xl p-5 relative"
            >
              <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-gold" />
              <div className="rounded-lg border border-gold/40 bg-gold/10 w-10 h-10 flex items-center justify-center">
                {p.icon}
              </div>
              <div className="mt-4 font-display text-lg text-foreground">{p.title}</div>
              <div className="mt-2 text-sm text-foreground/75 leading-relaxed">
                {p.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ------------------------ Números e credenciais ------------------------- */

function NumerosCredenciais() {
  const eyebrow = useContent("sobre.numeros.eyebrow");
  const title = useContent("sobre.numeros.title");

  const stats = [
    {
      v: useContent("sobre.numeros.n1.valor"),
      l: useContent("sobre.numeros.n1.label"),
    },
    {
      v: useContent("sobre.numeros.n2.valor"),
      l: useContent("sobre.numeros.n2.label"),
    },
    {
      v: useContent("sobre.numeros.n3.valor"),
      l: useContent("sobre.numeros.n3.label"),
    },
    {
      v: useContent("sobre.numeros.n4.valor"),
      l: useContent("sobre.numeros.n4.label"),
    },
    {
      v: useContent("sobre.numeros.n5.valor"),
      l: useContent("sobre.numeros.n5.label"),
    },
  ];

  return (
    <section className="section-parchment section-pad border-b border-gold/15">
      <div className="container-x">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px w-10 bg-gold" />
          <span className="font-mono-label text-gold">{eyebrow}</span>
        </div>
        <h2 className="mt-3 font-display display-2 text-foreground max-w-2xl">
          {title}
        </h2>

        <ul className="mt-10 grid gap-4 grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
          {stats.map((s, i) => (
            <li
              key={i}
              className="liquid-card min-w-0 rounded-xl p-3 text-center relative sm:p-4"
            >
              <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-gold" />
              <div className="font-display text-[clamp(1.35rem,7vw,2.6rem)] leading-none text-gold break-words">
                {s.v}
              </div>
              <div className="mt-2 font-mono-label text-[10px] sm:text-[11px] text-foreground/70 leading-tight break-words">
                {s.l}
              </div>
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}

/* ------------------------------ Onde estamos ---------------------------- */

function OndeEstamos() {
  const dcAddress = "1500 K Street NW, 2nd Floor, Washington, DC 20005, United States";
  const dcMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    dcAddress
  )}`;
  return (
    <section className="section-champagne section-pad border-b border-gold/15">
      <div className="container-x">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px w-10 bg-gold" />
          <span className="font-mono-label text-oxblood">ONDE ESTAMOS</span>
        </div>
        <h2 className="mt-3 font-display display-2 text-ink-text max-w-2xl">
          Presença nos Estados Unidos e atendimento em português.
        </h2>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="compact-info-card block">
            <span aria-hidden className="block h-[2px] w-10 bg-gold mb-4" />
            <div className="font-mono-label text-oxblood text-xs flex items-center gap-2">
              <FlagUS style={{ width: 16, height: 11 }} />
              ESCRITÓRIO · WASHINGTON, DC
            </div>
            <div className="mt-1 font-display text-lg text-ink-text">
              Status Immigration Law Firm PLLC
            </div>
            <div className="mt-3 flex items-start gap-2 text-sm text-ink-text/85">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gold" />
              <span>{dcAddress}</span>
            </div>
            <div className="mt-2.5 flex items-center gap-2 text-sm text-ink-text/85">
              <Phone className="h-4 w-4 shrink-0 text-gold" />
              <span>
                Telefone e WhatsApp:{" "}
                <a
                  href="https://wa.me/5531973386303"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold"
                >
                  +55 31 9 7338-6303
                </a>
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-sm text-ink-text/85">
              <Mail className="h-4 w-4 shrink-0 text-gold" />
              <span>
                E-mail:{" "}
                <a href="mailto:rogerio@statusimmigrationlaw.com" className="hover:text-gold break-all">
                  rogerio@statusimmigrationlaw.com
                </a>
              </span>
            </div>
            <div className="mt-3 text-xs text-ink-text/75">
              Atendimento somente com hora marcada.
            </div>
            <div className="mt-1.5 font-mono-label text-[11px] text-ink-text/65">
              Advogada: Meagan Zabadal · Registro de advogada em Nova York nº 5797303
            </div>
            <div className="mt-1 font-mono-label text-[11px] text-ink-text/60">
              EIN 42-4745152
            </div>
            <a
              href={dcMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 font-mono-label text-xs text-gold hover:underline"
            >
              Ver no Google Maps <ArrowRight className="h-3 w-3" />
            </a>
          </div>

          <div className="compact-info-card block border-dashed">
            <span aria-hidden className="block h-[2px] w-10 bg-gold mb-4" />
            <div className="font-mono-label text-oxblood text-xs">EXPANSÃO</div>
            <div className="mt-1 font-display text-lg text-ink-text">
              Portugal e Dubai
            </div>
            <div className="mt-3 text-sm text-ink-text/75">
              Novas frentes de atendimento para brasileiros no exterior. Em breve.
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-ink-text/60">
              <HomeIcon className="h-3.5 w-3.5 text-gold" />
              <span className="font-mono-label">EM BREVE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- CTA ---------------------------------- */

function CtaFinal() {
  const title = useContent("sobre.cta.title");
  const subtitle = useContent("sobre.cta.subtitle");
  return (
    <section className="section-champagne-deep section-pad border-b border-gold/15">
      <div className="container-x max-w-3xl text-center">
        <ShieldCheck className="h-8 w-8 text-gold mx-auto" />
        <h2 className="mt-4 font-display display-2 text-foreground">{title}</h2>
        <p className="mt-4 text-foreground/75 leading-relaxed">{subtitle}</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/avaliacao" className="block sm:inline-block">
            <Button size="lg" className="btn-label w-full sm:w-auto">
              Iniciar triagem do meu caso <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/contato" className="block sm:inline-block">
            <Button
              size="lg"
              variant="outline"
              className="btn-label w-full sm:w-auto border-gold/40 text-foreground hover:bg-gold/10"
            >
              <BadgeCheck className="mr-2 h-4 w-4" /> Fale com a equipe
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}

/* Disclaimer institucional removido: substituído pelo componente
 * <LegalDisclaimer /> global renderizado acima do <Footer />. Ver
 * src/components/legal/LegalDisclaimer.tsx. */

