/**
 * /pre-qualificacao. Teste estruturado de pré-qualificação.
 *
 * Diferente de /avaliacao (formulário comercial curto), aqui o respondente
 * tem um questionário longo (4 etapas) que gera um VEREDICTO automático por
 * visto (EB-1A, EB-2 NIW, O-1, EB-3) com link público compartilhável.
 *
 * Fluxo:
 *  1) renderiza <PreQualForm>;
 *  2) ao submeter → qualifyVisas() + saveResponse() → setResult(record);
 *  3) renderiza <PreQualResult variant="personal">.
 *
 * SEO: noindex (página de conversão, não institucional).
 */

import { useState, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { PreQualForm } from "@/components/site/prequal/PreQualForm";
import { PreQualResult } from "@/components/site/prequal/PreQualResult";
import { qualifyVisas } from "@/lib/visaQualifier";
import { saveResponse, generateToken, type PreQualAnswers, type PreQualResponse } from "@/lib/prequal";
import { getOrigin } from "@/lib/origin";
import { LegalDisclaimer } from "@/components/legal/LegalDisclaimer";

export const Route = createFileRoute("/pre-qualificacao")({
  component: PreQualPage,
  head: () => ({
    meta: [
      { title: "Teste de pré-qualificação. Status Immigration Law Firm" },
      { name: "description", content: "Veja quais documentos costumam ser exigidos em cada categoria de visto americano (EB-1A, EB-2 NIW, O-1, EB-3)." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function PreQualPage() {
  const submissionId = useRef(generateToken());
  const sending = useRef(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [record, setRecord] = useState<PreQualResponse | null>(null);

  async function handleSubmit(answers: PreQualAnswers) {
    if (sending.current) return;
    sending.current = true;
    setError("");
    setSubmitting(true);
    try {
      const result = qualifyVisas(answers);
      const origin = getOrigin("/pre-qualificacao");
      const saved = await saveResponse(answers, result, origin, submissionId.current);
      setRecord(saved);
      // scroll suave ao topo para o usuário ver o veredicto
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Não conseguimos confirmar o recebimento. Tente novamente.");
    } finally {
      sending.current = false;
      setSubmitting(false);
    }
  }

  return (
    <>
      <main className="bg-background min-h-screen pt-[68px]">
        {/* Glow gold sutil no topo */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[68px] h-64 bg-gradient-to-b from-gold/[0.06] to-transparent" />

        <div className="container-x py-10 sm:py-14 max-w-3xl relative">
          <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] text-foreground/80 hover:text-gold mb-8">
            <ChevronLeft className="h-3.5 w-3.5" /> Voltar ao site
          </Link>

          {!record && (
            <>
              <header className="mb-10">
                <p className="font-mono-label text-gold/80">PRÉ-QUALIFICAÇÃO · 4 ETAPAS · ~5 MIN</p>
                <h1 className="mt-3 font-display text-3xl sm:text-4xl leading-tight text-foreground">
                  Veja quais documentos costumam ser exigidos em cada categoria.
                </h1>
                <p className="mt-4 text-foreground/75 max-w-2xl">
                  Esta triagem é orientativa e não constitui parecer jurídico individual.
                  Quando houver aderência, o caso poderá ser encaminhado para análise pela advogada.
                </p>
                <p className="mt-4 text-foreground/75 max-w-2xl">
                  Comparamos suas respostas com os critérios das categorias <strong>EB-1A</strong>,
                  <strong> EB-2 NIW</strong>, <strong>O-1</strong> e <strong>EB-3</strong>. Ao final você
                  recebe um mapa das categorias, com os pontos que o seu perfil já cobre e
                  os que ainda precisam de documentação.
                </p>
              </header>

              {error && <p role="alert" className="text-red-700">{error}</p>}
              <PreQualForm onSubmit={handleSubmit} submitting={submitting} />
            </>
          )}

          {record && <PreQualResult record={record} variant="personal" />}
        </div>
      </main>
      <LegalDisclaimer />
    </>
  );
}
