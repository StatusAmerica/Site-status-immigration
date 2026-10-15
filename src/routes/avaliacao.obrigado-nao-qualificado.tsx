/**
 * /avaliacao/obrigado-nao-qualificado — URL dedicada para leads que não
 * atingiram o threshold. URL própria permite excluir do público de conversão.
 */
import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ObrigadoNaoQualificado } from "@/components/site/ObrigadoContent";

export const Route = createFileRoute("/avaliacao/obrigado-nao-qualificado")({
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
  component: ObrigadoNaoQualificadoPage,
});

function ObrigadoNaoQualificadoPage() {
  return <ObrigadoNaoQualificado />;
}
