import { createFileRoute } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import {
  CompanyIntroduction, ContrastBrasilEUA, CtaBanner, FAQ, Hero, InstitutionalVideo, LegacySection,
  NiwSection, PartnersBadges, ProcessSteps,
  SalaryCompare, Testimonials, VisaCards, WhyUs,
} from "@/components/site/sections";
import { OrganizationJsonLd, WebSiteJsonLd, FAQJsonLd } from "@/components/site/Seo";
import { BlogStrip } from "@/components/site/BlogStrip";
import { primePageSections, useOrderedSections } from "@/lib/pageStructure";
import { getPageSectionsFn } from "@/lib/pageSections.functions";
import { getPageSeoFn, buildSeoTags } from "@/lib/pageSeo.functions";

const OG_IMAGE = "https://statusimmigrationlaw.com.br/__l5e/assets-v1/db6af206-dff3-4b36-b8f2-a6d534ba74a4/og-home.jpg";

const HOME_FAQS = [
  { q: "A Status Immigration Law Firm é um escritório de advocacia?", a: "Sim. A prática jurídica é conduzida por Meagan Zabadal, advogada licenciada em Nova York e Arizona, exclusivamente em matéria federal de imigração." },
  { q: "Qual a atuação de vocês?", a: "Somos um escritório de advocacia especializado exclusivamente em imigração federal, com foco em EB-1, EB-2 NIW e O-1. Licensed in NY and AZ. Federal immigration practice only." },
  { q: "Posso confiar mesmo sem ir presencialmente?", a: "Sim. A empresa é verificável por EIN, Google Business, BBB e avaliações reais. Atendimento 100% documentado e remoto, em todo o Brasil e nos EUA." },
  { q: "Já fui enganado antes. Como sei que não é mais uma promessa?", a: "Não prometemos aprovação, prazo ou resultado. Explicamos requisitos, limites e riscos, e formalizamos o escopo profissional em contrato." },
  { q: "Meu perfil tem pontos sensíveis, vale tentar?", a: "A triagem inicial identifica se há elementos para encaminhar o caso à análise jurídica. Quando não houver caminho consistente, a equipe informa isso com transparência." },
  { q: "Como funcionam os custos?", a: "Os honorários e o escopo profissional são apresentados com clareza antes da contratação. As taxas oficiais do governo são separadas e podem mudar." },
];

export const Route = createFileRoute("/")({
  head: ({ loaderData }) => {
    const { meta, links } = buildSeoTags(
      {
        title: "Status Immigration Law Firm | Mobilidade Imigratória para brasileiros",
        description:
          "Escritório de advocacia especializado em imigração federal para brasileiros. Análise jurídica e acompanhamento de casos EB-1, EB-2 NIW e O-1.",
        canonical: "/",
        ogImage: OG_IMAGE,
        ogType: "website",
      },
      loaderData?.seo,
    );
    return {
      meta: [
        ...meta,
        { name: "facebook-domain-verification", content: "yeorkfek3h2k9nnm3dr34cgy4lx6ga" },
      ],
      links,
    };
  },
  loader: async () => {
    const [sections, seo] = await Promise.all([
      getPageSectionsFn({ data: { page: "home" } }),
      getPageSeoFn({ data: { page: "home" } }),
    ]);
    return { sections, seo };
  },
  component: Home,
});

const HOME_REGISTRY: Record<string, ComponentType> = {
  "abertura": Hero,
  "selos-parceiros": PartnersBadges,
  "blog-em-destaque": BlogStrip,
  "brasil-vs-eua": ContrastBrasilEUA,
  "eb-2-niw": NiwSection,
  "vistos-eb": VisaCards,
  "processo-eb-2-niw": ProcessSteps,
  "por-que-status": WhyUs,
  "video-institucional": InstitutionalVideo,
  "legado": LegacySection,
  "renda-em-dolar": SalaryCompare,
  "depoimentos": Testimonials,
  "duvidas-frequentes": FAQ,
  "avaliacao-gratuita": CtaBanner,
};

function Home() {
  // Prima o store síncrono com a ordem vinda do loader (SSR + cliente),
  // para que useOrderedSections já produza o snapshot correto no 1º render.
  const { sections: initialSections } = Route.useLoaderData();
  primePageSections("home", initialSections);

  const layout = useOrderedSections("home");

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <FAQJsonLd items={HOME_FAQS} />
      <Header />
      <main>
        {layout
          .filter((s) => s.active)
          .map((s) => {
            const Cmp = HOME_REGISTRY[s.id];
            if (!Cmp) return null;
            if (s.id === "abertura") {
              return (
                <div key={s.id}>
                  <Cmp />
                  <CompanyIntroduction />
                </div>
              );
            }
            return <Cmp key={s.id} />;
          })}
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

