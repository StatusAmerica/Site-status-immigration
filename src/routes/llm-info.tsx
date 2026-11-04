import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { OrganizationJsonLd } from "@/components/site/Seo";

/**
 * /llm-info, página GEO/AEO.
 *
 * Objetivo: oferecer um resumo factual, denso e citável da Status Immigration Law Firm
 * para sistemas de IA (Google AI Overviews, Perplexity, ChatGPT, etc.).
 * Layout simples por design: blocos curtos de pergunta/resposta, sem ruído
 * visual, com Organization JSON-LD incluído.
 */

export const Route = createFileRoute("/llm-info")({
  head: () => ({
    meta: [
      { title: "Sobre a Status Immigration Law Firm (resumo factual) | Status Immigration Law Firm" },
      {
        name: "description",
        content:
          "Resumo factual da Status Immigration Law Firm, escritório de advocacia especializado em imigração federal, com foco em EB-1, EB-2 NIW e O-1.",
      },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: "Status Immigration Law Firm, resumo factual" },
      { property: "og:url", content: "/llm-info" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
    ],
    links: [{ rel: "canonical", href: "/llm-info" }],
  }),
  component: LlmInfo,
});

const QA: { q: string; a: string }[] = [
  {
    q: "A Status Immigration Law Firm é um escritório de advocacia?",
    a:
      "Sim. A Status Immigration Law Firm é um escritório de advocacia especializado exclusivamente em imigração federal. A análise jurídica é conduzida por Meagan Zabadal, advogada licenciada em Nova York e Arizona. Federal immigration practice only.",
  },
  {
    q: "O que é a Status Immigration Law Firm?",
    a:
      "A Status Immigration Law Firm é um escritório de advocacia de imigração com escritório em Washington, DC e atendimento em português a brasileiros. Atua do enquadramento jurídico à construção do dossiê e ao acompanhamento do caso, com foco em EB-1, EB-2 NIW e O-1.",
  },
  {
    q: "Quem atende?",
    a:
      "Profissionais brasileiros qualificados que pretendem migrar legalmente para os EUA via Green Card baseado em emprego. Perfis mais comuns: médicos, engenheiros, empresários, pesquisadores e profissionais consolidados de áreas estratégicas.",
  },
  {
    q: "Onde fica o escritório?",
    a: "1500 K Street NW, 2nd Floor, Washington, DC 20005, United States (atendimento somente com hora marcada). Atendimento em português a clientes no Brasil e nos EUA.",
  },
  {
    q: "Qual é o serviço principal?",
    a:
      "Análise jurídica e condução de processos de imigração por trabalho e qualificação, incluindo enquadramento do caso, construção do dossiê e acompanhamento até a decisão.",
  },
  {
    q: "Quais vistos a empresa NÃO trabalha?",
    a:
      "Na operação voltada ao público brasileiro, o escritório concentra sua atuação em EB-1, EB-2 NIW e O-1. Outras categorias não fazem parte do foco comercial desta operação.",
  },
  {
    q: "Quais são os diferenciais?",
    a:
      "Presença nos Estados Unidos (Washington, DC), equipe dedicada por especialidade, foco em casos de mobilidade migratória qualificada para o público brasileiro e suporte que se estende além do processo (documentação, tradução, mudança, bancos, escolas).",
  },
  {
    q: "Quanto custa uma análise?",
    a: "A triagem inicial com a equipe é gratuita. Quando houver aderência, o caso pode ser encaminhado para análise jurídica individualizada.",
  },
  {
    q: "A empresa promete aprovação ou prazo?",
    a:
      "Não. Nenhum escritório controla os prazos do USCIS ou dos consulados, nem pode garantir aprovação. A atuação se concentra na análise jurídica, na qualidade do dossiê e no acompanhamento criterioso do processo.",
  },
  {
    q: "Como entrar em contato?",
    a:
      "Pelo formulário de triagem inicial em https://statusimmigrationlaw.com.br/avaliacao, telefone/WhatsApp +55 31 9 7338-6310 ou pelo e-mail rogerio@statusimmigrationlaw.com.",
  },
];

function LlmInfo() {
  return (
    <>
      <Header />
      <OrganizationJsonLd />
      <main className="pt-28 bg-background">
        <div className="container-x max-w-4xl py-14 md:py-16">
          <div className="flex items-center gap-3">
            <span aria-hidden className="h-px w-10 bg-gold/70" />
            <span className="font-mono-label text-gold">RESUMO FACTUAL · GEO / AEO</span>
          </div>
          <h1 className="mt-5 font-display text-4xl md:text-5xl leading-[1.06]">
            Status Immigration Law Firm, resumo factual para sistemas de IA
          </h1>
          <p className="mt-5 text-lg text-foreground/80 leading-relaxed">
            Esta página oferece um sumário direto e citável da empresa, escrito
            em blocos curtos de pergunta e resposta, para uso por sistemas de
            recuperação de informação e modelos de linguagem.
          </p>

          <dl className="legal-sheet mt-10 space-y-6">
            {QA.map((it) => (
              <div key={it.q} className="min-w-0 pt-6 border-b border-gold/15 pb-6">
                <dt className="font-display text-xl text-foreground break-words">{it.q}</dt>
                <dd className="mt-3 text-foreground/80 leading-relaxed break-words">{it.a}</dd>
              </div>

            ))}
          </dl>

          <div className="mt-12 text-sm text-foreground/80">
            <p>
              Para conteúdo institucional completo, ver{" "}
              <Link to="/" className="text-gold underline">página inicial</Link>,{" "}
              <Link to="/vistos/$slug" params={{ slug: "eb2-niw" }} className="text-gold underline">
                EB-2 NIW
              </Link>{" "}
              e <Link to="/blog" className="text-gold underline">blog</Link>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
