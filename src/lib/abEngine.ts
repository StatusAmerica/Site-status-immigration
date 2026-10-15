import { hasAnalyticsConsent } from "./consent";
/**
 * Motor de testes A/B para os Heros das LPs.
 *
 * - Sticky: a variante atribuída ao visitante é persistida em
 *   `status_ab_assignments` (objeto { [segmentId]: variantId }).
 * - Sorteio ponderado por `peso` das variantes ATIVAS do segmento.
 * - Impressão = visitante único atribuído (gravada uma vez por sticky).
 * - Conversão = chamada explicitamente no submit do formulário.
 */

import { get, set } from "./dataStore";
import {
  ensureSeed,
  getVariantsBySegment,
  getVariant,
  type HeroVariant,
  type AbStats,
} from "./segments";

const ASSIGN_KEY = "status_ab_assignments";

function readAssignments(): Record<string, string> {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return {};
  try {
    const raw = window.localStorage.getItem(ASSIGN_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writeAssignments(map: Record<string, string>) {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;
  window.localStorage.setItem(ASSIGN_KEY, JSON.stringify(map));
}

function pickWeighted(variants: HeroVariant[]): HeroVariant {
  const total = variants.reduce((acc, v) => acc + Math.max(0, v.peso || 0), 0);
  if (total <= 0) return variants[0];
  let r = Math.random() * total;
  for (const v of variants) {
    r -= Math.max(0, v.peso || 0);
    if (r <= 0) return v;
  }
  return variants[variants.length - 1];
}

async function bumpImpression(variant: HeroVariant) {
  if (!hasAnalyticsConsent()) return;
  const existing = await get<AbStats>("ab_stats", variant.id);
  const next: AbStats = {
    id: variant.id,
    variant_id: variant.id,
    segment_id: variant.segment_id,
    impressions: (existing?.impressions ?? 0) + 1,
    conversions: existing?.conversions ?? 0,
  };
  await set("ab_stats", variant.id, next);
}

/**
 * Retorna a variante ativa para o segmento (sticky por visitante).
 * Se não houver variantes ativas, retorna null, o caller usa o hero_default.
 */
export async function getActiveVariant(segmentId: string): Promise<HeroVariant | null> {
  await ensureSeed();
  const assignments = readAssignments();
  const assignedId = assignments[segmentId];

  if (assignedId) {
    const existing = await getVariant(assignedId);
    if (existing && existing.ativo && existing.segment_id === segmentId) {
      return existing; // sticky
    }
  }

  const variants = (await getVariantsBySegment(segmentId)).filter((v) => v.ativo);
  if (variants.length === 0) return null;

  const chosen = pickWeighted(variants);
  assignments[segmentId] = chosen.id;
  writeAssignments(assignments);
  await bumpImpression(chosen);
  return chosen;
}

/** Lê (sem atribuir) a variante já atribuída ao visitante para o segmento. */
export function getAssignedVariantId(segmentId: string): string | null {
  return readAssignments()[segmentId] ?? null;
}

/** Incrementa conversion da variante atribuída. Chamado no submit do form. */
export async function registerConversion(segmentId: string): Promise<void> {
  if (!hasAnalyticsConsent()) return;
  const id = getAssignedVariantId(segmentId);
  if (!id) return;
  const existing = await get<AbStats>("ab_stats", id);
  const next: AbStats = {
    id,
    variant_id: id,
    segment_id: segmentId,
    impressions: existing?.impressions ?? 0,
    conversions: (existing?.conversions ?? 0) + 1,
  };
  await set("ab_stats", id, next);
}
