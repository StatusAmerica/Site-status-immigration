/**
 * Componentes JSON-LD reutilizáveis.
 *
 * Estes componentes renderizam <script type="application/ld+json"> inline.
 * São usados dentro do componente da rota (não em head().scripts) para
 * permitir composição rica baseada em props/loaderData.
 *
 * Esquemas disponíveis:
 *  - OrganizationJsonLd   → global (LegalService + sameAs + contactPoint)
 *  - WebSiteJsonLd        → home (SearchAction opcional)
 *  - ServiceJsonLd        → páginas-pilar de visto
 *  - FAQJsonLd            → FAQPage (home + páginas de visto + posts c/ FAQ)
 *  - BreadcrumbJsonLd     → posts do blog e páginas profundas
 *  - ArticleJsonLd        → posts do blog
 *
 * Observação: usamos LegalService como @type principal, mais preciso
 * que "Organization" genérico para um escritório de imigração.
 */

function ldScript(data: object) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const ORG_BASE = {
  "@type": "LegalService",
  name: "Status Immigration Law Firm",
  alternateName: "Status Immigration Law Firm. Imigração EB",
  description:
    "Escritório de advocacia especializado em imigração federal para profissionais e famílias brasileiras, com foco em EB-1, EB-2 NIW e O-1.",
  url: "/",
  logo: "/og-image.jpg",
  image: "/og-image.jpg",
  address: {
    "@type": "PostalAddress",
    streetAddress: "1500 K Street NW, 2nd Floor",
    addressLocality: "Washington",
    addressRegion: "DC",
    postalCode: "20005",
    addressCountry: "US",
  },
  areaServed: [
    { "@type": "Country", name: "Brasil" },
    { "@type": "Country", name: "Estados Unidos" },
  ],
  knowsLanguage: ["pt-BR", "en"],
  serviceType: ["Federal immigration law", "EB-2 NIW", "EB-1", "O-1", "Green Card"],
  employee: {
    "@type": "Person",
    name: "Meagan Zabadal",
    jobTitle: "Immigration Attorney",
    description: "Licensed in New York and Arizona. Federal immigration practice only.",
  },
  sameAs: [
    "https://www.instagram.com/statusimmigrationbr/",
    "https://www.facebook.com/StatusAdvocaciaBrasil/",
  ],
};

export function OrganizationJsonLd() {
  return ldScript({ "@context": "https://schema.org", ...ORG_BASE });
}

export function WebSiteJsonLd() {
  return ldScript({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Status Immigration Law Firm",
    url: "/",
    inLanguage: "pt-BR",
    publisher: { ...ORG_BASE },
  });
}

interface ServiceLdProps {
  name: string;
  description: string;
  url: string;
  serviceType?: string;
}
export function ServiceJsonLd({ name, description, url, serviceType }: ServiceLdProps) {
  return ldScript({
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType: serviceType ?? name,
    url,
    provider: { ...ORG_BASE },
    areaServed: [
      { "@type": "Country", name: "Brasil" },
      { "@type": "Country", name: "Estados Unidos" },
    ],
  });
}

export interface FaqItem {
  q: string;
  a: string;
}
export function FAQJsonLd({ items }: { items: FaqItem[] }) {
  return ldScript({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  });
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return ldScript({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  });
}

interface ArticleLdProps {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  url: string;
}
export function ArticleJsonLd(p: ArticleLdProps) {
  return ldScript({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.headline,
    description: p.description,
    image: [p.image],
    datePublished: p.datePublished,
    dateModified: p.dateModified ?? p.datePublished,
    author: { "@type": "Person", name: p.author },
    publisher: { ...ORG_BASE },
    mainEntityOfPage: { "@type": "WebPage", "@id": p.url },
    inLanguage: "pt-BR",
  });
}
