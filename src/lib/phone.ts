/**
 * Normalização de números de telefone brasileiros para o formato E.164
 * (+55DDNNNNNNNNN), usado em links wa.me e no envio para atendentes.
 *
 * Regras:
 *  - Aceita entradas mascaradas: "(11) 98765-4321", "11987654321",
 *    "+55 11 98765-4321", "55 11 987654321", "0055 11...".
 *  - Descarta prefixo internacional "00" e código de país "55" duplicado.
 *  - Requer DDD (2 dígitos) + número (8 ou 9 dígitos). Se faltar o 9º
 *    dígito em celulares (DDD >= 11), a normalização falha (retorna null)
 *    para evitar links quebrados.
 *  - Não confia em entrada crua: limita a 20 caracteres antes de processar,
 *    remove qualquer caractere não-numérico após o "+".
 */

const MAX_INPUT_LEN = 20;

/** DDDs válidos no Brasil (2 dígitos, 11-99, exclui alguns não atribuídos). */
function isValidDdd(ddd: string): boolean {
  const n = Number(ddd);
  return n >= 11 && n <= 99;
}

export interface NormalizedPhone {
  /** E.164 completo, ex.: "+5511987654321". */
  e164: string;
  /** Somente dígitos com DDI, ex.: "5511987654321" (formato exigido pelo wa.me). */
  digits: string;
  /** Formato humano, ex.: "+55 (11) 98765-4321". */
  display: string;
  ddd: string;
  local: string;
}

/**
 * Normaliza um telefone BR para E.164. Retorna null se inválido.
 */
export function normalizeBrPhone(raw: string): NormalizedPhone | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().slice(0, MAX_INPUT_LEN);
  let digits = trimmed.replace(/\D+/g, "");
  if (!digits) return null;

  // Remove prefixo internacional "00" (ex.: "0055 11...").
  if (digits.startsWith("00")) digits = digits.slice(2);
  // Remove DDI 55 se presente.
  if (digits.startsWith("55") && digits.length > 11) digits = digits.slice(2);
  // Remove "0" de operadora antigo (ex.: 011 → 11).
  if (digits.length === 12 && digits.startsWith("0")) digits = digits.slice(1);

  // Após limpeza, espera 10 (fixo) ou 11 (celular com 9) dígitos: DDD + número.
  if (digits.length !== 10 && digits.length !== 11) return null;

  const ddd = digits.slice(0, 2);
  const local = digits.slice(2);
  if (!isValidDdd(ddd)) return null;

  // Celulares no Brasil hoje exigem 9º dígito (número local com 9 dígitos
  // começando em 9). Fixos usam 8 dígitos. Rejeita padrões inconsistentes.
  if (local.length === 9 && !local.startsWith("9")) return null;
  if (local.length === 8 && local.startsWith("9")) {
    // Provável celular sem o 9 na frente. Rejeita para não gerar wa.me quebrado.
    return null;
  }

  const e164Digits = `55${ddd}${local}`;
  const e164 = `+${e164Digits}`;
  const displayLocal =
    local.length === 9
      ? `${local.slice(0, 5)}-${local.slice(5)}`
      : `${local.slice(0, 4)}-${local.slice(4)}`;
  return {
    e164,
    digits: e164Digits,
    display: `+55 (${ddd}) ${displayLocal}`,
    ddd,
    local,
  };
}

/**
 * Máscara "(DD) NNNNN-NNNN" para o campo de WhatsApp. Antes de cortar em 11
 * dígitos, tira o "00" e o DDI 55 que o autofill do navegador ("+55 31 9...")
 * ou um número colado trazem; sem isso o 55 virava DDD e o último dígito sumia.
 * Só remove o 55 com mais de 11 dígitos, então DDD 55 (RS) digitado continua.
 */
export function maskBrPhone(v: string): string {
  let d = v.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("55") && d.length > 11) d = d.slice(2);
  d = d.slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  // fixo (10 dígitos): 4-4; celular (11): 5-4
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Conveniência: retorna apenas os dígitos com DDI, ou null. */
export function toWaDigits(raw: string): string | null {
  return normalizeBrPhone(raw)?.digits ?? null;
}
