// Envio do lead para o CRM (webhook "Leads SITE", id 166). Roda no servidor, depois que
// o lead é gravado no D1. O payload mantém as MESMAS chaves que o site antigo mandava,
// para o mapeamento que já existe no webhook continuar funcionando.

const CRM_WEBHOOK_URL =
  "https://webhook.agendasistemacrm.com.br/api/v1/webhook-in/31Tr7r6Ausr2nCuOdZTFrZJJ";

const LABELS: Record<string, Record<string, string>> = {
  objetivo_visto: { morar: "Morar definitivamente", trabalhar: "Trabalhar", estudar: "Estudar", turismo: "Turismo" },
  profissao: { medico: "Médico", dentista: "Dentista", engenheiro: "Engenheiro", advogado: "Advogado", empresario: "Empresário", ti: "Tecnologia / TI", outra_qualificada: "Outra área qualificada", outra: "Outra" },
  formacao: { doutorado: "Doutorado", mestrado: "Mestrado", pos: "Pós-graduação", superior: "Ensino superior", sem_superior: "Sem ensino superior" },
  faixaEtaria: { ate_29: "Até 29 anos", "30_39": "30 a 39", "40_49": "40 a 49", "50_mais": "50+" },
  renda: { ate_10: "Até R$ 10 mil", "10_20": "R$ 10–20 mil", "20_40": "R$ 20–40 mil", "40_80": "R$ 40–80 mil", "80_150": "R$ 80–150 mil", "150_mais": "Acima de R$ 150 mil" },
  momento: { ja_decidi: "Já decidi", proximos_1_2: "Próximos 1–2 anos", sonho: "Pesquisando / sonho" },
};

const label = (group: string, v: unknown) => (typeof v === "string" && LABELS[group][v]) || (v as string) || "";

function toE164BR(phone: unknown) {
  const d = String(phone || "").replace(/\D/g, "");
  if (!d) return "";
  return d.length <= 11 ? `55${d}` : d; // (31) 99999-9999 -> 5531999999999
}

type Touch = { params?: Record<string, string | undefined>; referrer?: string; landing_page?: string };

export async function sendLeadToCRM({
  lead = {},
  attribution,
  conversion_page = "",
  id = "",
}: {
  lead?: Record<string, any>;
  attribution?: { first?: Touch; last?: Touch } | null;
  conversion_page?: string;
  id?: string;
}) {
  // usa a última origem (last touch) e cai para a primeira, se não houver
  const touch: Touch = attribution?.last || attribution?.first || {};
  const utm = touch.params || {};
  // pré-qualificação guarda o contato em `answers`
  const answers = lead.answers ?? {};

  const payload = {
    event: "lead.created",
    id: id || lead.id || "",
    created_at: lead.createdAt || new Date().toISOString(),
    from_title: "Status Immigration Law Firm",

    // contato
    nome: lead.nome || answers.fullName || "",
    email: lead.email || answers.email || "",
    whatsapp: lead.whatsapp || answers.whatsapp || "",
    whatsapp_e164: toE164BR(lead.whatsapp || answers.whatsapp),

    // respostas (valor + texto legível)
    objetivo_visto: lead.objetivo_visto || "",
    objetivo_visto_label: label("objetivo_visto", lead.objetivo_visto),
    profissao: lead.profissao || "",
    profissao_label: label("profissao", lead.profissao),
    formacao: lead.formacao || "",
    formacao_label: label("formacao", lead.formacao),
    faixa_etaria: lead.faixaEtaria || "",
    faixa_etaria_label: label("faixaEtaria", lead.faixaEtaria),
    renda: lead.renda || "",
    renda_label: label("renda", lead.renda),
    momento: lead.momento || "",
    momento_label: label("momento", lead.momento),
    segmento: lead.segmento || "",
    score: lead.score ?? "",
    qualification: lead.qualification || "",

    // origem
    utm_source: utm.utm_source || "",
    utm_medium: utm.utm_medium || "",
    utm_campaign: utm.utm_campaign || "",
    utm_content: utm.utm_content || "",
    utm_term: utm.utm_term || "",
    gclid: utm.gclid || "",
    fbclid: utm.fbclid || "",
    referrer: touch.referrer || "",
    landing_page: touch.landing_page || "",
    conversion_page,
  };

  try {
    const res = await fetch(CRM_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.error("[crm] webhook respondeu", res.status);
  } catch (err) {
    // nunca derruba o envio do formulário por causa do CRM
    console.error("[crm] falha ao enviar lead", err);
  }
}
