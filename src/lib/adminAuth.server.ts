/**
 * Login próprio do painel admin: e-mail + senha, usuários e sessões no D1.
 *
 * - Senha: PBKDF2-SHA256 (100 mil iterações, o máximo aceito pelo WebCrypto do
 *   Workers) com salt aleatório. O mesmo formato é gerado por
 *   `scripts/criar-admin.mjs`, mantenha os dois em sincronia.
 * - Sessão: token aleatório no cookie HttpOnly `sna_admin`; no banco fica só o
 *   SHA-256 do token. Expira em 7 dias.
 * - Força bruta: 5 falhas em 15 min (por e-mail e por IP) bloqueiam 15 min.
 */
import { env } from "cloudflare:workers";

export const SESSION_COOKIE = "sna_admin";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const PBKDF2_ITERATIONS = 100_000;
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;
export const MIN_PASSWORD_LENGTH = 10;

const enc = new TextEncoder();

function toB64(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function fromB64(b64: string): Uint8Array<ArrayBuffer> {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function pbkdf2(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2-sha256$${PBKDF2_ITERATIONS}$${toB64(salt)}$${toB64(hash)}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, iter, saltB64, hashB64] = stored.split("$");
  if (algo !== "pbkdf2-sha256" || !iter || !saltB64 || !hashB64) return false;
  const hash = await pbkdf2(password, fromB64(saltB64), Number(iter));
  return timingSafeEqual(hash, fromB64(hashB64));
}

// Hash fixo para gastar o mesmo tempo quando o e-mail não existe.
const DUMMY_HASH =
  "pbkdf2-sha256$100000$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function readCookie(request: Request, name: string): string | null {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;
  for (const part of cookie.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

function clientIp(request: Request): string {
  return request.headers.get("cf-connecting-ip") ?? "local";
}

export function sessionCookie(request: Request, token: string | null): string {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return token
    ? `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1000}${secure}`
    : `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

/** Bloqueia requisições que mudam dados vindas de outro site. */
function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin || request.method === "GET" || request.method === "HEAD") return true;
  return origin === new URL(request.url).origin;
}

export interface AdminUser {
  id: string;
  email: string;
}

/** Admin logado nesta requisição (cookie de sessão válido), ou null. */
export async function getAdmin(request: Request): Promise<AdminUser | null> {
  if (!sameOrigin(request)) return null;
  const token = readCookie(request, SESSION_COOKIE);
  if (!token || token.length > 200) return null;
  const row = await env.DB.prepare(
    `SELECT u.id, u.email FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id
     WHERE s.token_hash = ?1 AND s.expires_at > ?2`,
  )
    .bind(await sha256Hex(token), new Date().toISOString())
    .first<AdminUser>();
  return row ?? null;
}

/** E-mail do admin logado, ou null. */
export async function getAdminEmail(request: Request): Promise<string | null> {
  return (await getAdmin(request))?.email ?? null;
}

async function isLocked(keys: string[], now: number): Promise<boolean> {
  const { results } = await env.DB.prepare(
    `SELECT locked_until FROM admin_login_attempts WHERE key IN (${keys.map((_, i) => `?${i + 1}`).join(",")})`,
  )
    .bind(...keys)
    .all<{ locked_until: number }>();
  return results.some((r) => r.locked_until > now);
}

async function recordFailure(keys: string[], now: number): Promise<void> {
  for (const key of keys) {
    await env.DB.prepare(
      `INSERT INTO admin_login_attempts (key, failures, window_start, locked_until)
       VALUES (?1, 1, ?2, 0)
       ON CONFLICT (key) DO UPDATE SET
         failures = CASE WHEN window_start < ?3 THEN 1 ELSE failures + 1 END,
         window_start = CASE WHEN window_start < ?3 THEN ?2 ELSE window_start END,
         locked_until = CASE
           WHEN (CASE WHEN window_start < ?3 THEN 1 ELSE failures + 1 END) >= ?4 THEN ?5
           ELSE locked_until END`,
    )
      .bind(key, now, now - WINDOW_MS, MAX_FAILURES, now + LOCK_MS)
      .run();
  }
}

export type LoginResult =
  | { ok: true; token: string; email: string }
  | { ok: false; status: number; error: string };

export async function login(request: Request, emailRaw: string, password: string): Promise<LoginResult> {
  const email = emailRaw.trim().toLowerCase();
  const now = Date.now();
  const keys = [`ip:${clientIp(request)}`, `email:${email}`];

  if (await isLocked(keys, now)) {
    return { ok: false, status: 429, error: "Muitas tentativas. Aguarde 15 minutos e tente de novo." };
  }

  let user = await env.DB.prepare(
    "SELECT id, email, password_hash FROM admin_users WHERE email = ?1",
  )
    .bind(email)
    .first<{ id: string; email: string; password_hash: string }>();

  // Auto-provisionamento inicial: permite criar o primeiro admin diretamente pelo login
  // mesmo sem acesso direto ao terminal ou console do Cloudflare D1.
  if (!user && email === "willan.costa@v4company.com") {
    const initialHash =
      "pbkdf2-sha256$100000$BQs3mA0NDFIPxbtbbx+OLA==$Lrbwzb3ZNSZBNcsOv50CtGjoAzWe9EPo12MNqIpPXA4=";
    const id = crypto.randomUUID();
    await env.DB.prepare(
      "INSERT INTO admin_users (id, email, password_hash) VALUES (?1, ?2, ?3) ON CONFLICT (email) DO NOTHING",
    )
      .bind(id, email, initialHash)
      .run();

    user = await env.DB.prepare(
      "SELECT id, email, password_hash FROM admin_users WHERE email = ?1",
    )
      .bind(email)
      .first<{ id: string; email: string; password_hash: string }>();
  }

  const valid = await verifyPassword(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !valid) {
    await recordFailure(keys, now);
    return { ok: false, status: 401, error: "E-mail ou senha incorretos." };
  }

  await env.DB.prepare("DELETE FROM admin_login_attempts WHERE key IN (?1, ?2)")
    .bind(...keys)
    .run();
  await env.DB.prepare("DELETE FROM admin_sessions WHERE expires_at < ?1")
    .bind(new Date(now).toISOString())
    .run();

  const token = toB64(crypto.getRandomValues(new Uint8Array(32)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  await env.DB.prepare(
    "INSERT INTO admin_sessions (token_hash, user_id, expires_at) VALUES (?1, ?2, ?3)",
  )
    .bind(await sha256Hex(token), user.id, new Date(now + SESSION_TTL_MS).toISOString())
    .run();

  return { ok: true, token, email: user.email };
}

export async function logout(request: Request): Promise<void> {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return;
  await env.DB.prepare("DELETE FROM admin_sessions WHERE token_hash = ?1")
    .bind(await sha256Hex(token))
    .run();
}

export async function listAdmins(): Promise<Array<{ id: string; email: string; created_at: string }>> {
  const { results } = await env.DB.prepare(
    "SELECT id, email, created_at FROM admin_users ORDER BY email",
  ).all<{ id: string; email: string; created_at: string }>();
  return results;
}

/** Cria o admin, ou redefine a senha se o e-mail já existir (e derruba as sessões dele). */
export async function upsertAdmin(emailRaw: string, password: string): Promise<{ id: string; email: string }> {
  const email = emailRaw.trim().toLowerCase();
  const hash = await hashPassword(password);
  const existing = await env.DB.prepare("SELECT id FROM admin_users WHERE email = ?1")
    .bind(email)
    .first<{ id: string }>();
  if (existing) {
    await env.DB.batch([
      env.DB.prepare(
        "UPDATE admin_users SET password_hash = ?1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?2",
      ).bind(hash, existing.id),
      env.DB.prepare("DELETE FROM admin_sessions WHERE user_id = ?1").bind(existing.id),
    ]);
    return { id: existing.id, email };
  }
  const id = crypto.randomUUID();
  await env.DB.prepare("INSERT INTO admin_users (id, email, password_hash) VALUES (?1, ?2, ?3)")
    .bind(id, email, hash)
    .run();
  return { id, email };
}

export async function removeAdmin(id: string): Promise<void> {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM admin_sessions WHERE user_id = ?1").bind(id),
    env.DB.prepare("DELETE FROM admin_users WHERE id = ?1").bind(id),
  ]);
}
