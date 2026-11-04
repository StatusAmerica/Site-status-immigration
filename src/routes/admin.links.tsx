import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, SectionCard } from "@/components/admin/ui";
import { getSiteSettings, saveSiteSettings, type SiteSettings } from "@/lib/admin/settings";

export const Route = createFileRoute("/admin/links")({ component: LinksPage });

function LinksPage() {
  const [s, setS] = useState<SiteSettings | null>(null);
  useEffect(() => { getSiteSettings().then(setS); }, []);
  if (!s) return null;
  const upd = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setS({ ...s, [k]: v });

  async function save() {
    await saveSiteSettings(s!);
    toast.success("Links e contatos salvos.");
  }

  const fields: Array<[keyof SiteSettings, string, string?]> = [
    ["whatsapp_br", "WhatsApp BR (E.164 sem +)", "5511999999999"],
    ["whatsapp_us", "WhatsApp EUA (E.164 sem +)", "14070000000"],
    ["phone_br", "Telefone BR"],
    ["phone_us", "Telefone EUA"],
    ["email", "E-mail de contato"],
    ["endereco_dc", "Endereço (Washington, DC)"],
    ["instagram_url", "Instagram (URL)"],
    ["facebook_url", "Facebook (URL)"],
    ["linkedin_url", "LinkedIn (URL)"],
    ["youtube_url", "YouTube (URL)"],
    ["cta_hero_label", "Texto CTA. Hero"],
    ["cta_form_label", "Texto CTA. Formulário"],
  ];

  return (
    <>
      <PageHeader title="Botões & Links" description="Contatos, redes e textos de CTAs globais."
        actions={<Button onClick={save} className="bg-amber-400 text-slate-900 hover:bg-amber-500 gap-1.5"><Save className="h-4 w-4" />Salvar</Button>} />
      <SectionCard>
        <div className="grid sm:grid-cols-2 gap-3">
          {fields.map(([k, label, ph]) => (
            <div key={k as string}>
              <Label className="text-xs text-slate-500">{label}</Label>
              <Input className="mt-1" placeholder={ph} value={s[k] as string}
                onChange={(e) => upd(k, e.target.value as never)} />
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}
