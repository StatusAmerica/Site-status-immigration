import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, SectionCard } from "@/components/admin/ui";
import { getSiteSettings, saveSiteSettings, type SiteSettings } from "@/lib/admin/settings";

export const Route = createFileRoute("/admin/configuracoes")({ component: ConfigPage });

function ConfigPage() {
  const [s, setS] = useState<SiteSettings | null>(null);
  useEffect(() => { getSiteSettings().then(setS); }, []);
  if (!s) return null;
  const upd = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setS({ ...s, [k]: v });

  async function save() {
    await saveSiteSettings(s!);
    toast.success("Configurações salvas.");
  }

  return (
    <>
      <PageHeader title="Configurações" description="Marca e identidade gerais."
        actions={<Button onClick={save} className="bg-amber-400 text-slate-900 hover:bg-amber-500 gap-1.5"><Save className="h-4 w-4" />Salvar</Button>} />

      <div className="grid md:grid-cols-2 gap-4">
        <SectionCard title="Marca">
          <div className="space-y-3">
            <Field label="Nome do site"><Input value={s.site_name} onChange={(e) => upd("site_name", e.target.value)} /></Field>
            <Field label="Tagline"><Input value={s.site_tagline} onChange={(e) => upd("site_tagline", e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cor primária (dourado)"><Input type="color" value={s.primary_color} onChange={(e) => upd("primary_color", e.target.value)} /></Field>
              <Field label="Cor de destaque (ink)"><Input type="color" value={s.accent_color} onChange={(e) => upd("accent_color", e.target.value)} /></Field>
            </div>
            <p className="text-xs text-slate-500">
              As cores ficam salvas e poderão ser aplicadas via tokens CSS, recomendado validar contraste antes de mudar a paleta principal do site.
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Dados jurídicos & contato">
          <div className="space-y-3">
            <Field label="Endereço (Washington, DC)"><Input value={s.endereco_dc} onChange={(e) => upd("endereco_dc", e.target.value)} /></Field>
            <Field label="E-mail"><Input value={s.email} onChange={(e) => upd("email", e.target.value)} /></Field>
            <Field label="Telefone BR"><Input value={s.phone_br} onChange={(e) => upd("phone_br", e.target.value)} /></Field>
            <Field label="Telefone EUA"><Input value={s.phone_us} onChange={(e) => upd("phone_us", e.target.value)} /></Field>
          </div>
        </SectionCard>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="text-xs text-slate-500">{label}</Label><div className="mt-1">{children}</div></div>;
}
