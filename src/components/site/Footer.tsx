/**
 * Footer, "rodapé de documento oficial".
 *
 * Prompt 5: injeção de dados reais.
 *   - Escritório em Washington, DC.
 *   - Expansão Portugal/Dubai marcadas "em breve".
 *   - Redes sociais reais. Campos ocultos quando vazios (ex.: e-mail).
 *   - Assinatura institucional de licenciamento.
 */

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { getSiteSettings, type SiteSettings } from "@/lib/admin/settings";
import { FlagUS } from "./flags";
import { LegalDisclaimer } from "@/components/legal/LegalDisclaimer";
import { BrandLogo } from "@/components/site/BrandLogo";

export function Footer() {
  const [s, setS] = useState<SiteSettings | null>(null);
  useEffect(() => { getSiteSettings().then(setS); }, []);

  const email = s?.email?.trim() || "";
  const fb = s?.facebook_url || "https://www.facebook.com/StatusAdvocaciaBrasil/";
  const ig = s?.instagram_url || "https://www.instagram.com/statusimmigrationbr/";
  const yt = s?.youtube_url || "https://youtube.com/@status.naamerica";

  return (
    <>
      <LegalDisclaimer />
      <footer className="section-champagne-deep text-foreground/85">
        <div className="h-px w-full bg-gold/40" />

      <div className="container-x py-12 grid gap-10 md:grid-cols-12">
        {/* Marca + redes */}
        <div className="md:col-span-4">
          <Link
            to="/"
            aria-label="Status Immigration Law Firm — página inicial"
            className="inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-gold/30 bg-background shadow-sm"
          >
            <BrandLogo className="h-full w-full rounded-full" />
          </Link>
          <p className="mt-4 max-w-sm text-sm text-foreground/80 leading-relaxed">
            Escritório de advocacia especializado em imigração federal, com análise jurídica,
            construção de dossiês e acompanhamento para profissionais e famílias brasileiras.
          </p>
          <div className="mt-5 flex gap-3 text-foreground/80">
            {[
              { Icon: Instagram, href: ig, label: "Instagram" },
              { Icon: Youtube, href: yt, label: "YouTube" },
              { Icon: Facebook, href: fb, label: "Facebook" },
              { Icon: TikTokGlyph, href: "https://www.tiktok.com/@status.america", label: "TikTok" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-lg border border-gold/30 hover:border-gold hover:text-gold transition-colors"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Escritório Washington, DC */}
        <div className="md:col-span-5">
          <h4 className="font-mono-label text-gold/80 flex items-center gap-2">
            <FlagUS style={{ width: 18, height: 13 }} />
            Escritório · Washington, DC
          </h4>
          <div className="mt-4 space-y-1.5 text-sm text-foreground/75 leading-relaxed">
            <p className="font-display text-foreground">Status Immigration Law Firm PLLC</p>
            <p>1500 K Street NW, 2nd Floor, Washington, DC 20005, United States</p>
            <p className="pt-1.5">
              Telefone e WhatsApp:{" "}
              <a
                className="hover:text-gold"
                href="https://wa.me/5531973386310"
                target="_blank"
                rel="noopener noreferrer"
              >
                +55 31 9 7338-6310
              </a>
            </p>
            <p>
              E-mail:{" "}
              <a className="hover:text-gold break-all" href="mailto:rogerio@statusimmigrationlaw.com">
                rogerio@statusimmigrationlaw.com
              </a>
            </p>
            <p className="pt-1 text-xs text-foreground/70">Atendimento somente com hora marcada.</p>
            <p className="font-mono text-xs text-foreground/75">
              Advogada: Meagan Zabadal · Registro de advogada em Nova York nº 5797303
            </p>
            {email && email.toLowerCase() !== "rogerio@statusimmigrationlaw.com" && (
              <p>
                <a className="hover:text-gold" href={`mailto:${email}`}>{email}</a>
              </p>
            )}
          </div>
        </div>

        {/* Expansão */}
        <div className="md:col-span-3">
          <p className="font-mono-label text-gold/80">EXPANSÃO</p>
          <p className="mt-4 text-sm text-foreground/75 leading-relaxed">
            Portugal · Dubai <span className="font-mono-label text-gold/70 ml-1">EM BREVE</span>
          </p>
          <p className="mt-2 text-xs text-foreground/60 leading-relaxed">
            Novas frentes de atendimento para brasileiros no exterior.
          </p>
        </div>
      </div>

      {/* Créditos (disclaimer legal foi movido para <LegalDisclaimer /> acima do footer) */}
      <div className="border-t border-gold/15">
        <div className="container-x py-6">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <p className="text-[11px] font-mono-label text-foreground/80">
              © {new Date().getFullYear()} STATUS IMMIGRATION LAW FIRM · TODOS OS DIREITOS RESERVADOS
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono-label text-foreground/80">
              <Link to="/contato" className="hover:text-gold">Contato</Link>
              <Link to="/sobre" className="hover:text-gold">Sobre</Link>
              <Link to="/blog" className="hover:text-gold">Blog</Link>
              <Link to="/privacidade" className="hover:text-gold">Privacidade</Link>
              <Link to="/termos" className="hover:text-gold">Termos</Link>
            </div>
          </div>
        </div>
      </div>
      </footer>
    </>
  );
}

/** Glyph mínimo do TikTok (lucide não tem ícone oficial). */
function TikTokGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M16.5 3a5.5 5.5 0 0 0 4.5 4.5v3A8.4 8.4 0 0 1 16.5 9v6.25a5.75 5.75 0 1 1-5.75-5.75c.34 0 .67.03 1 .09v3.1a2.75 2.75 0 1 0 1.75 2.56V3h3z" />
    </svg>
  );
}
