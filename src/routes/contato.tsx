/**
 * /contato — página de contato institucional.
 *
 * Estratégia:
 *  - CTA primário sempre leva para /avaliacao (funil de qualificação intacto).
 *  - WhatsApp + canais diretos como confiança.
 *  - Formulário curto de mensagem/dúvida, salvo em `leads` com
 *    `channel: "contato"` para separar do funil de /avaliacao no admin.
 *  - Não dispara eventos FormView/Lead do remarketing; usa evento
 *    próprio "contact_message" no dataLayer (se GTM estiver ativo).
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import {
  Mail,
  MapPin,
  Phone,
  Instagram,
  Facebook,
  Youtube,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { LegalNoteInline } from "@/components/legal/LegalDisclaimer";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PartnersBadges } from "@/components/site/sections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useContent } from "@/lib/siteContent";
import { getSiteSettings, defaultSettings, type SiteSettings } from "@/lib/admin/settings";
import { newId, submitLead } from "@/lib/dataStore";
import { getOrigin } from "@/lib/origin";
import { trackFormStart } from "@/lib/tracking";
import { getPageSeoFn, buildSeoTags } from "@/lib/pageSeo.functions";

export const Route = createFileRoute("/contato")({
  loader: () => getPageSeoFn({ data: { page: "contato" } }),
  head: ({ loaderData }) => {
    const { meta, links } = buildSeoTags(
      {
        title: "Contato | Status Immigration Law Firm",
        description:
          "Fale com a Status Immigration Law Firm. WhatsApp, e-mail e endereços da matriz em Orlando e filial no Brasil. Levantamento inicial de informações para imigração legal aos EUA.",
        ogTitle: "Contato | Status Immigration Law Firm",
        ogDescription:
          "WhatsApp, e-mail e endereços. Matriz em Orlando/FL e filial em Barueri/SP.",
        canonical: "/contato",
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
            description: "Escritório de advocacia especializado em imigração federal. Licensed in NY and AZ.",
            url: "https://statusimmigrationlaw.com.br",
            sameAs: [
              "https://instagram.com/status_america",
              "https://facebook.com/statusnaamerica",
              "https://youtube.com/@status.naamerica",
            ],
            address: [
              {
                "@type": "PostalAddress",
                streetAddress: "7575 KingsPointe Pkwy #4",
                addressLocality: "Orlando",
                addressRegion: "FL",
                postalCode: "32819",
                addressCountry: "US",
              },
              {
                "@type": "PostalAddress",
                streetAddress: "Alameda Araguaia 2104",
                addressLocality: "Barueri",
                addressRegion: "SP",
                postalCode: "06455-000",
                addressCountry: "BR",
              },
            ],
            contactPoint: [
              {
                "@type": "ContactPoint",
                telephone: "+1-689-251-0985",
                contactType: "customer service",
                areaServed: ["US", "BR"],
                availableLanguage: ["Portuguese", "English"],
              },
            ],
          }),
        },
      ],
    };
  },
  component: ContatoPage,
});

const contactMessageSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().email("E-mail inválido").max(255),
  whatsapp: z.string().trim().min(8, "WhatsApp inválido").max(30),
  mensagem: z.string().trim().min(10, "Escreva sua mensagem (mín. 10 caracteres)").max(2000),
  consent: z.literal(true, { errorMap: () => ({ message: "Necessário para enviar" }) }),
});

function ContatoPage() {
  const eyebrow = useContent("contato.eyebrow");
  const title = useContent("contato.title");
  const subtitle = useContent("contato.subtitle");

  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  useEffect(() => {
    getSiteSettings().then(setSettings).catch(() => {});
  }, []);

  return (
    <>
      <Header />
      <main className="bg-background text-foreground">
        <ContatoHero eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <CanaisDiretos settings={settings} />
        <ContatoForm />
        <MapaDiscreto />
        <PartnersBadges />
        <Disclaimer />
      </main>
      <Footer />
    </>
  );
}

/* --------------------------------- Hero --------------------------------- */

function ContatoHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <section className="page-hero text-foreground">
      <div className="container-x max-w-3xl">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px w-10 bg-gold" />
          <span className="font-mono-label text-gold">{eyebrow}</span>
        </div>
        <h1 className="mt-4 font-display display-1 text-foreground">{title}</h1>
        <p className="mt-5 text-foreground/80 text-lg leading-relaxed max-w-2xl">{subtitle}</p>

        <div className="mt-8">
          <Link to="/avaliacao" className="block sm:inline-flex">
            <Button size="lg" className="btn-label w-full sm:w-auto">
              Iniciar triagem do meu caso
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}

/* ---------------------------- Canais diretos ---------------------------- */

function CanaisDiretos({
  settings,
}: {
  settings: SiteSettings;
}) {
  const usaTitle = useContent("contato.usa.title");
  const usaCompany = useContent("contato.usa.company");
  const usaAddress = useContent("contato.usa.address");
  const usaPhone1 = useContent("contato.usa.phone1");
  const usaPhone2 = useContent("contato.usa.phone2");
  const usaEin = useContent("contato.usa.ein");

  const brTitle = useContent("contato.br.title");
  const brCompany = useContent("contato.br.company");
  const brAddress = useContent("contato.br.address");
  const brCnpj = useContent("contato.br.cnpj");
  const brPhone = useContent("contato.br.phone");

  const expansaoTitle = useContent("contato.expansao.title");
  const expansaoText = useContent("contato.expansao.text");

  const email = settings.email;

  return (
    <section className="section-champagne section-pad border-b border-gold/15">
      <div className="container-x">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px w-10 bg-gold" />
          <span className="font-mono-label text-oxblood">CANAIS DIRETOS</span>
        </div>
        <h2 className="mt-3 font-display display-2 text-ink-text max-w-2xl">
          Como falar com a Status Immigration Law Firm.
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* E-mail */}
          {email ? (
            <ContactCard
              icon={<Mail className="h-5 w-5 text-gold" />}
              label="E-MAIL"
              title={email}
              href={`mailto:${email}`}
              caption="Retorno em até 1 dia útil."
            />
          ) : (
            <ContactCard
              icon={<Mail className="h-5 w-5 text-gold" />}
              label="E-MAIL"
              title="Envie pelo formulário abaixo"
              caption="Responderemos em até 1 dia útil."
            />
          )}

          {/* Matriz EUA */}
          <div className="compact-info-card block">
            <span aria-hidden className="block h-[2px] w-10 bg-gold mb-4" />
            <div className="font-mono-label text-oxblood text-xs">{usaTitle.toUpperCase()}</div>
            <div className="mt-1 font-display text-lg text-ink-text">{usaCompany}</div>
            <div className="mt-3 flex items-start gap-2 text-sm text-ink-text/80">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gold" />
              <span>{usaAddress}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-ink-text/80">
              <Phone className="h-4 w-4 shrink-0 text-gold" />
              <a href={`tel:${usaPhone1.replace(/\D/g, "")}`} className="hover:text-gold">
                {usaPhone1}
              </a>
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-ink-text/80">
              <Phone className="h-4 w-4 shrink-0 text-gold" />
              <a href={`tel:${usaPhone2.replace(/\D/g, "")}`} className="hover:text-gold">
                {usaPhone2}
              </a>
            </div>
            <div className="mt-3 font-mono-label text-[11px] text-ink-text/60">{usaEin}</div>
          </div>

          {/* Filial Brasil */}
          <div className="compact-info-card block">
            <span aria-hidden className="block h-[2px] w-10 bg-gold mb-4" />
            <div className="font-mono-label text-oxblood text-xs">{brTitle.toUpperCase()}</div>
            <div className="mt-1 font-display text-lg text-ink-text">{brCompany}</div>
            <div className="mt-3 flex items-start gap-2 text-sm text-ink-text/80">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gold" />
              <span>{brAddress}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-ink-text/80">
              <Phone className="h-4 w-4 shrink-0 text-gold" />
              <a href={`tel:${brPhone.replace(/\D/g, "")}`} className="hover:text-gold">
                {brPhone}
              </a>
            </div>
            <div className="mt-3 font-mono-label text-[11px] text-ink-text/60">{brCnpj}</div>
          </div>

          {/* Expansão */}
          <div className="compact-info-card block border-dashed">
            <span aria-hidden className="block h-[2px] w-10 bg-gold mb-4" />
            <div className="font-mono-label text-oxblood text-xs">
              {expansaoTitle.toUpperCase()}
            </div>
            <div className="mt-2 font-display text-lg text-ink-text">{expansaoText}</div>
            <div className="mt-3 text-sm text-ink-text/70">
              Novas frentes de atendimento para brasileiros no exterior.
            </div>
          </div>

          {/* Redes sociais */}
          <div className="compact-info-card block lg:col-span-2">
            <span aria-hidden className="block h-[2px] w-10 bg-gold mb-4" />
            <div className="font-mono-label text-oxblood text-xs">REDES SOCIAIS</div>
            <div className="mt-1 font-display text-lg text-ink-text">
              Acompanhe casos, aprovações e conteúdo educativo.
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {settings.instagram_url && (
                <SocialPill
                  href={settings.instagram_url}
                  icon={<Instagram className="h-4 w-4" />}
                  label="@status_america"
                />
              )}
              {settings.youtube_url && (
                <SocialPill
                  href={settings.youtube_url}
                  icon={<Youtube className="h-4 w-4" />}
                  label="@status.naamerica"
                />
              )}
              {settings.facebook_url && (
                <SocialPill
                  href={settings.facebook_url}
                  icon={<Facebook className="h-4 w-4" />}
                  label="/statusnaamerica"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactCard({
  icon,
  label,
  title,
  caption,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  caption?: string;
  href?: string;
}) {
  const inner = (
    <>
      <span aria-hidden className="block h-[2px] w-10 bg-gold mb-4" />
      <div className="flex items-center gap-2">
        {icon}
        <div className="font-mono-label text-oxblood text-xs">{label}</div>
      </div>
      <div className="mt-2 font-display text-lg text-ink-text break-words">{title}</div>
      {caption && <div className="mt-2 text-sm text-ink-text/70">{caption}</div>}
    </>
  );
  const cls =
    "compact-info-card block transition hover:border-gold";
  return href ? (
    <a href={href} className={cls}>
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

function SocialPill({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-parchment/60 px-4 py-2 text-sm text-ink-text hover:border-gold hover:bg-gold/10 transition"
    >
      {icon}
      <span className="font-mono-label text-xs">{label}</span>
    </a>
  );
}

/* -------------------------- Formulário mensagem ------------------------- */

function ContatoForm() {
  const title = useContent("contato.form.title");
  const lead = useContent("contato.form.lead");
  const successMsg = useContent("contato.form.success");

  const [values, setValues] = useState({
    nome: "",
    email: "",
    whatsapp: "",
    mensagem: "",
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const submissionId = useRef(newId("lead"));
  const submittingRef = useRef(false);
  const formStartFiredRef = useRef(false);

  function updateValue<K extends keyof typeof values>(k: K, v: (typeof values)[K]) {
    setValues((s) => {
      const next = { ...s, [k]: v };
      const started =
        next.nome.trim() || next.email.trim() || next.whatsapp.trim() || next.mensagem.trim() || next.consent;
      if (started && !formStartFiredRef.current) {
        formStartFiredRef.current = true;
        trackFormStart({ form_name: "contato" });
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = contactMessageSchema.safeParse(values);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        map[issue.path.join(".")] = issue.message;
      }
      setErrors(map);
      return;
    }
    setErrors({});
    if (submittingRef.current) return;
    submittingRef.current = true;
    setStatus("sending");

    const id = submissionId.current;
    const origin = getOrigin("/contato");
    const record = {
      id,
      channel: "contato" as const,
      type: "mensagem",
      nome: parsed.data.nome,
      email: parsed.data.email,
      whatsapp: parsed.data.whatsapp,
      mensagem: parsed.data.mensagem,
      consent: true,
      origin,
      createdAt: new Date().toISOString(),
    };

    try {
      await submitLead("leads", id, record, "contato");
      setStatus("sent");
    } catch {
      setStatus("idle");
      setErrors({ _root: "Não conseguimos enviar agora. Tente novamente." });
    } finally { submittingRef.current = false; }
  }

  if (status === "sent") {
    return (
      <section className="section-champagne-deep section-pad border-b border-gold/15">
        <div className="container-x max-w-2xl">
          <div className="liquid-card rounded-2xl p-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-gold mx-auto" />
            <h2 className="mt-4 font-display text-2xl">{successMsg}</h2>
            <p className="mt-3 text-foreground/70">
              Se sua dúvida é sobre critérios do USCIS e caminhos de visto, adiante o processo
              com o levantamento inicial de informações.
            </p>
            <div className="mt-6">
              <Link to="/avaliacao">
                <Button size="lg" className="btn-label">
                  Iniciar triagem do meu caso
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-parchment section-pad border-b border-gold/15">
      <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.2fr] items-start">
        <div>
          <div className="flex items-center gap-3">
            <span aria-hidden className="h-px w-10 bg-gold" />
            <span className="font-mono-label text-gold">MENSAGEM RÁPIDA</span>
          </div>
          <h2 className="mt-3 font-display display-2 text-foreground">{title}</h2>
          <p className="mt-4 text-foreground/75 leading-relaxed">{lead}</p>
          <div className="liquid-card mt-6 rounded-2xl p-4 text-sm text-foreground/80">
            Para um <strong className="text-gold">levantamento inicial de informações completo</strong>{" "}
            (critérios do USCIS, mapa das categorias aplicáveis, próximos passos), use o caminho oficial:
            <div className="mt-3">
              <Link to="/avaliacao" className="block sm:inline-block">
                <Button size="sm" className="btn-label w-full sm:w-auto">
                  Iniciar triagem do meu caso
                </Button>
              </Link>
            </div>

          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="liquid-card rounded-2xl p-5 md:p-6"
          noValidate
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              id="nome"
              label="Nome completo"
              value={values.nome}
              onChange={(v) => updateValue("nome", v)}
              error={errors.nome}
              autoComplete="name"
            />
            <Field
              id="email"
              label="E-mail"
              type="email"
              value={values.email}
              onChange={(v) => updateValue("email", v)}
              error={errors.email}
              autoComplete="email"
            />
          </div>
          <div className="mt-4">
            <Field
              id="whatsapp"
              label="WhatsApp (com DDD)"
              value={values.whatsapp}
              onChange={(v) => updateValue("whatsapp", v)}
              error={errors.whatsapp}
              autoComplete="tel"
              placeholder="(11) 90000-0000"
            />
          </div>
          <div className="mt-4">
            <Label htmlFor="mensagem" className="font-mono-label text-xs text-oxblood">
              Sua mensagem
            </Label>
            <Textarea
              id="mensagem"
              rows={5}
              value={values.mensagem}
              onChange={(e) => updateValue("mensagem", e.target.value)}
              maxLength={2000}
              className="mt-1"
              placeholder="Conte brevemente sua dúvida ou o motivo do contato."
            />
            {errors.mensagem && (
              <p className="mt-1 text-xs text-oxblood">{errors.mensagem}</p>
            )}
          </div>

          <label className="mt-5 flex items-start gap-3 text-sm text-ink-text/80">
            <Checkbox
              checked={values.consent}
              onCheckedChange={(v) => updateValue("consent", v === true)}
              className="mt-0.5"
            />
            <span>
              Autorizo a Status Immigration Law Firm a entrar em contato comigo por e-mail ou
              WhatsApp para responder esta mensagem (LGPD).
            </span>
          </label>
          {errors.consent && (
            <p className="mt-1 text-xs text-oxblood">{errors.consent}</p>
          )}
          {errors._root && (
            <p className="mt-3 text-sm text-oxblood">{errors._root}</p>
          )}

          <Button
            type="submit"
            size="lg"
            className="btn-label mt-6 w-full sm:w-auto"
            disabled={status === "sending"}
          >
            {status === "sending" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
              </>
            ) : (
              "Enviar mensagem"
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <Label htmlFor={id} className="font-mono-label text-xs text-oxblood">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="mt-1"
      />
      {error && <p className="mt-1 text-xs text-oxblood">{error}</p>}
    </div>
  );
}

/* --------------------------- Mapa discreto ------------------------------ */

function MapaDiscreto() {
  const address = "7575 KingsPointe Pkwy #4, Orlando, FL 32819";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;
  return (
    <section className="section-champagne py-10 border-b border-gold/15">
      <div className="container-x flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="font-mono-label text-oxblood text-xs">SEDE ORLANDO</div>
          <div className="mt-1 font-display text-lg text-ink-text">{address}</div>
        </div>
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="block sm:inline-block">
          <Button variant="outline" className="btn-label w-full border-gold/50 sm:w-auto">
            <MapPin className="mr-2 h-4 w-4" /> Ver no Google Maps
          </Button>
        </a>

      </div>
    </section>
  );
}

/* --------------------------- Disclaimer --------------------------------- */

function Disclaimer() {
  return (
    <section className="bg-background py-10">
      <div className="container-x max-w-3xl text-center">
        <LegalNoteInline className="text-foreground/60" />
      </div>
    </section>
  );
}
