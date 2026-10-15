/**
 * /avaliacao/obrigado-qualificado — URL dedicada para leads qualificados
 * (score >= 50). URL própria facilita conversões separadas no Pixel/GA4.
 */
import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ObrigadoQualificado } from "@/components/site/ObrigadoContent";

export const Route = createFileRoute("/avaliacao/obrigado-qualificado")({
  head: () => ({
    meta: [
      { title: "Perfil recebido | Status Immigration Law Firm" },
      {
        name: "description",
        content:
          "Recebemos seu perfil. Nossa equipe entra em contato em até 48h pelo canal informado.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ObrigadoQualificadoPage,
});

function ObrigadoQualificadoPage() {
  return <ObrigadoQualificado />;
}
