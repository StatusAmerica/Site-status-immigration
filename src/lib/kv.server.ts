/**
 * Acesso ao D1 (`kv_records`) com as regras de permissão que antes viviam nas
 * policies RLS do Lovable Cloud:
 *
 * - Admin (sessão válida do painel, ver adminAuth.server.ts): lê e grava tudo.
 * - Visitante anônimo:
 *   - lê tabelas de conteúdo público (PUBLIC_READ);
 *   - `prequal_responses`: lê por id (o id é o token da URL de resultado);
 *   - cria registros em ANON_INSERT (leads, sessões, pré-qualificação...);
 *   - em TOKEN_SCOPED, só lê/atualiza/apaga o registro cujo `client_token`
 *     bate com o header `x-client-token` do próprio navegador.
 */
import { env } from "cloudflare:workers";
import type { LeadSubmission } from "./leadSubmission";

export const TABLES = [
  "leads",
  "leads_partial",
  "sessions",
  "site_content",
  "segments",
  "hero_variants",
  "ab_stats",
  "admin_users",
  "settings",
  "page_seo",
  "media",
  "page_sections",
  "blog_posts",
  "prequal_responses",
] as const;
export type TableName = (typeof TABLES)[number];

const PUBLIC_READ = new Set<string>([
  "site_content",
  "segments",
  "hero_variants",
  "settings",
  "page_seo",
  "media",
  "page_sections",
  "blog_posts",
  "ab_stats",
]);
const ANON_INSERT = new Set<string>([
  "leads",
  "leads_partial",
  "sessions",
  "ab_stats",
  "prequal_responses",
]);
const TOKEN_SCOPED = new Set<string>(["leads_partial", "sessions", "ab_stats"]);

export type KvOp =
  | LeadSubmission
  | { op: "get"; table: string; id: string }
  | { op: "list"; table: string }
  | { op: "set"; table: string; id: string; value: unknown }
  | { op: "remove"; table: string; id: string };

export interface KvCaller {
  admin: boolean;
  token: string;
  ip?: string;
}

export type KvResult = { status: number; data?: unknown; error?: string };

const forbidden: KvResult = { status: 403, error: "forbidden" };

function publicValue(table: string, id: string, data: unknown, admin: boolean) {
  if (!admin && table === "settings" && id === "tracking") {
    const settings = data as { gsc_enabled?: boolean; gsc_verification?: string } | null;
    return { gsc_enabled: settings?.gsc_enabled === true, gsc_verification: settings?.gsc_verification ?? "" };
  }
  return data;
}

function tokenOf(value: unknown): string | undefined {
  if (value && typeof value === "object" && "client_token" in value) {
    const t = (value as { client_token?: unknown }).client_token;
    return typeof t === "string" ? t : undefined;
  }
  return undefined;
}

async function readRow(table: string, id: string): Promise<unknown | null> {
  const row = await env.DB.prepare(
    "SELECT data FROM kv_records WHERE table_name = ?1 AND record_id = ?2",
  )
    .bind(table, id)
    .first<{ data: string }>();
  return row ? JSON.parse(row.data) : null;
}

async function writeRow(table: string, id: string, value: unknown): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO kv_records (table_name, record_id, data) VALUES (?1, ?2, ?3)
     ON CONFLICT (table_name, record_id)
     DO UPDATE SET data = excluded.data, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
  )
    .bind(table, id, JSON.stringify(value ?? null))
    .run();
}

export async function runKv(req: KvOp, caller: KvCaller): Promise<KvResult> {
  if (!req || typeof req !== "object") return { status: 400, error: "operação inválida" };
  const { table } = req;
  if (!(TABLES as readonly string[]).includes(table)) return { status: 400, error: "tabela inválida" };
  if ("id" in req && (typeof req.id !== "string" || !req.id || req.id.length > 200)) {
    return { status: 400, error: "id inválido" };
  }

  switch (req.op) {
    case "submitLead": {
      const { receiveLead } = await import("./leadSubmission.server");
      return receiveLead(req, caller);
    }
    case "get": {
      const data = await readRow(table, req.id);
      if (caller.admin || PUBLIC_READ.has(table) || table === "prequal_responses") {
        return { status: 200, data: publicValue(table, req.id, data, caller.admin) };
      }
      if (TOKEN_SCOPED.has(table) && data && tokenOf(data) === caller.token) {
        return { status: 200, data };
      }
      return { status: 200, data: null };
    }

    case "list": {
      if (!caller.admin && !PUBLIC_READ.has(table)) return forbidden;
      const { results } = await env.DB.prepare(
        "SELECT record_id, data FROM kv_records WHERE table_name = ?1 ORDER BY record_id",
      )
        .bind(table)
        .all<{ record_id: string; data: string }>();
      return {
        status: 200,
        data: results.map((r) => ({ id: r.record_id, data: publicValue(table, r.record_id, JSON.parse(r.data), caller.admin) })),
      };
    }

    case "set": {
      if (caller.admin) {
        await writeRow(table, req.id, req.value);
        return { status: 200 };
      }
      if (!ANON_INSERT.has(table)) return forbidden;

      // Complete public submissions must pass validation and receipt creation.
      if (table === "leads") return forbidden;
      if (table === "prequal_responses") {
        const existing = await readRow(table, req.id);
        if (!existing || (req.value as { whatsappOpened?: unknown })?.whatsappOpened !== true) return forbidden;
        const receipt = await env.DB.prepare("SELECT owner_hash FROM lead_receipts WHERE receipt_id = ?1").bind(req.id).first<{ owner_hash: string }>();
        const ownerHash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(caller.token))), b => b.toString(16).padStart(2, "0")).join("");
        if (!receipt || receipt.owner_hash !== ownerHash) return forbidden;
        await writeRow(table, req.id, { ...(existing as object), whatsappOpened: true });
        return { status: 200 };
      }

      const existing = await readRow(table, req.id);
      if (existing === null) {
        const value = TOKEN_SCOPED.has(table)
          ? { ...(req.value as object), client_token: caller.token }
          : req.value;
        await writeRow(table, req.id, value);
        return { status: 200 };
      }
      if (TOKEN_SCOPED.has(table) && tokenOf(existing) === caller.token) {
        await writeRow(table, req.id, { ...(req.value as object), client_token: caller.token });
        return { status: 200 };
      }
      return forbidden;
    }

    case "remove": {
      if (!caller.admin) {
        if (!TOKEN_SCOPED.has(table)) return forbidden;
        const existing = await readRow(table, req.id);
        if (existing === null) return { status: 200 };
        if (tokenOf(existing) !== caller.token) return forbidden;
      }
      await env.DB.prepare("DELETE FROM kv_records WHERE table_name = ?1 AND record_id = ?2")
        .bind(table, req.id)
        .run();
      return { status: 200 };
    }

    default:
      return { status: 400, error: "operação inválida" };
  }
}
