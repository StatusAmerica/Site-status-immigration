/**
 * Constantes institucionais de credenciais / provas sociais.
 *
 * COMPLIANCE (FTC Act §5 e FDUTPA): números em publicidade nos EUA
 * exigem lastro documental verificável ANTES da publicação. Todos os
 * campos marcados com `pending: true` estão bloqueados para exibição
 * até o cliente confirmar com documento comprobatório.
 *
 * NÃO editar os valores sem contrapartida documental (contrato,
 * relatório interno, print oficial datado). Ao liberar, mudar
 * `pending` para false NESTE arquivo e não em cada componente.
 */

export type PendingClaim = {
  value: string;
  label: string;
  /** PENDENTE DE VALIDAÇÃO: cliente precisa enviar documento. */
  pending: boolean;
  /** Nota interna sobre o que precisa ser confirmado. */
  note?: string;
};

// ==== Números institucionais (todos PENDENTES até validação) =====
export const CLAIM_FAMILIAS: PendingClaim = {
  value: "1.000+",
  label: "famílias atendidas",
  pending: true, // TODO(cliente): confirmar com relatório interno datado
};

export const CLAIM_PROCESSOS: PendingClaim = {
  value: "5.000+",
  label: "processos estruturados",
  pending: true, // TODO(cliente): confirmar com relatório interno datado
};

export const CLAIM_SATISFACAO: PendingClaim = {
  value: "98%",
  label: "de satisfação",
  pending: true, // TODO(cliente): confirmar com pesquisa/NPS documentado
};

export const CLAIM_AVALIACOES: PendingClaim = {
  value: "130+",
  label: "avaliações 5★",
  pending: true, // TODO(cliente): confirmar contagem atual Google + Facebook (print datado)
};

// ==== Trajetória (PLACEHOLDER — ano de fundação a confirmar) =====
/**
 * PLACEHOLDER. O cliente precisa confirmar o ano correto de
 * constituição da LLC nos EUA. Texto atual evita afirmações
 * numéricas de tempo ("duas décadas", "25 anos") sem lastro.
 */
export const TRAJECTORY_STATEMENT =
  "Equipe com trajetória consolidada em processos de imigração federal e escritório em Washington, DC.";

// ==== Google ======================================================
// Não cravar "5,0" nem "Nota 5,0": a média muda no dia em que
// qualquer avaliação inferior aparece.
export const GOOGLE_RATING_LABEL = "Avaliações 5★ no Google";

// ==== BBB =========================================================
/**
 * PENDENTE DE VALIDAÇÃO — o cliente precisa escolher UMA das opções
 * abaixo. São mutuamente excludentes:
 *   - "BBB Accredited Business": a empresa é acreditada pelo BBB.
 *   - "BBB Rating A": a empresa apenas tem a nota A, sem acreditação.
 * Tratar como sinônimo é falso.
 */
export const BBB_LABEL_ACCREDITED = "BBB Accredited Business";
export const BBB_LABEL_RATING_ONLY = "BBB Rating A";
/** Enquanto o cliente não confirma, usar o rótulo mais conservador. */
export const BBB_LABEL: string = BBB_LABEL_RATING_ONLY;
export const BBB_PENDING = true;

// ==== Identificadores públicos (verificáveis) =====================
// Não são "claims"; são registros públicos confirmáveis.
export const EIN = "42-4745152";
export const NY_BAR = "5797303";
