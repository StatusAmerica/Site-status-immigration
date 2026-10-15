import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, SectionCard } from "@/components/admin/ui";
import {
  getTrackingSettings,
  saveTrackingSettings,
  type TrackingSettings,
} from "@/lib/admin/settings";
export const Route = createFileRoute("/admin/tracking")({ component: TrackingPage });
function TrackingPage() {
  const [settings, setSettings] = useState<TrackingSettings | null>(null);
  const [status, setStatus] = useState("");
  useEffect(() => {
    void getTrackingSettings().then(setSettings);
  }, []);
  return (
    <>
      <PageHeader
        title="Tracking"
        description="Mensuração centralizada no GTM-5ZFTCPP6, condicionada ao consentimento."
      />
      <SectionCard title="Google Tag Manager">
        <p>
          O contêiner GTM-5ZFTCPP6 é carregado uma vez após consentimento de medição. Configure o ID
          real do GA4 e as tags no GTM.
        </p>
        <p className="mt-3">
          Eventos: page_view, form_start, generate_lead e click_whatsapp. Lead só é contado após
          confirmação do banco; clique de WhatsApp não confirma conversa.
        </p>
        <p className="mt-3">
          Desative page_view automático, medição de formulários e gatilhos antigos no GTM/GA4 para
          evitar duplicidade. Meta e outras tags de publicidade devem exigir consentimento
          adicional.
        </p>
        <p className="mt-3">
          GA4 direto, Pixel direto, RD Station e scripts personalizados legados deixaram de ser
          injetados. As configurações antigas foram preservadas no banco para auditoria.
        </p>
      </SectionCard>
      <SectionCard title="Integração com CRM pendente">
        <p>
          Os formulários são recebidos no D1. O envio externo está desativado até receber
          CRM_INTEGRATION_SPEC.md com plataforma, endpoints reais, autenticação, campos e regras de
          duplicidade.
        </p>
        <p className="mt-3">
          qualify_lead e close_convert_lead dependem de eventos autenticados do CRM. O score local
          não representa qualificação comercial.
        </p>
      </SectionCard>
      {settings && (
        <SectionCard title="Verificação do Google Search Console">
          <label>
            <input
              type="checkbox"
              checked={settings.gsc_enabled}
              onChange={(e) => setSettings({ ...settings, gsc_enabled: e.target.checked })}
            />{" "}
            Ativar meta de verificação
          </label>
          <input
            aria-label="Código de verificação"
            className="mt-3 block w-full rounded border p-2"
            value={settings.gsc_verification}
            onChange={(e) => setSettings({ ...settings, gsc_verification: e.target.value })}
          />
          <button
            className="mt-3 rounded border px-3 py-2"
            onClick={async () => {
              try {
                await saveTrackingSettings(settings);
                setStatus("Salvo.");
              } catch {
                setStatus("Não foi possível salvar.");
              }
            }}
          >
            Salvar verificação
          </button>
          <p role="status">{status}</p>
        </SectionCard>
      )}
    </>
  );
}
