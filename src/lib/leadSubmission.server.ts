import { env } from "cloudflare:workers";
import { submissionSchema, parseLeadValue } from "./leadSubmission";
import { safePage } from "./attribution";
import { qualifyVisas } from "./visaQualifier";
import type { PreQualAnswers } from "./prequal";
import type { KvCaller, KvResult } from "./kv.server";

async function hash(text: string) {
  return Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))),
    (b) => b.toString(16).padStart(2, "0"),
  ).join("");
}
let tablesEnsured = false;
async function ensureReceiptTables() {
  if (tablesEnsured) return;
  try {
    await env.DB.batch([
      env.DB.prepare(
        `CREATE TABLE IF NOT EXISTS lead_receipts (
          receipt_id TEXT PRIMARY KEY,
          table_name TEXT NOT NULL,
          owner_hash TEXT NOT NULL,
          payload_hash TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        )`,
      ),
      env.DB.prepare(
        `CREATE TABLE IF NOT EXISTS lead_rate_limits (
          bucket TEXT PRIMARY KEY,
          attempts INTEGER NOT NULL DEFAULT 1,
          expires_at INTEGER NOT NULL
        )`,
      ),
      env.DB.prepare(
        `CREATE INDEX IF NOT EXISTS idx_lead_rate_expiry ON lead_rate_limits(expires_at)`,
      ),
    ]);
    tablesEnsured = true;
  } catch (err) {
    console.error("[leadSubmission] Failed to ensure receipt tables", err);
  }
}

export async function receiveLead(input: unknown, caller: KvCaller): Promise<KvResult> {
  const parsed = submissionSchema.safeParse(input);
  if (!parsed.success) return { status: 400, error: "envio inválido" };
  const req = parsed.data;
  if ((req.form === "pre-qualificacao") !== (req.table === "prequal_responses"))
    return { status: 400, error: "formulário inválido" };
  if (!caller.ip || caller.token === "anon" || caller.token === "ssr")
    return { status: 400, error: "contexto de envio inválido" };
  let value;
  try {
    value = parseLeadValue(req.form, req.value);
  } catch {
    return { status: 422, error: "Revise os campos do formulário." };
  }

  await ensureReceiptTables();

  const now = Date.now();
  const windowId = Math.floor(now / 600000);
  const bucket = await hash(caller.ip + ":" + windowId);
  let rate: { attempts: number } | null = null;
  try {
    rate = await env.DB.prepare(
      `INSERT INTO lead_rate_limits (bucket, attempts, expires_at) VALUES (?1, 1, ?2)
      ON CONFLICT(bucket) DO UPDATE SET attempts = attempts + 1 RETURNING attempts`,
    )
      .bind(bucket, (windowId + 1) * 600000)
      .first<{ attempts: number }>();
    await env.DB.prepare("DELETE FROM lead_rate_limits WHERE expires_at < ?1").bind(now).run();
  } catch (err) {
    console.warn("[leadSubmission] rate limit check failed", err);
  }
  if (rate && rate.attempts > 20)
    return { status: 429, error: "Muitos envios. Aguarde alguns minutos e tente novamente." };
  const ownerHash = await hash(caller.token);
  const payloadHash = await hash(JSON.stringify({ form: req.form, value }));
  const consent =
    req.consent &&
    now - Date.parse(req.consent.updatedAt) >= 0 &&
    now - Date.parse(req.consent.updatedAt) < 180 * 86400000
      ? req.consent
      : null;
  const attribution =
    consent?.analytics &&
    req.attribution &&
    req.attribution.expires_at > now &&
    req.attribution.expires_at <= now + 30 * 86400000
      ? req.attribution
      : null;
  if (attribution)
    for (const touch of [attribution.first, attribution.last]) {
      touch.landing_page = safePage(touch.landing_page);
      try {
        touch.referrer = new URL(touch.referrer).origin;
      } catch {
        touch.referrer = "";
      }
      if (!consent?.marketing) {
        delete touch.params.gclid;
        delete touch.params.fbclid;
      }
    }
  const record = {
    ...value,
    id: req.id,
    createdAt: new Date().toISOString(),
    status: "novo",
    form_id: req.form,
    lead_channel: "form",
    conversion_page: safePage(req.conversion_page),
    consent,
    attribution,
    utm: attribution?.last.params ?? {},
    origin: {
      utm: attribution?.last.params ?? {},
      internal: {
        from_path: null,
        from_title: null,
        referrer: attribution?.first.referrer ?? null,
        landing_path: attribution?.first.landing_page ?? null,
        landing_ts: attribution?.first.captured_at ?? null,
      },
    },
    crm_integration: { status: "pending_spec" },
    ...(req.form === "pre-qualificacao"
      ? {
          result: qualifyVisas((value as { answers: PreQualAnswers }).answers),
          whatsappOpened: false,
        }
      : {}),
  };
  // D1 batch is transactional. A receipt binds one immutable payload to its browser.
  await env.DB.batch([
    env.DB.prepare(
      `INSERT OR IGNORE INTO lead_receipts (receipt_id, table_name, owner_hash, payload_hash)
      SELECT ?1, ?2, ?3, ?4 WHERE NOT EXISTS (SELECT 1 FROM kv_records WHERE table_name = ?2 AND record_id = ?1)`,
    ).bind(req.id, req.table, ownerHash, payloadHash),
    env.DB.prepare(
      `INSERT OR IGNORE INTO kv_records (table_name, record_id, data)
      SELECT ?1, ?2, ?3 WHERE EXISTS (SELECT 1 FROM lead_receipts WHERE receipt_id = ?2 AND table_name = ?1 AND owner_hash = ?4 AND payload_hash = ?5)`,
    ).bind(req.table, req.id, JSON.stringify(record), ownerHash, payloadHash),
  ]);
  const receipt = await env.DB.prepare(
    "SELECT owner_hash, payload_hash, table_name FROM lead_receipts WHERE receipt_id = ?1",
  )
    .bind(req.id)
    .first<{ owner_hash: string; payload_hash: string; table_name: string }>();
  if (
    !receipt ||
    receipt.owner_hash !== ownerHash ||
    receipt.payload_hash !== payloadHash ||
    receipt.table_name !== req.table
  )
    return {
      status: 409,
      error: "Envio já registrado com outros dados. Recarregue para iniciar outro envio.",
    };
  return { status: 200, data: { accepted: true, receipt: req.id, crm_status: "pending_spec" } };
}
