/**
 * PreQualForm, formulário do teste de pré-qualificação.
 *
 * Layout vertical denso (não "Typeform"): o respondente vê todas as
 * perguntas e responde como um checklist longo. Isso reduz fricção para
 * quem chega via remarketing/Blog e precisa ver o veredicto rapidamente.
 *
 * Auto-save:
 *  - cada change persiste em localStorage via saveDraft();
 *  - ao montar, tenta loadDraft(), usuário não perde respostas.
 *
 * O componente é "controlado por fora" via props: o `onSubmit` recebe as
 * respostas validadas; o cálculo do veredicto e a persistência final
 * acontecem no route container.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  emptyAnswers, loadDraft, saveDraft,
  type PreQualAnswers,
} from "@/lib/prequal";
import { trackFormStart } from "@/lib/tracking";

interface Props {
  onSubmit: (a: PreQualAnswers) => void;
  submitting?: boolean;
}

/* ============================================================
 * Pequeno helper: bloco de pergunta com radios "pill".
 * Acessível: cada grupo tem fieldset/legend implícito via aria-label.
 * ============================================================ */
function RadioGroup<T extends string>({
  legend, name, value, options, onChange, hint,
}: {
  legend: string;
  name: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  hint?: string;
}) {
  return (
    <fieldset className="border-t border-gold/10 pt-5">
      <legend className="font-display text-lg text-foreground">{legend}</legend>
      {hint && <p className="mt-1 text-[13px] text-foreground/80">{hint}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <label
              key={o.value}
              className={`cursor-pointer select-none border px-4 py-2 text-sm transition-colors ${
                active
                  ? "border-gold bg-gold/10 text-foreground"
                  : "border-gold/20 text-foreground/75 hover:border-gold/50"
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                name={name}
                value={o.value}
                checked={active}
                onChange={() => onChange(o.value)}
              />
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function YesNo({
  legend, value, onChange, hint,
}: { legend: string; value: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <RadioGroup
      legend={legend}
      hint={hint}
      name={legend}
      value={value ? "sim" : "nao"}
      onChange={(v) => onChange(v === "sim")}
      options={[
        { value: "sim", label: "Sim" },
        { value: "nao", label: "Não" },
      ]}
    />
  );
}

/* ============================================================
 * Componente principal
 * ============================================================ */
export function PreQualForm({ onSubmit, submitting }: Props) {
  const [a, setA] = useState<PreQualAnswers>(emptyAnswers);
  const [restored, setRestored] = useState(false);
  const formStartFiredRef = useRef(false);

  // Restaura draft uma única vez
  useEffect(() => {
    const draft = loadDraft();
    if (draft) { setA(draft); setRestored(true); }
  }, []);

  // Auto-save a cada mudança + track "form_start" na primeira interação
  useEffect(() => {
    saveDraft(a);
  }, [a]);

  const upd = <K extends keyof PreQualAnswers>(k: K, v: PreQualAnswers[K]) => {
    if (!formStartFiredRef.current) {
      formStartFiredRef.current = true;
      trackFormStart({ form_name: "pre-qualificacao" });
    }
    setA((prev) => ({ ...prev, [k]: v }));
  };

  // Validação mínima, contato + consentimento
  const canSubmit = useMemo(() => {
    return (
      a.fullName.trim().length >= 3 &&
      /\S+@\S+\.\S+/.test(a.email) &&
      a.whatsapp.replace(/\D/g, "").length >= 10 &&
      a.consent
    );
  }, [a]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!canSubmit) return;
    onSubmit(a);
  }

  return (
    <form onSubmit={handleSubmit} className="liquid-card space-y-7 rounded-2xl p-5 md:p-7" noValidate>
      {restored && (
        <div className="rounded-xl border border-gold/25 bg-gold/5 px-4 py-3 text-[13px] text-foreground/80">
          Recuperamos as respostas que você havia começado. Pode continuar de onde parou.
        </div>
      )}

      {/* ========== Contato ========== */}
      <section className="space-y-4">
        <header>
          <p className="font-mono-label text-gold/80">ETAPA 1. IDENTIFICAÇÃO</p>
          <h2 className="font-display text-2xl mt-1">Quem está fazendo o teste</h2>
        </header>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pq-name" className="text-sm text-foreground/80">Nome completo</Label>
            <Input
              id="pq-name" required value={a.fullName}
              onChange={(e) => upd("fullName", e.target.value)}
              className="mt-1 bg-background/75 border-gold/25 text-foreground"
            />
          </div>
          <div>
            <Label htmlFor="pq-email" className="text-sm text-foreground/80">E-mail</Label>
            <Input
              id="pq-email" type="email" required value={a.email}
              onChange={(e) => upd("email", e.target.value)}
              className="mt-1 bg-background/75 border-gold/25 text-foreground"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="pq-wa" className="text-sm text-foreground/80">WhatsApp (com DDD)</Label>
            <Input
              id="pq-wa" type="tel" required value={a.whatsapp}
              onChange={(e) => upd("whatsapp", e.target.value)}
              placeholder="(11) 99999-9999"
               className="mt-1 bg-background/75 border-gold/25 text-foreground"
            />
          </div>
        </div>
      </section>

      {/* ========== Perfil profissional ========== */}
      <section className="space-y-5">
        <header>
          <p className="font-mono-label text-gold/80">ETAPA 2. PERFIL PROFISSIONAL</p>
          <h2 className="font-display text-2xl mt-1">Sua carreira hoje</h2>
        </header>

        <RadioGroup
          legend="Área principal de atuação"
          name="area" value={a.area} onChange={(v) => upd("area", v)}
          options={[
            { value: "saude", label: "Saúde / Medicina" },
            { value: "tecnologia", label: "Tecnologia" },
            { value: "engenharia", label: "Engenharia" },
            { value: "ciencia", label: "Ciência / Pesquisa" },
            { value: "negocios", label: "Negócios / Gestão" },
            { value: "educacao", label: "Educação" },
            { value: "artes", label: "Artes / Comunicação" },
            { value: "outro", label: "Outra" },
          ]}
        />

        <RadioGroup
          legend="Maior titulação concluída"
          name="education" value={a.education} onChange={(v) => upd("education", v)}
          options={[
            { value: "ensino_medio", label: "Ensino médio" },
            { value: "graduacao", label: "Graduação" },
            { value: "mestrado", label: "Mestrado" },
            { value: "doutorado", label: "Doutorado" },
          ]}
        />

        <div>
          <Label htmlFor="pq-yrs" className="font-display text-lg text-foreground">
            Anos de experiência na sua área
          </Label>
          <Input
            id="pq-yrs" type="number" min={0} max={60} value={a.experienceYears}
            onChange={(e) => upd("experienceYears", Number(e.target.value) || 0)}
             className="mt-2 w-32 bg-background/75 border-gold/25 text-foreground"
          />
        </div>

        <RadioGroup
          legend="Senioridade atual"
          name="seniority" value={a.seniority} onChange={(v) => upd("seniority", v)}
          options={[
            { value: "junior", label: "Júnior" },
            { value: "pleno", label: "Pleno" },
            { value: "senior", label: "Sênior" },
            { value: "lideranca", label: "Liderança / Gestão" },
            { value: "executivo", label: "Diretoria / C-level" },
          ]}
        />

        <RadioGroup
          legend="Faixa de renda mensal (R$)"
          name="income" value={a.income} onChange={(v) => upd("income", v)}
          options={[
            { value: "<10k", label: "Até R$ 10 mil" },
            { value: "10-20k", label: "R$ 10–20 mil" },
            { value: "20-40k", label: "R$ 20–40 mil" },
            { value: "40-80k", label: "R$ 40–80 mil" },
            { value: "80k+", label: "Acima de R$ 80 mil" },
          ]}
        />

        <RadioGroup
          legend="Nível de inglês"
          name="english" value={a.englishLevel} onChange={(v) => upd("englishLevel", v)}
          options={[
            { value: "basico", label: "Básico" },
            { value: "intermediario", label: "Intermediário" },
            { value: "avancado", label: "Avançado" },
            { value: "fluente", label: "Fluente" },
          ]}
        />
      </section>

      {/* ========== Reconhecimento (EB-1 / O-1 / NIW) ========== */}
      <section className="space-y-5">
        <header>
          <p className="font-mono-label text-gold/80">ETAPA 3. RECONHECIMENTO E IMPACTO</p>
          <h2 className="font-display text-2xl mt-1">Critérios avaliados pelo USCIS</h2>
          <p className="mt-1 text-[13px] text-foreground/80">
            Responda apenas o que conseguiria comprovar com documentação.
          </p>
        </header>

        <RadioGroup
          legend="Prêmios profissionais ou acadêmicos"
          name="awards" value={a.awards} onChange={(v) => upd("awards", v)}
          options={[
            { value: "nenhum", label: "Nenhum" },
            { value: "regional", label: "Regionais" },
            { value: "nacional", label: "Nacionais" },
            { value: "internacional", label: "Internacionais" },
          ]}
        />

        <RadioGroup
          legend="Artigos / publicações acadêmicas suas"
          name="publications" value={a.publications} onChange={(v) => upd("publications", v)}
          options={[
            { value: "0", label: "Nenhuma" },
            { value: "1-2", label: "1 a 2" },
            { value: "3-9", label: "3 a 9" },
            { value: "10+", label: "10 ou mais" },
          ]}
        />

        <YesNo legend="Já apareceu em reportagens, podcasts ou matérias sobre o seu trabalho?"
          value={a.mediaCoverage} onChange={(v) => upd("mediaCoverage", v)} />

        <YesNo legend="Já atuou como juiz, revisor ou avaliador do trabalho de pares?"
          value={a.judging} onChange={(v) => upd("judging", v)}
          hint="Painéis, comitês, peer review, bancas etc." />

        <YesNo legend="Possui contribuição original (método, patente, produto, pesquisa) com impacto comprovável?"
          value={a.originalContribution} onChange={(v) => upd("originalContribution", v)} />

        <YesNo legend="É membro de associação profissional seletiva (que exija mérito para entrar)?"
          value={a.memberships} onChange={(v) => upd("memberships", v)} />

        <YesNo legend="Ocupou cargo de liderança em organização reconhecida na sua área?"
          value={a.leadershipRole} onChange={(v) => upd("leadershipRole", v)} />

        <YesNo legend="Sua remuneração está acima da média da sua área (top 10%)?"
          value={a.highSalary} onChange={(v) => upd("highSalary", v)} />
      </section>

      {/* ========== Situação ========== */}
      <section className="space-y-5">
        <header>
          <p className="font-mono-label text-gold/80">ETAPA 4. SITUAÇÃO ATUAL</p>
          <h2 className="font-display text-2xl mt-1">Contexto migratório</h2>
        </header>

        <YesNo legend="Possui oferta formal de emprego nos EUA?"
          value={a.usJobOffer} onChange={(v) => upd("usJobOffer", v)}
          hint="Relevante para O-1 e EB-3, não é obrigatório para EB-1A nem EB-2 NIW." />

        <YesNo legend="Já teve visto americano negado anteriormente?"
          value={a.priorVisaDenial} onChange={(v) => upd("priorVisaDenial", v)}
          hint="Ajuda a triagem a entender o histórico consular; não impede o mapeamento." />
      </section>

      {/* ========== Consentimento + envio ========== */}
      <section className="border-t border-gold/15 pt-6 space-y-4">
        <label className="flex items-start gap-3 text-sm text-foreground/80">
          <Checkbox
            checked={a.consent}
            onCheckedChange={(v) => upd("consent", v === true)}
            className="mt-0.5 border-gold/40 data-[state=checked]:bg-gold data-[state=checked]:text-ink"
          />
          <span>
            Autorizo a Status Immigration Law Firm a tratar meus dados para esta triagem e
            entrar em contato, em conformidade com a LGPD. Entendo que o envio não cria,
            por si só, uma relação advogado-cliente.
          </span>
        </label>

        <Button
          type="submit" disabled={!canSubmit || submitting}
          className="btn-label btn-sweep h-12 px-7 w-full sm:w-auto disabled:opacity-50"
        >
          {submitting ? "Calculando…" : "Ver meu resultado"}
        </Button>
        {!canSubmit && (
          <p className="text-[12px] text-foreground/80">
            Preencha nome, e-mail, WhatsApp e marque o consentimento para liberar o envio.
          </p>
        )}
      </section>
    </form>
  );
}
