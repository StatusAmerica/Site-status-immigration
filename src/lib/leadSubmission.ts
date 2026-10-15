import { z } from "zod";

export const formIdSchema = z.enum([
  "avaliacao",
  "avaliacao-whatsapp",
  "avaliacao-legacy",
  "contato",
  "pre-qualificacao",
]);
const text = z.string().trim().max(200);
const phone = z
  .string()
  .trim()
  .max(30)
  .refine(
    (v) =>
      /^\+?[\d\s().-]+$/.test(v) &&
      v.replace(/\D/g, "").length >= 10 &&
      v.replace(/\D/g, "").length <= 15,
  );
const contact = z.object({
  nome: text.min(2),
  email: z.string().trim().email().max(254),
  whatsapp: phone,
});
const profile = contact.extend({
  objetivo_visto: z.enum(["morar", "trabalhar", "estudar", "turismo", ""]).optional(),
  profissao: text.min(1),
  formacao: text.min(1),
  faixaEtaria: text.min(1),
  renda: text.min(1),
  momento: text.min(1),
  cidade: text.optional(),
  uf: z.string().max(2).optional(),
  segmento: text.optional(),
  variante_ab: text.nullable().optional(),
  score: z.number().min(0).max(100).optional(),
  qualification: z.enum(["qualificado", "nao_qualificado"]).optional(),
  qualification_reasons: z.array(text).max(30).optional(),
});
const message = contact.extend({
  mensagem: z.string().trim().min(10).max(4000),
  consent: z.literal(true),
});
const answers = z.object({
  fullName: text.min(3),
  email: z.string().trim().email().max(254),
  whatsapp: phone,
  consent: z.literal(true),
  area: z.enum([
    "saude",
    "tecnologia",
    "engenharia",
    "ciencia",
    "negocios",
    "educacao",
    "artes",
    "outro",
  ]),
  education: z.enum(["ensino_medio", "graduacao", "mestrado", "doutorado"]),
  experienceYears: z.number().min(0).max(80),
  seniority: z.enum(["junior", "pleno", "senior", "lideranca", "executivo"]),
  income: z.enum(["<10k", "10-20k", "20-40k", "40-80k", "80k+"]),
  englishLevel: z.enum(["basico", "intermediario", "avancado", "fluente"]),
  awards: z.enum(["nenhum", "regional", "nacional", "internacional"]),
  publications: z.enum(["0", "1-2", "3-9", "10+"]),
  mediaCoverage: z.boolean(),
  judging: z.boolean(),
  originalContribution: z.boolean(),
  memberships: z.boolean(),
  leadershipRole: z.boolean(),
  highSalary: z.boolean(),
  usJobOffer: z.boolean(),
  priorVisaDenial: z.boolean(),
});
const consentSchema = z
  .object({
    analytics: z.boolean(),
    marketing: z.boolean(),
    version: z.literal(1),
    updatedAt: z.string().datetime(),
  })
  .nullable();
const params = z.object({
  utm_source: text.optional(),
  utm_medium: text.optional(),
  utm_campaign: text.optional(),
  utm_content: text.optional(),
  utm_term: text.optional(),
  gclid: text.optional(),
  fbclid: text.optional(),
});
const touch = z.object({
  params,
  landing_page: z.string().max(300),
  referrer: z.string().max(300),
  captured_at: z.string().datetime(),
});
export const submissionSchema = z
  .object({
    op: z.literal("submitLead"),
    table: z.enum(["leads", "prequal_responses"]),
    id: z.string().regex(/^[a-zA-Z0-9_-]{10,100}$/),
    form: formIdSchema,
    value: z.unknown(),
    consent: consentSchema,
    attribution: z.object({ first: touch, last: touch, expires_at: z.number() }).nullable(),
    conversion_page: z.string().max(300),
  })
  .strict();
export type LeadSubmission = z.infer<typeof submissionSchema>;
export function parseLeadValue(form: LeadSubmission["form"], value: unknown) {
  if (form === "pre-qualificacao") return z.object({ answers }).parse(value);
  if (form === "contato") return { ...message.parse(value), channel: "contato", type: "mensagem" };
  return profile.parse(value);
}
