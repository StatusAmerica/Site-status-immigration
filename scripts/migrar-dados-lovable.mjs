#!/usr/bin/env node
/**
 * Migração única: Supabase da Lovable → Cloudflare D1 + R2.
 *
 * ATENÇÃO: os dados reais estão no Supabase ORIGINAL (rtbknvkquybujxsvvrfy), que é
 * o que o site publicado na Lovable usa. O `.env` do repositório apontava para um
 * Lovable Cloud novo e vazio, criado por um "remix" em 2026-10-02.
 *
 * 1. Faz login no Supabase com um usuário ADMIN do painel antigo.
 * 2. Baixa toda a tabela `kv_records` (leads, conteúdo, blog, SEO...).
 * 3. Baixa as mídias enviadas pelo admin (Supabase Storage) referenciadas nos dados.
 * 4. Reescreve as URLs dessas mídias para `/media/<caminho>` (servidas pelo R2).
 * 5. Gera `migration-data/import.sql`.
 * 6. Com `--aplicar`: envia as mídias para o R2 e importa o SQL no D1 remoto.
 *
 * Uso:
 *   node scripts/migrar-dados-lovable.mjs              # só baixa e gera arquivos
 *   node scripts/migrar-dados-lovable.mjs --aplicar    # baixa e importa na Cloudflare
 *
 * Opções:
 *   --sem-login     não pede senha; traz só o conteúdo público (textos, blog, SEO,
 *                   LPs). Leads/sessões exigem login de admin.
 *   --manter-urls   não reescreve as URLs do Supabase Storage nem envia mídia ao R2
 *                   (útil enquanto o R2 não estiver ativo; as imagens seguem
 *                   carregando do Supabase).
 *
 * Login (um dos dois):
 *   - LOVABLE_ACCESS_TOKEN=<token> : access_token de uma sessão logada no admin antigo
 *     (DevTools → Application → Local Storage → chave `sb-rtbknvkquybujxsvvrfy-auth-token`).
 *   - e-mail e senha de admin (digitados no terminal; a senha não aparece).
 * ATENÇÃO: `migration-data/` contém dados pessoais de leads. Não commitar (já no .gitignore).
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ask, askHidden } from "./lib/prompt.mjs";

// Valores públicos (vão no bundle do site publicado) do Supabase original.
const SUPABASE_URL = process.env.LOVABLE_SUPABASE_URL ?? "https://rtbknvkquybujxsvvrfy.supabase.co";
const SUPABASE_KEY = process.env.LOVABLE_SUPABASE_KEY ?? "sb_publishable_vx0Wr8cZTm1U95TzEf2L4g_u0pqcjzj";

const D1_NAME = "site-status-immigration";
const R2_BUCKET = "site-status-immigration-media";
const OUT = "migration-data";
const APPLY = process.argv.includes("--aplicar");
const NO_LOGIN = process.argv.includes("--sem-login");
const KEEP_URLS = process.argv.includes("--manter-urls");
const SQL_CHUNK = 60_000; // D1 limita cada statement a 100 KB.

async function login() {
  // Token de uma sessão já logada no admin antigo (funciona também com login Google).
  if (process.env.LOVABLE_ACCESS_TOKEN) return process.env.LOVABLE_ACCESS_TOKEN.trim();
  const email = process.env.LOVABLE_ADMIN_EMAIL || (await ask("E-mail do admin (painel antigo): "));
  const password = process.env.LOVABLE_ADMIN_PASSWORD || (await askHidden("Senha (não aparece na tela): "));
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.access_token) {
    throw new Error(`Login falhou (${res.status}): ${body.msg || body.error_description || body.error || "?"}`);
  }
  return body.access_token;
}

async function fetchAllRecords(token) {
  const rows = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const url = `${SUPABASE_URL}/rest/v1/kv_records?select=*&order=table_name.asc,record_id.asc`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Range: `${offset}-${offset + pageSize - 1}`,
      },
    });
    if (!res.ok) throw new Error(`Leitura do kv_records falhou (${res.status}): ${await res.text()}`);
    const page = await res.json();
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return rows;
}

const sq = (s) => `'${String(s).replace(/'/g, "''")}'`;

export function buildSql(rows) {
  const out = [];
  for (const r of rows) {
    const data = JSON.stringify(r.data ?? null);
    const key = `table_name = ${sq(r.table_name)} AND record_id = ${sq(r.record_id)}`;
    const first = data.slice(0, SQL_CHUNK);
    out.push(
      `INSERT OR REPLACE INTO kv_records (table_name, record_id, data, created_at, updated_at) VALUES (${sq(r.table_name)}, ${sq(r.record_id)}, ${sq(first)}, ${sq(r.created_at)}, ${sq(r.updated_at)});`,
    );
    for (let i = SQL_CHUNK; i < data.length; i += SQL_CHUNK) {
      out.push(`UPDATE kv_records SET data = data || ${sq(data.slice(i, i + SQL_CHUNK))} WHERE ${key};`);
    }
  }
  return out.join("\n") + "\n";
}

function wrangler(args) {
  const wranglerBin = join(dirname(fileURLToPath(import.meta.url)), "..", "node_modules", "wrangler", "bin", "wrangler.js");
  execFileSync(process.execPath, [wranglerBin, ...args], { stdio: "inherit" });
}

async function main() {
  mkdirSync(OUT, { recursive: true });

  let token = null;
  if (NO_LOGIN) {
    console.log("→ Sem login: só conteúdo público será copiado.");
  } else {
    console.log("→ Login no Supabase da Lovable…");
    token = await login();
  }

  console.log("→ Baixando kv_records…");
  const rows = await fetchAllRecords(token);
  writeFileSync(join(OUT, "kv_records.backup.json"), JSON.stringify(rows, null, 2));
  const perTable = {};
  for (const r of rows) perTable[r.table_name] = (perTable[r.table_name] ?? 0) + 1;
  console.table(perTable);

  // Mídias do Supabase Storage referenciadas nos dados.
  const storageRe = /https?:\/\/[^"'\s)]+?\/storage\/v1\/object\/public\/media\/([^"'\s)?#]+)/g;
  const mediaPaths = new Set();
  for (const r of rows) {
    for (const m of JSON.stringify(r.data ?? null).matchAll(storageRe)) mediaPaths.add(decodeURI(m[1]));
  }
  console.log(`→ ${mediaPaths.size} arquivo(s) de mídia referenciado(s).`);

  const downloaded = [];
  for (const p of KEEP_URLS ? [] : mediaPaths) {
    // O bucket deixou de ser público: baixa pelo endpoint autenticado.
    const url = `${SUPABASE_URL}/storage/v1/object/authenticated/media/${encodeURI(p)}`;
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (!res.ok) {
      console.warn(`  ! não baixou ${p} (${res.status})`);
      continue;
    }
    const file = join(OUT, "media", p);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    downloaded.push({ path: p, file, type: res.headers.get("content-type") ?? "application/octet-stream" });
    console.log(`  ✓ ${p}`);
  }

  // URLs do Storage → /media/<path> (rota do Worker que lê do R2).
  const copied = new Set(downloaded.map((d) => d.path));
  const rewritten = KEEP_URLS ? rows : rows.map((r) => ({
    ...r,
    // Só reescreve o que foi copiado; o resto continua apontando para o Supabase.
    data: JSON.parse(
      JSON.stringify(r.data ?? null).replace(storageRe, (all, p) =>
        copied.has(decodeURI(p)) ? `/media/${p}` : all,
      ),
    ),
  }));
  const sqlFile = join(OUT, "import.sql");
  writeFileSync(sqlFile, buildSql(rewritten));
  console.log(`→ SQL gerado em ${sqlFile} (${rewritten.length} registros).`);

  if (!APPLY) {
    console.log("\nNada foi enviado para a Cloudflare. Rode de novo com --aplicar para importar.");
    return;
  }

  console.log("→ Enviando mídias para o R2…");
  for (const d of downloaded) {
    wrangler(["r2", "object", "put", `${R2_BUCKET}/${d.path}`, "--file", d.file, "--content-type", d.type, "--remote"]);
  }
  console.log("→ Aplicando schema e importando no D1 remoto…");
  wrangler(["d1", "migrations", "apply", D1_NAME, "--remote"]);
  wrangler(["d1", "execute", D1_NAME, "--remote", "--file", sqlFile, "--yes"]);
  console.log("✔ Migração de dados concluída.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(`✘ ${e.message}`);
    process.exit(1);
  });
}
