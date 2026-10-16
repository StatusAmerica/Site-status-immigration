#!/usr/bin/env node
/**
 * Cria um administrador do painel (ou redefine a senha, se o e-mail já existir).
 * Use para o PRIMEIRO admin; os demais podem ser criados em /admin/usuarios.
 *
 *   node scripts/criar-admin.mjs           # banco de produção (D1 remoto)
 *   node scripts/criar-admin.mjs --local   # banco local do `npm run dev`
 *
 * O hash da senha é gerado aqui, no seu computador; só o hash vai para o banco.
 * Formato idêntico ao de src/lib/adminAuth.server.ts (mantenha em sincronia).
 */
import { execFileSync } from "node:child_process";
import { webcrypto as crypto } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ask, askHidden } from "./lib/prompt.mjs";

const D1_NAME = "site-status-immigration";
const PBKDF2_ITERATIONS = 100_000;
const MIN_PASSWORD_LENGTH = 10;
const target = process.argv.includes("--local") ? "--local" : "--remote";

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITERATIONS },
    key,
    256,
  );
  const b64 = (u8) => Buffer.from(u8).toString("base64");
  return `pbkdf2-sha256$${PBKDF2_ITERATIONS}$${b64(salt)}$${b64(new Uint8Array(bits))}`;
}

const sq = (s) => `'${String(s).replace(/'/g, "''")}'`;

function getArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx !== -1 && idx + 1 < process.argv.length) {
    return process.argv[idx + 1];
  }
  return null;
}

async function main() {
  const argEmail = getArg("--email") || process.env.ADMIN_EMAIL;
  const email = (argEmail || (await ask("E-mail do novo admin: "))).toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("E-mail inválido.");

  const argPassword = getArg("--password") || getArg("--senha") || process.env.ADMIN_PASSWORD;
  let password = argPassword;
  if (!password) {
    password = await askHidden(`Senha (mín. ${MIN_PASSWORD_LENGTH} caracteres): `);
    if (password.length < MIN_PASSWORD_LENGTH) throw new Error("Senha curta demais.");
    const confirm = await askHidden("Repita a senha: ");
    if (confirm !== password) throw new Error("As senhas não conferem.");
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Senha curta demais (mínimo ${MIN_PASSWORD_LENGTH} caracteres).`);
  }

  const hash = await hashPassword(password);
  const sql =
    `INSERT INTO admin_users (id, email, password_hash) VALUES (${sq(crypto.randomUUID())}, ${sq(email)}, ${sq(hash)}) ` +
    `ON CONFLICT (email) DO UPDATE SET password_hash = excluded.password_hash, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now');`;

  const wranglerBin = path.resolve("node_modules/wrangler/bin/wrangler.js");
  const runWrangler = (args, options = {}) => {
    return execFileSync(process.execPath, [wranglerBin, ...args], {
      stdio: "inherit",
      ...options,
    });
  };

  runWrangler(["d1", "migrations", "apply", D1_NAME, target]);

  const tmpSql = path.join(os.tmpdir(), `status-admin-${Date.now()}.sql`);
  fs.writeFileSync(tmpSql, sql, "utf8");
  try {
    runWrangler(["d1", "execute", D1_NAME, target, "--file", tmpSql], {
      stdio: ["inherit", "ignore", "inherit"],
    });
  } finally {
    try {
      fs.unlinkSync(tmpSql);
    } catch {
      /* ignore */
    }
  }

  console.log(`✔ Admin ${email} pronto (${target === "--local" ? "banco local" : "produção"}).`);
}

main().catch((e) => {
  console.error(`✘ ${e.message}`);
  process.exit(1);
});
