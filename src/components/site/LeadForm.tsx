import { LegalNoteInline } from "@/components/legal/LegalDisclaimer";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { newId, submitLead } from "@/lib/dataStore";
import { maskBrPhone } from "@/lib/phone";
import { type LeadInput } from "@/lib/leadScoring";
import { getAssignedVariantId, registerConversion } from "@/lib/abEngine";
import { trackFormStart } from "@/lib/tracking";


export interface LeadFormProps {
  /** Slug do segmento da LP (medicos, engenheiros, empresarios). */
  segmentId?: string;
  /** Pré-seleciona profissão (chave do select). */
  defaultProfissao?: string;
  /**
   * Callback após salvar o lead com sucesso.
   * Quando definido, suprime o estado interno "done" (a página chamadora
   * navega para uma rota de agradecimento, ex.: /avaliacao/obrigado).
   */
  onSubmitted?: (lead: { id: string; score: number; classificacao: string }) => void;
  /** Label do botão de envio. */
  submitLabel?: string;
}

const ufs = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];



const empty: LeadInput = {
  nome: "", email: "", whatsapp: "",
  profissao: "", faixaEtaria: "", formacao: "",
  cidade: "", uf: "", renda: "", momento: "",
};

const maskPhone = maskBrPhone;

export function LeadForm({ segmentId, defaultProfissao, onSubmitted, submitLabel }: LeadFormProps = {}) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<LeadInput>(() => ({
    ...empty,
    profissao: defaultProfissao ?? "",
  }));
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submissionId = useRef(newId("lead"));
  const submittingRef = useRef(false);
  const formStartFiredRef = useRef(false);

  const update = <K extends keyof LeadInput>(k: K, v: LeadInput[K]) => {
    if (!formStartFiredRef.current) {
      formStartFiredRef.current = true;
      trackFormStart({ form_name: "avaliacao-legacy" });
    }
    setData((d) => ({ ...d, [k]: v }));
  };

  const validateStep = (): string | null => {
    if (step === 0) {
      if (!data.nome.trim()) return "Informe seu nome.";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) return "E-mail inválido.";
      if (data.whatsapp.replace(/\D/g, "").length < 10) return "WhatsApp inválido.";
    }
    if (step === 1) {
      if (!data.profissao) return "Selecione sua profissão.";
      if (!data.formacao) return "Selecione sua formação.";
      if (!data.faixaEtaria) return "Selecione sua faixa etária.";
    }
    if (step === 2) {
      if (!data.cidade.trim()) return "Informe sua cidade.";
      if (!data.uf) return "Selecione a UF.";
      if (!data.renda) return "Selecione a faixa de renda.";
      if (!data.momento) return "Selecione o momento da decisão.";
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => s + 1);
  };

  const submit = async () => {

    const err = validateStep();
    if (err) { setError(err); return; }
    setError(null);
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    try {
      // Prompt 7: persistimos apenas respostas cruas + metadados.
      // Score/faixa de prioridade são SEMPRE derivados ao vivo a partir
      // do scoring_model no admin, nunca congelados no lead.
      const id = submissionId.current;
      const utm = {};
      const lead: LeadInput & {
        id: string;
        createdAt: string;
        utm: Record<string, string>;
        segmento?: string;
        variante_ab?: string | null;
        status: "novo";
      } = {
        ...data,
        id,
        createdAt: new Date().toISOString(),
        utm,
        segmento: segmentId,
        variante_ab: segmentId ? getAssignedVariantId(segmentId) : null,
        status: "novo",
      };
      await submitLead("leads", id, lead, "avaliacao-legacy");


      if (segmentId) {
        try { await registerConversion(segmentId); } catch { /* Analytics cannot fail a received lead. */ }
      }
      if (onSubmitted) {
        // Mantemos a assinatura por compat: callers atuais não usam o score.
        onSubmitted({ id, score: 0, classificacao: "" });
      } else {
        setDone(true);
      }
    } catch (e) {
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
    <div className="liquid-card rounded-2xl p-5 md:p-6">
      {/* Stepper */}
      <div className="flex items-center gap-2 mb-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-gold" : "bg-border"
            }`}
          />
        ))}
      </div>
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1">
        Etapa {step + 1} de 3
      </p>

      {step === 0 && (
        <div className="space-y-4">
          <h3 className="font-display text-2xl">Vamos começar pelo básico</h3>
          <div>
            <Label htmlFor="nome">Nome completo</Label>
            <Input id="nome" value={data.nome} onChange={(e) => update("nome", e.target.value)} placeholder="Como devemos te chamar" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={data.email} onChange={(e) => update("email", e.target.value)} placeholder="voce@exemplo.com" />
            </div>
            <div>
              <Label htmlFor="whats">WhatsApp</Label>
              <Input id="whats" value={data.whatsapp} onChange={(e) => update("whatsapp", maskPhone(e.target.value))} placeholder="(11) 99999-9999" />
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-display text-2xl">Sua trajetória profissional</h3>
          <div>
            <Label>Profissão / área de atuação</Label>
            <Select value={data.profissao} onValueChange={(v) => update("profissao", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="medico">Médico</SelectItem>
                <SelectItem value="dentista">Dentista</SelectItem>
                <SelectItem value="engenheiro">Engenheiro</SelectItem>
                <SelectItem value="advogado">Advogado</SelectItem>
                <SelectItem value="empresario">Empresário</SelectItem>
                <SelectItem value="ti">Tecnologia / TI</SelectItem>
                <SelectItem value="outra_qualificada">Outra área qualificada</SelectItem>
                <SelectItem value="outra">Outra</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Formação</Label>
              <Select value={data.formacao} onValueChange={(v) => update("formacao", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="doutorado">Doutorado</SelectItem>
                  <SelectItem value="mestrado">Mestrado</SelectItem>
                  <SelectItem value="pos">Pós-graduação</SelectItem>
                  <SelectItem value="superior">Ensino superior</SelectItem>
                  <SelectItem value="sem_superior">Sem ensino superior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Faixa etária</Label>
              <Select value={data.faixaEtaria} onValueChange={(v) => update("faixaEtaria", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ate_29">Até 29 anos</SelectItem>
                  <SelectItem value="30_39">30 a 39 anos</SelectItem>
                  <SelectItem value="40_49">40 a 49 anos</SelectItem>
                  <SelectItem value="50_mais">50 anos ou mais</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-display text-2xl">Contexto e momento</h3>
          <div className="grid sm:grid-cols-[1fr_120px] gap-4">
            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" value={data.cidade} onChange={(e) => update("cidade", e.target.value)} />
            </div>
            <div>
              <Label>UF</Label>
              <Select value={data.uf} onValueChange={(v) => update("uf", v)}>
                <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                <SelectContent>{ufs.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Renda mensal aproximada</Label>
            <Select value={data.renda} onValueChange={(v) => update("renda", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ate_10">Até R$ 10 mil</SelectItem>
                <SelectItem value="10_20">R$ 10 mil a R$ 20 mil</SelectItem>
                <SelectItem value="20_40">R$ 20 mil a R$ 40 mil</SelectItem>
                <SelectItem value="40_mais">Acima de R$ 40 mil</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Momento da decisão</Label>
            <Select value={data.momento} onValueChange={(v) => update("momento", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ja_decidi">Já decidi, quero ir o quanto antes</SelectItem>
                <SelectItem value="proximos_1_2">Pretendo nos próximos 1 a 2 anos</SelectItem>
                <SelectItem value="sonho">Ainda é um sonho / estou pesquisando</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-6 flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button variant="ghost" className="btn-label" onClick={() => setStep((s) => s - 1)}>Voltar</Button>
        ) : <span />}
        {step < 2 ? (
          <Button className="btn-label" onClick={next}>
            Continuar <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button className="btn-label" onClick={submit} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (submitLabel ?? "Enviar perfil")}
          </Button>
        )}
      </div>

      <LegalNoteInline className="mt-4" />
    </div>
  );
}
