/**
 * prequal, store e modelos do teste de pré-qualificação (/pre-qualificacao).
 *
 * Diferente de `/avaliacao` (lead form curto + scoring comercial), este é um
 * questionário estruturado que termina em um VEREDICTO por visto (apto /
 * parcial / não elegível) usando `visaQualifier.ts`.
 *
 * Persistência:
 *  - `prequal_responses` (dataStore): id = token público curto, valor =
 *    PreQualResponse completo (respostas + resultado + origem).
 *  - Auto-save parcial usa o mesmo localStorage key (PARTIAL_KEY) para
 *    restaurar formulário em caso de fechamento da aba.
 *
 * Compartilhamento público:
 *  - cada resposta gera /pre-qualificacao/r/:token para o lead reabrir e
 *    enviar via WhatsApp à nossa equipe. Não exibe dados sensíveis (CPF etc.)
 *    porque não os coletamos aqui.
 */

import { get, list, set as dsSet, submitLead } from "@/lib/dataStore";
import type { LeadOrigin } from "@/lib/origin";
import type { QualificationResult, VisaCode } from "@/lib/visaQualifier";

/* ============================================================
 * Tipos das respostas
 *
 * Mantemos union-types restritos para que o `visaQualifier` faça matching
 * exato sem normalização adicional. Qualquer nova opção precisa ser
 * adicionada aqui E no scorer correspondente.
 * ============================================================ */

export type Education = "ensino_medio" | "graduacao" | "mestrado" | "doutorado";
export type Seniority = "junior" | "pleno" | "senior" | "lideranca" | "executivo";
export type IncomeBand = "<10k" | "10-20k" | "20-40k" | "40-80k" | "80k+";
export type Publications = "0" | "1-2" | "3-9" | "10+";
export type Awards = "nenhum" | "regional" | "nacional" | "internacional";
export type EnglishLevel = "basico" | "intermediario" | "avancado" | "fluente";
export type Area =
  | "saude" | "tecnologia" | "engenharia" | "ciencia"
  | "negocios" | "educacao" | "artes" | "outro";

/** Estrutura completa de respostas, alimenta o scorer. */
export interface PreQualAnswers {
  // Contato
  fullName: string;
  email: string;
  whatsapp: string;

  // Perfil profissional
  area: Area;
  education: Education;
  experienceYears: number;
  seniority: Seniority;
  income: IncomeBand;
  englishLevel: EnglishLevel;

  // Reconhecimento (EB-1A / O-1 / NIW prong 3)
  awards: Awards;
  publications: Publications;
  mediaCoverage: boolean;
  judging: boolean;
  originalContribution: boolean;
  memberships: boolean;
  leadershipRole: boolean;
  highSalary: boolean;

  // Situação
  usJobOffer: boolean;
  priorVisaDenial: boolean;

  // LGPD
  consent: boolean;
}

/** Default usado para inicializar o formulário e o auto-restore. */
export const emptyAnswers: PreQualAnswers = {
  fullName: "", email: "", whatsapp: "",
  area: "tecnologia",
  education: "graduacao",
  experienceYears: 0,
  seniority: "pleno",
  income: "10-20k",
  englishLevel: "intermediario",
  awards: "nenhum",
  publications: "0",
  mediaCoverage: false,
  judging: false,
  originalContribution: false,
  memberships: false,
  leadershipRole: false,
  highSalary: false,
  usJobOffer: false,
  priorVisaDenial: false,
  consent: false,
};

export interface PreQualResponse {
  id: string;                  // token público curto
  createdAt: string;
  answers: PreQualAnswers;
  result: QualificationResult;
  origin?: LeadOrigin | null;  // origem do tráfego, para o admin
  whatsappOpened?: boolean;    // marcado quando o lead clica em "abrir WhatsApp"
}

/* ============================================================
 * Token público
 *
 * Curto, URL-safe e suficientemente único para captação Brasil. Em
 * migração para Supabase, substituir por nanoid no servidor.
 * ============================================================ */
export function generateToken(): string {
  return crypto.randomUUID();
}

/* ============================================================
 * Persistência
 * ============================================================ */
const PARTIAL_KEY = "status_prequal_draft";

export function saveDraft(answers: PreQualAnswers) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(PARTIAL_KEY, JSON.stringify(answers)); } catch { /* noop */ }
}

export function loadDraft(): PreQualAnswers | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PARTIAL_KEY);
    return raw ? (JSON.parse(raw) as PreQualAnswers) : null;
  } catch { return null; }
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(PARTIAL_KEY); } catch { /* noop */ }
}

/** Persiste a resposta finalizada e devolve o registro completo. */
export async function saveResponse(
  answers: PreQualAnswers,
  result: QualificationResult,
  origin: LeadOrigin | null,
  id = generateToken(),
): Promise<PreQualResponse> {
  const record: PreQualResponse = {
    id, answers, result, origin: origin ?? null,
    createdAt: new Date().toISOString(),
    whatsappOpened: false,
  };
  await submitLead("prequal_responses", id, record, "pre-qualificacao");
  clearDraft();
  return record;
}

export async function listResponses(): Promise<PreQualResponse[]> {
  return list<PreQualResponse>("prequal_responses");
}

export async function markWhatsAppOpened(id: string): Promise<void> {
  const found = await get<PreQualResponse>("prequal_responses", id);
  if (!found) return;
  await dsSet("prequal_responses", id, { ...found, whatsappOpened: true });
}

/* ============================================================
 * Mensagens / share helpers
 * ============================================================ */

export function publicResultUrl(id: string): string {
  if (typeof window === "undefined") return `/pre-qualificacao/r/${id}`;
  return `${window.location.origin}/pre-qualificacao/r/${id}`;
}

/** Mensagem padrão pré-preenchida no WhatsApp do lead → nossa equipe. */
export function whatsappMessageFor(record: PreQualResponse): string {
  const visa: VisaCode = record.result.best.code;
  const name = record.answers.fullName.split(" ")[0] || "Olá";
  const link = publicResultUrl(record.id);
  return [
    `Olá! Sou ${name}.`,
    `Acabei de fazer o teste de pré-qualificação da Status Immigration Law Firm e gostaria de conversar sobre o mapeamento.`,
    `Categoria com maior afinidade no meu perfil: ${visa}.`,
    `Mapa completo: ${link}`,
  ].join("\n\n");
}
