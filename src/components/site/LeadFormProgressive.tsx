/**
 * LeadFormProgressive, formulário no estilo Typeform.
 *
 * UX:
 *  - Uma pergunta por vez ocupa o foco; as próximas só aparecem após
 *    a anterior ser válida (reveal com framer-motion).
 *  - Respostas anteriores ficam compactas e clicáveis para editar.
 *  - Enter avança quando o campo está válido.
 *  - Barra de progresso fina no topo.
 *
 * Persistência:
 *  - Salva incrementalmente em `leads_partial` a cada campo válido,
 *    com a origem (UTM + página interna). Permite ao admin ver
 *    leads que não terminaram e onde abandonaram (funil).
 *  - No submit final: grava em `leads` e remove o parcial.
 *
 * Não altera scoring (sempre derivado ao vivo em /admin) nem A/B.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { CheckCircle2, ChevronRight, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { newId, set, get, remove, submitLead } from "@/lib/dataStore";
import { type LeadInput } from "@/lib/leadScoring";
import { evaluateQualification, type QualResult } from "@/lib/leadQualification";
import { getAssignedVariantId, registerConversion } from "@/lib/abEngine";
import { getOrigin, type LeadOrigin } from "@/lib/origin";
import { markSessionStartedForm, markSessionConverted } from "@/lib/sessions";
import { loadModel, computeScore } from "@/lib/scoring";
import { trackFormStart } from "@/lib/tracking";
import { LEAD_OPTION_LABELS } from "@/lib/leadWebhookPayload";


export interface LeadFormProgressiveProps {
  segmentId?: string;
  defaultProfissao?: string;
  onSubmitted?: (lead: { id: string; qualification: QualResult; data: LeadInput }) => void;
  submitLabel?: string;
  /** Path da rota atual (para excluir da origem). Ex.: "/avaliacao" */
  currentPath?: string;
}


type FieldKey =
  | "nome" | "email" | "whatsapp"
  | "objetivo_visto"
  | "profissao" | "formacao" | "faixaEtaria"
  | "renda" | "momento";

interface FieldDef {
  key: FieldKey;
  label: string;
  hint?: string;
}

// Sequência exibida, usada também pelo funil do admin.
export const PROGRESSIVE_FIELDS: FieldDef[] = [
  { key: "nome",        label: "Para começarmos, qual é o seu nome completo?" },
  { key: "email",        label: "Em qual e-mail podemos te responder?", hint: "Análise enviada em até 48h." },
  { key: "whatsapp",     label: "E seu WhatsApp para contato?" },
  { key: "objetivo_visto", label: "O que você está buscando nos EUA?" },
  { key: "profissao",   label: "Qual é a sua profissão ou área de atuação?" },
  { key: "formacao",     label: "Qual é a sua formação acadêmica?" },
  { key: "faixaEtaria", label: "Em qual faixa etária você está?" },
  { key: "renda",        label: "Sua renda mensal aproximada?", hint: "Confidencial. Ajuda a entender o melhor caminho." },
  { key: "momento",      label: "Em que momento da decisão você está?" },
];

const empty: LeadInput = {
  nome: "", email: "", whatsapp: "", objetivo_visto: "",
  profissao: "", faixaEtaria: "", formacao: "",
  cidade: "", uf: "", renda: "", momento: "",
};

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function isFieldValid(key: FieldKey, d: LeadInput): boolean {
  switch (key) {
    case "nome": return d.nome.trim().length >= 2;
    case "email": return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email);
    case "whatsapp": return d.whatsapp.replace(/\D/g, "").length >= 10;
    case "objetivo_visto": return !!d.objetivo_visto;
    case "profissao": return !!d.profissao;
    case "formacao": return !!d.formacao;
    case "faixaEtaria": return !!d.faixaEtaria;
    case "renda": return !!d.renda;
    case "momento": return !!d.momento;
  }
}

const SS_PARTIAL_ID = "sna_partial_id";

function getOrCreatePartialId(): string {
  if (typeof window === "undefined") return newId("partial");
  try {
  let id = window.sessionStorage.getItem(SS_PARTIAL_ID);
  if (!id) {
    id = newId("partial");
    window.sessionStorage.setItem(SS_PARTIAL_ID, id);
  }
  return id;
  } catch { return newId("partial"); }
}

export interface PartialLead {
  id: string;
  createdAt: string;
  updatedAt: string;
  data: LeadInput;
  last_field: FieldKey | null;
  completed_fields: FieldKey[];
  origin: LeadOrigin;
  segmento?: string;
}

export function LeadFormProgressive({
  segmentId, defaultProfissao, onSubmitted, submitLabel, currentPath,
}: LeadFormProgressiveProps) {
  const steps: FieldDef[] = PROGRESSIVE_FIELDS;

  const [data, setData] = useState<LeadInput>(() => ({ ...empty, profissao: defaultProfissao ?? "" }));
  const [stepIndex, setStepIndex] = useState(0); // pergunta ativa
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [restoredCount, setRestoredCount] = useState(0);
  const submissionId = useRef(newId("lead"));
  const submittingRef = useRef(false);
  const partialIdRef = useRef<string>("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const formStartFiredRef = useRef<boolean>(false);
  const reduce = useReducedMotion();
  // Ref sempre apontando para o `data` mais recente, evita closures stale
  // quando o auto-advance dos <Select> dispara via setTimeout antes do
  // próximo render propagar o novo state. Sem isso, `advance()` lê um `data`
  // antigo onde o campo recém-selecionado ainda está vazio, e o form trava.
  const dataRef = useRef<LeadInput>(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  // Mount: garante um partial id estável e tenta restaurar respostas anteriores
  // do dataStore (localStorage), para que o lead não precise refazer o form
  // ao revisitar /avaliacao. Salta o stepIndex para a primeira pergunta ainda
  // pendente.
  useEffect(() => {
    partialIdRef.current = getOrCreatePartialId();
    let cancelled = false;
    (async () => {
      try {
        const prev = await get<PartialLead>("leads_partial", partialIdRef.current);
        if (cancelled || !prev || !prev.data) { setRestored(true); return; }
        setData((d) => ({
          ...d,
          ...prev.data,
          // preserva profissao default da LP de segmento se ainda vazia
          profissao: prev.data.profissao || d.profissao,
        }));
        // posiciona na primeira pergunta ainda inválida (ou no resumo final).
        const merged = { ...empty, ...prev.data } as LeadInput;
        const firstPending = steps.findIndex((f) => !isFieldValid(f.key, merged));
        const count = steps.filter((f) => isFieldValid(f.key, merged)).length;
        setRestoredCount(count);
        setStepIndex(firstPending === -1 ? steps.length : firstPending);
      } catch { /* ignore */ }
      finally { if (!cancelled) setRestored(true); }
    })();
    return () => { cancelled = true; };
  }, []);


  const update = <K extends keyof LeadInput>(k: K, v: LeadInput[K]) => {
    if (!formStartFiredRef.current) {
      formStartFiredRef.current = true;
      trackFormStart({ form_name: currentPath === "/avaliacao/whatsapp" ? "avaliacao-whatsapp" : "avaliacao" });
    }
    setData((d) => ({ ...d, [k]: v }));
  };

  const resetForm = async () => {
    try { if (partialIdRef.current) await remove("leads_partial", partialIdRef.current); } catch { /* ignore */ }
    setData({ ...empty, profissao: defaultProfissao ?? "" });
    setStepIndex(0);
    setRestoredCount(0);
    setError(null);
  };


  const totalFields = steps.length;
  const completedCount = useMemo(
    () => steps.filter((f) => isFieldValid(f.key, data)).length,
    [data],
  );
  const progressPct = Math.round((completedCount / totalFields) * 100);

  // Salva snapshot parcial sempre que um campo se torna válido / muda.
  useEffect(() => {
    if (done || !partialIdRef.current || !restored) return;
    const completed = steps.filter((f) => isFieldValid(f.key, data)).map((f) => f.key);
    if (completed.length === 0) return; // não polui store com leads vazios
    const last = completed[completed.length - 1] ?? null;
    const partial: PartialLead = {
      id: partialIdRef.current,
      createdAt: (() => {
        try {
          const existingRaw = window.localStorage.getItem("status_leads_partial");
          if (existingRaw) {
            const t = JSON.parse(existingRaw)[partialIdRef.current];
            if (t?.createdAt) return t.createdAt as string;
          }
        } catch { /* ignore */ }
        return new Date().toISOString();
      })(),
      updatedAt: new Date().toISOString(),
      data,
      last_field: last,
      completed_fields: completed,
      origin: getOrigin(currentPath),
      segmento: segmentId,
    };
    void set("leads_partial", partialIdRef.current, partial);
    // Marca a sessão como "iniciou o formulário" assim que o 1º campo é válido.
    void markSessionStartedForm();

  }, [data, done, segmentId, currentPath, restored]);

  const advance = () => {
    const f = steps[stepIndex];
    if (!f) return;
    // lê do ref para enxergar o valor recém-setado pelo <Select>
    if (!isFieldValid(f.key, dataRef.current)) {
      setError(errorFor(f.key));
      return;
    }
    setError(null);
    const next = Math.min(stepIndex + 1, totalFields); // totalFields = summary
    setStepIndex(next);
    // scroll suave para a próxima pergunta
    setTimeout(() => {
      const el = containerRef.current?.querySelector<HTMLElement>(`[data-step="${next}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.querySelector<HTMLElement>("input,button[role='combobox']")?.focus();
    }, 80);
  };

  const editStep = (i: number) => {
    setStepIndex(i);
    setTimeout(() => {
      const el = containerRef.current?.querySelector<HTMLElement>(`[data-step="${i}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const submit = async () => {

    const current = dataRef.current;
    if (steps.some((f) => !isFieldValid(f.key, current))) {
      setError("Complete todas as perguntas antes de enviar.");
      return;
    }
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError(null);
    setLoading(true);
    try {
      // -------- Modo CAPTURA: cria novo lead --------
      const id = submissionId.current;
      const origin = getOrigin(currentPath);
      // Qualificação baseada no score dinâmico do admin: >= 50 vai ao comercial.
      // Heurística antiga preservada apenas para gerar `reasons` informativos.
      let qual: { result: QualResult; reasons: string[] };
      try {
        qual = evaluateQualification(current);
      } catch (e) {
        console.warn("[avaliacao] evaluateQualification failed", e);
        qual = { result: "qualificado", reasons: [] };
      }
      let leadScore = 0;
      try {
        const model = await loadModel();
        leadScore = computeScore(current, model).score;
      } catch (e) {
        console.warn("[avaliacao] score compute failed", e);
      }
      // Threshold canônico: score >= 50 = qualificado (comercial).
      qual = {
        result: leadScore >= 50 ? "qualificado" : "nao_qualificado",
        reasons: leadScore >= 50 ? [] : qual.reasons,
      };
      const lead = {
        ...current,
        id,
        createdAt: new Date().toISOString(),
        score: leadScore,
        utm: origin.utm,

        origin,
        segmento: segmentId,
        variante_ab: segmentId ? getAssignedVariantId(segmentId) : null,
        status: "novo" as const,
        qualification: qual.result,
        qualification_reasons: qual.reasons,
      };
      await submitLead("leads", id, lead, currentPath === "/avaliacao/whatsapp" ? "avaliacao-whatsapp" : "avaliacao");


      // Guarda payload do lead qualificado para a página de obrigado montar
      // a mensagem do WhatsApp. Sessão apenas, limpo após uso.
      if (qual.result === "qualificado" && typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(
            "lastQualifiedLead",
            JSON.stringify({
              nome: current.nome,
              email: current.email,
              whatsapp: current.whatsapp,
              objetivo_visto: current.objetivo_visto,
              profissao: current.profissao,
              formacao: current.formacao,
              faixaEtaria: current.faixaEtaria,
              cidade: current.cidade,
              uf: current.uf,
              renda: current.renda,
              momento: current.momento,
            }),
          );
        } catch { /* storage indisponível, segue sem WhatsApp auto */ }
      }

      // Redireciona ANTES dos efeitos colaterais para garantir a navegação.
      if (onSubmitted) onSubmitted({ id, qualification: qual.result, data: current });
      else setDone(true);


      // Efeitos colaterais isolados, não bloqueiam o redirect.
      try {
        await markSessionConverted({ qualified: qual.result === "qualificado", score: leadScore });
      } catch (e) { console.warn("[avaliacao] session mark failed", e); }
      if (segmentId) {
        try { await registerConversion(segmentId); }
        catch (e) { console.warn("[avaliacao] registerConversion failed", e); }
      }
      if (partialIdRef.current) {
        try {
          await remove("leads_partial", partialIdRef.current);
          window.sessionStorage.removeItem(SS_PARTIAL_ID);
        } catch (e) { console.warn("[avaliacao] partial cleanup failed", e); }
      }
    } catch (err) {
      console.error("[avaliacao] submit failed", err);
      setError("Não foi possível enviar agora. Tente novamente.");
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="liquid-card rounded-2xl p-6 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-gold" />
        <h3 className="mt-4 font-display text-2xl">Recebemos seu perfil.</h3>
        <p className="mt-2 text-muted-foreground">
          Nossa equipe vai analisar e entrar em contato em até 48h pelo canal informado.
        </p>
      </div>
    );
  }

  return (
    <div className="liquid-card rounded-2xl overflow-hidden" ref={containerRef}>
      {/* progresso, sticky no topo do card */}
      <div className="sticky top-0 z-10 px-6 md:px-8 pt-5 pb-4 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono-label text-xs text-foreground/70">
            {completedCount}/{totalFields} preenchidos
          </span>
          <span className="font-mono-label text-xs text-gold">{progressPct}%</span>
        </div>
        <div className="h-1 w-full bg-border rounded-full overflow-hidden">
          <div className="h-full bg-gold transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {restored && restoredCount > 0 && stepIndex < totalFields && (
        <div role="status" aria-live="polite" className="px-6 md:px-8 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-sm">
            <span className="text-foreground/85">
              Retomamos suas respostas anteriores ({restoredCount}/{totalFields}). Continue de onde parou.
            </span>
            <button
              type="button"
              onClick={resetForm}
              className="btn-label text-[11px] text-gold underline underline-offset-4 hover:text-gold/80"
            >
              Recomeçar
            </button>
          </div>
        </div>
      )}

      <div className="px-5 md:px-7 py-6 space-y-5">

        {steps.map((f, i) => {
          const visible = i <= stepIndex;
          const active = i === stepIndex;
          const valid = isFieldValid(f.key, data);
          if (!visible) return null;
          return (
            <motion.div
              key={f.key}
              initial={i === 0 ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
              data-step={i}
            >
              {active ? (
                <ActiveQuestion
                  field={f} data={data} update={update}
                  onEnter={advance}
                />
              ) : (
                <CollapsedAnswer
                  field={f} data={data} valid={valid}
                  onEdit={() => editStep(i)}
                />
              )}
            </motion.div>
          );
        })}

        {/* Resumo final + envio */}
        {stepIndex >= totalFields && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.4 }}
            data-step={totalFields}
            className="rounded-2xl border border-gold/30 bg-background/65 p-5"
          >
            <h4 className="font-display text-xl">Tudo certo para enviar.</h4>
            <p className="mt-1 text-sm text-foreground/80">
              Revisão rápida do seu perfil antes da análise.
            </p>
            <dl className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {steps.some((s) => s.key === "nome") && <Summary k="Nome" v={data.nome} />}
              {steps.some((s) => s.key === "email") && <Summary k="E-mail" v={data.email} />}
              {steps.some((s) => s.key === "whatsapp") && <Summary k="WhatsApp" v={data.whatsapp} />}
              {steps.some((s) => s.key === "objetivo_visto") && <Summary k="Objetivo" v={LABELS.objetivo_visto[data.objetivo_visto ?? ""] ?? (data.objetivo_visto ?? "")} />}
              {steps.some((s) => s.key === "profissao") && <Summary k="Profissão" v={LABELS.profissao[data.profissao] ?? data.profissao} />}
              {steps.some((s) => s.key === "formacao") && <Summary k="Formação" v={LABELS.formacao[data.formacao] ?? data.formacao} />}
              {steps.some((s) => s.key === "faixaEtaria") && <Summary k="Idade" v={LABELS.faixaEtaria[data.faixaEtaria] ?? data.faixaEtaria} />}
              {steps.some((s) => s.key === "renda") && <Summary k="Renda" v={LABELS.renda[data.renda] ?? data.renda} />}
              {steps.some((s) => s.key === "momento") && <Summary k="Momento" v={LABELS.momento[data.momento] ?? data.momento} />}
            </dl>
          </motion.div>
        )}


        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="pt-2 flex items-center justify-center sm:justify-end">
          {stepIndex < totalFields ? (
            <Button onClick={advance} size="lg" className="btn-label gap-1 w-full sm:w-auto">
              Continuar <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              className="btn-label w-full sm:w-auto disabled:opacity-50"
              onClick={submit}
              disabled={loading}
              size="lg"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (submitLabel ?? "Enviar para análise")}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}

function errorFor(k: FieldKey): string {
  switch (k) {
    case "nome": return "Informe seu nome completo.";
    case "email": return "Informe um e-mail válido.";
    case "whatsapp": return "Informe um WhatsApp válido com DDD.";
    case "objetivo_visto": return "Selecione o objetivo do visto.";
    case "profissao": return "Selecione sua profissão.";
    case "formacao": return "Selecione sua formação.";
    case "faixaEtaria": return "Selecione sua faixa etária.";
    case "renda": return "Selecione a faixa de renda.";
    case "momento": return "Selecione o momento.";
  }
}

const LABELS: Record<string, Record<string, string>> = LEAD_OPTION_LABELS;


function Summary({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/40 py-1">
      <dt className="text-foreground/80">{k}</dt>
      <dd className="text-foreground/90 text-right truncate">{v || "-"}</dd>
    </div>
  );
}

function CollapsedAnswer({
  field, data, valid, onEdit,
}: { field: FieldDef; data: LeadInput; valid: boolean; onEdit: () => void }) {
  const display = (() => {
    switch (field.key) {
      case "objetivo_visto": return LABELS.objetivo_visto[data.objetivo_visto ?? ""] ?? (data.objetivo_visto ?? "");
      case "profissao": return LABELS.profissao[data.profissao] ?? data.profissao;
      case "formacao": return LABELS.formacao[data.formacao] ?? data.formacao;
      case "faixaEtaria": return LABELS.faixaEtaria[data.faixaEtaria] ?? data.faixaEtaria;
      case "renda": return LABELS.renda[data.renda] ?? data.renda;
      case "momento": return LABELS.momento[data.momento] ?? data.momento;
      default: return (data as unknown as Record<string, string>)[field.key as string] ?? "";
    }
  })();
  return (
    <button
      type="button" onClick={onEdit}
      className="w-full flex items-center justify-between gap-3 rounded-lg border border-border/50 px-4 py-2.5 text-left hover:border-gold/50 hover:bg-parchment-deep/60 transition-colors"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${valid ? "bg-gold" : "bg-border"}`} />
        <span className="text-xs font-mono-label text-foreground/80 truncate">{field.label}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-foreground/90 truncate">
        <span className="truncate max-w-[60vw] sm:max-w-[260px]">{display || "-"}</span>
        <Pencil className="h-3.5 w-3.5 text-foreground/80 shrink-0" />
      </div>
    </button>
  );
}

function ActiveQuestion({
  field, data, update, onEnter,
}: {
  field: FieldDef;
  data: LeadInput;
  update: <K extends keyof LeadInput>(k: K, v: LeadInput[K]) => void;
  onEnter: () => void;
}) {
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); onEnter(); }
  };
  // Auto-advance ao escolher em <Select>. UX typeform.
  const selectAndAdvance = <K extends keyof LeadInput>(k: K) => (v: string) => {
    update(k, v as LeadInput[K]);
    setTimeout(() => onEnter(), 180);
  };
  const fieldId = `lead-${field.key}`;
  const hintId = field.hint ? `${fieldId}-hint` : undefined;
  return (
    <div className="py-4">
      <Label htmlFor={fieldId} className="font-display text-[24px] md:text-[28px] leading-snug text-foreground block mb-2">
        {field.label}
      </Label>
      {field.hint && <p id={hintId} className="text-sm text-foreground/75 mb-4">{field.hint}</p>}
      <div className="mt-4 [&_input]:text-base [&_input]:h-12 [&_[role=combobox]]:h-12 [&_[role=combobox]]:text-base" onKeyDown={onKey}>
        {field.key === "nome" && (
          <Input id={fieldId} autoFocus value={data.nome} onChange={(e) => update("nome", e.target.value)} placeholder="Nome completo" aria-describedby={hintId} autoComplete="name" />
        )}
        {field.key === "email" && (
          <Input id={fieldId} autoFocus type="email" value={data.email} onChange={(e) => update("email", e.target.value)} placeholder="voce@exemplo.com" aria-describedby={hintId} autoComplete="email" inputMode="email" />
        )}
        {field.key === "whatsapp" && (
          <Input id={fieldId} autoFocus value={data.whatsapp} onChange={(e) => update("whatsapp", maskPhone(e.target.value))} placeholder="(11) 99999-9999" aria-describedby={hintId} autoComplete="tel" inputMode="tel" />
        )}
        {field.key === "objetivo_visto" && (
          <Select value={data.objetivo_visto ?? ""} onValueChange={selectAndAdvance("objetivo_visto")}>
            <SelectTrigger id={fieldId} aria-describedby={hintId}><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {Object.entries(LABELS.objetivo_visto).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {field.key === "profissao" && (
          <Select value={data.profissao} onValueChange={selectAndAdvance("profissao")}>
            <SelectTrigger id={fieldId} aria-describedby={hintId}><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {Object.entries(LABELS.profissao).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {field.key === "formacao" && (
          <Select value={data.formacao} onValueChange={selectAndAdvance("formacao")}>
            <SelectTrigger id={fieldId} aria-describedby={hintId}><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {Object.entries(LABELS.formacao).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {field.key === "faixaEtaria" && (
          <Select value={data.faixaEtaria} onValueChange={selectAndAdvance("faixaEtaria")}>
            <SelectTrigger id={fieldId} aria-describedby={hintId}><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {Object.entries(LABELS.faixaEtaria).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {field.key === "renda" && (
          <Select value={data.renda} onValueChange={selectAndAdvance("renda")}>
            <SelectTrigger id={fieldId} aria-describedby={hintId}><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {Object.entries(LABELS.renda).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {field.key === "momento" && (
          <Select value={data.momento} onValueChange={selectAndAdvance("momento")}>
            <SelectTrigger id={fieldId} aria-describedby={hintId}><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {Object.entries(LABELS.momento).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}

