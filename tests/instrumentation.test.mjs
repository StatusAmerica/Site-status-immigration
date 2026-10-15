import "./register.mjs";
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";

const sqlite = new DatabaseSync(":memory:");
for (const file of ["0001_kv_records.sql", "0003_lead_receipts.sql"])
  sqlite.exec(readFileSync(new URL("../migrations/" + file, import.meta.url), "utf8"));
let fail = false;
const DB = {
  prepare(sql) {
    let values = {};
    const stmt = sqlite.prepare(sql.replace(/\?(\d+)/g, (_, n) => "$p" + n));
    return {
      bind(...args) {
        values = Object.fromEntries(args.map((v, i) => ["$p" + (i + 1), v]));
        return this;
      },
      first() {
        if (fail) throw Error("storage unavailable");
        return Promise.resolve(stmt.get(values) || null);
      },
      all() {
        return Promise.resolve({ results: stmt.all(values) });
      },
      run() {
        if (fail) throw Error("storage unavailable");
        return Promise.resolve(stmt.run(values));
      },
    };
  },
  async batch(statements) {
    sqlite.exec("BEGIN");
    try {
      for (const stmt of statements) await stmt.run();
      sqlite.exec("COMMIT");
    } catch (e) {
      sqlite.exec("ROLLBACK");
      throw e;
    }
  },
};
globalThis.testEnv = { DB };
function storage() {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
    clear: () => data.clear(),
  };
}
const localStorage = storage(),
  sessionStorage = storage();
globalThis.window = Object.assign(new EventTarget(), {
  localStorage,
  sessionStorage,
  location: new URL("https://example.test/"),
  dataLayer: [],
});
globalThis.localStorage = localStorage;
globalThis.sessionStorage = sessionStorage;
globalThis.document = { referrer: "", cookie: "" };
const consent = await import("../src/lib/consent.ts");
const attribution = await import("../src/lib/attribution.ts");
const tracking = await import("../src/lib/tracking.ts");
const { runKv } = await import("../src/lib/kv.server.ts");
const { submitLead } = await import("../src/lib/dataStore.ts");
const { emptyAnswers } = await import("../src/lib/prequal.ts");
const caller = { admin: false, token: "browser-test-token", ip: "192.0.2.1" };
const contact = {
  nome: "Pessoa de teste",
  email: "example@example.test",
  whatsapp: "(11) 99999-9999",
  mensagem: "Mensagem sintética de teste",
  consent: true,
};
function submission(id = crypto.randomUUID()) {
  return {
    op: "submitLead",
    table: "leads",
    id,
    form: "contato",
    value: contact,
    consent: null,
    attribution: null,
    conversion_page: "/contato?email=private@example.test",
  };
}
beforeEach(() => {
  fail = false;
  sqlite.exec("DELETE FROM lead_receipts; DELETE FROM lead_rate_limits; DELETE FROM kv_records;");
  localStorage.clear();
  sessionStorage.clear();
  window.dataLayer = [];
  window.location = new URL("https://example.test/");
  document.referrer = "";
  document.cookie = "";
  attribution.clearAttribution();
});
test("no consent: no analytics, no campaign persistence; forms still accepted", async () => {
  window.location = new URL("https://example.test/?utm_source=google&gclid=private");
  tracking.trackFormStart({ form_name: "contato" });
  tracking.trackWhatsAppOpened();
  assert.equal(attribution.captureAttribution(), null);
  assert.deepEqual(window.dataLayer, []);
  assert.equal((await runKv(submission(), caller)).status, 200);
});
test("first/last campaign survive internal navigation; ads require separate permission", () => {
  consent.saveConsent(true, false);
  window.location = new URL(
    "https://example.test/?utm_source=google&utm_campaign=first&gclid=secret",
  );
  assert.equal(attribution.captureAttribution().first.params.gclid, undefined);
  window.location = new URL("https://example.test/contato");
  assert.equal(attribution.captureAttribution().last.params.utm_source, "google");
  consent.saveConsent(true, true);
  window.location = new URL("https://example.test/avaliacao?utm_source=meta&fbclid=click-2");
  const result = attribution.captureAttribution();
  assert.equal(result.first.params.utm_source, "google");
  assert.equal(result.last.params.utm_source, "meta");
  assert.equal(result.last.params.fbclid, "click-2");
  window.location = new URL(
    "https://example.test/avaliacao/whatsapp?utm_source=whatsapp_popup&utm_medium=floating_button",
  );
  assert.equal(attribution.captureAttribution().last.params.utm_source, "meta");
});
test("revocation clears attribution and ad identifiers; expiry resets acquisition", () => {
  consent.saveConsent(true, true);
  window.location = new URL("https://example.test/?gclid=click-1");
  attribution.captureAttribution();
  consent.saveConsent(true, false);
  assert.equal(attribution.captureAttribution().first.params.gclid, undefined);
  const old = attribution.captureAttribution();
  old.expires_at = 0;
  localStorage.setItem(attribution.ATTRIBUTION_KEY, JSON.stringify(old));
  window.location = new URL("https://example.test/contato?utm_source=new");
  assert.equal(attribution.captureAttribution().first.params.utm_source, "new");
  consent.saveConsent(false, false);
  assert.equal(attribution.captureAttribution(), null);
  assert.equal(localStorage.getItem(attribution.ATTRIBUTION_KEY), null);
});
test("events exclude PII, tokens and arbitrary metadata; one lead per receipt", () => {
  consent.saveConsent(true, true);
  window.location = new URL("https://example.test/pre-qualificacao/r/secret-token?email=private");
  tracking.trackFormStart({
    form_name: "contato",
    email: "private@example.test",
    gclid: "secret",
    score: 80,
  });
  const id = crypto.randomUUID();
  tracking.trackReceivedLead(id, "contato");
  tracking.trackReceivedLead(id, "contato");
  tracking.trackWhatsAppOpened({ whatsapp: "11999999999" });
  assert.equal(window.dataLayer.filter((e) => e.event === "generate_lead").length, 1);
  assert.equal(window.dataLayer.filter((e) => e.event === "click_whatsapp").length, 1);
  const serialized = JSON.stringify(window.dataLayer);
  for (const secret of ["private", "secret-token", "11999999999", id, "score", "gclid"])
    assert.ok(!serialized.includes(secret));
  window.location = new URL("https://example.test/admin/leads");
  const count = window.dataLayer.length;
  tracking.trackFormStart();
  assert.equal(window.dataLayer.length, count);
});
test("expired or malformed consent is denied", () => {
  localStorage.setItem(
    consent.CONSENT_KEY,
    JSON.stringify({
      version: 1,
      analytics: true,
      marketing: true,
      updatedAt: "2020-01-01T00:00:00.000Z",
    }),
  );
  assert.equal(consent.hasAnalyticsConsent(), false);
  localStorage.setItem(consent.CONSENT_KEY, "{");
  assert.equal(consent.hasAnalyticsConsent(), false);
});
test("malformed attribution is replaced and server rejects expired attribution", async () => {
  consent.saveConsent(true, false);
  for (const bad of ["{", JSON.stringify({ first: { params: {} }, last: { params: {} } })]) {
    localStorage.setItem(attribution.ATTRIBUTION_KEY, bad);
    assert.equal(attribution.captureAttribution().first.landing_page, "/");
  }
  const req = submission();
  req.consent = consent.getConsent();
  req.attribution = attribution.captureAttribution();
  req.attribution.expires_at = 0;
  assert.equal((await runKv(req, caller)).status, 200);
  const record = JSON.parse(sqlite.prepare("SELECT data FROM kv_records").get().data);
  assert.equal(record.attribution, null);
});
test("server validates contact/consent, rejects generic writes and strips injected fields", async () => {
  const bad = submission();
  bad.value = { ...contact, email: "bad" };
  assert.equal((await runKv(bad, caller)).status, 422);
  bad.value = { ...contact, consent: false };
  assert.equal((await runKv(bad, caller)).status, 422);
  assert.equal(
    (await runKv({ op: "set", table: "leads", id: "bypass", value: contact }, caller)).status,
    403,
  );
  const valid = submission();
  valid.value = { ...contact, crm_id: "invented", status: "ganho" };
  assert.equal((await runKv(valid, caller)).status, 200);
  const record = JSON.parse(sqlite.prepare("SELECT data FROM kv_records").get().data);
  assert.equal(record.crm_id, undefined);
  assert.equal(record.status, "novo");
  assert.equal(record.crm_integration.status, "pending_spec");
  assert.equal(record.conversion_page, "/contato");
});
test("same receipt retries are idempotent; changed payload/owner rejected", async () => {
  const req = submission();
  assert.equal((await runKv(req, caller)).status, 200);
  assert.equal((await runKv(req, caller)).status, 200);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM kv_records").get().count, 1);
  assert.equal((await runKv(req, { ...caller, token: "other" })).status, 409);
  assert.equal(
    (await runKv({ ...req, value: { ...contact, nome: "Different" } }, caller)).status,
    409,
  );
});
test("rate limits prevent the 21st accepted attempt in ten minutes", async () => {
  for (let index = 0; index < 20; index++)
    assert.equal((await runKv(submission(), caller)).status, 200);
  assert.equal((await runKv(submission(), caller)).status, 429);
});
test("server strips attribution without consent and click IDs without marketing", async () => {
  consent.saveConsent(true, true);
  window.location = new URL("https://example.test/?utm_source=test&gclid=secret");
  const attr = attribution.captureAttribution();
  const req = submission();
  req.attribution = attr;
  await runKv(req, caller);
  let record = JSON.parse(
    sqlite.prepare("SELECT data FROM kv_records WHERE record_id = ?").get(req.id).data,
  );
  assert.equal(record.attribution, null);
  req.id = crypto.randomUUID();
  req.consent = { ...consent.getConsent(), marketing: false };
  await runKv(req, caller);
  record = JSON.parse(
    sqlite.prepare("SELECT data FROM kv_records WHERE record_id = ?").get(req.id).data,
  );
  assert.equal(record.attribution.first.params.gclid, undefined);
  assert.equal(record.utm.utm_source, "test");
});
test("all profile forms and prequal accepted; result calculated on server", async () => {
  const profile = {
    ...contact,
    profissao: "medico",
    formacao: "superior",
    faixaEtaria: "30_39",
    renda: "20_40",
    momento: "ja_decidi",
  };
  for (const form of ["avaliacao", "avaliacao-whatsapp", "avaliacao-legacy"])
    assert.equal((await runKv({ ...submission(), form, value: profile }, caller)).status, 200);
  const req = {
    ...submission(),
    table: "prequal_responses",
    form: "pre-qualificacao",
    value: {
      answers: {
        ...emptyAnswers,
        fullName: contact.nome,
        email: contact.email,
        whatsapp: contact.whatsapp,
        consent: true,
      },
      result: "forged",
    },
  };
  assert.equal((await runKv(req, caller)).status, 200);
  const record = JSON.parse(
    sqlite.prepare("SELECT data FROM kv_records WHERE record_id = ?").get(req.id).data,
  );
  assert.equal(typeof record.result, "object");
  assert.equal(
    (await runKv({ ...req, id: crypto.randomUUID(), table: "leads" }, caller)).status,
    400,
  );
});
test("client never reports a lead after network/database failure or malformed acknowledgement", async () => {
  consent.saveConsent(true, false);
  for (const mode of ["network", "database", "bad-ack"]) {
    globalThis.fetch = async () => {
      if (mode === "network") throw Error("offline");
      return new Response(
        JSON.stringify(mode === "database" ? { error: "failed" } : { data: { accepted: false } }),
        { status: mode === "database" ? 500 : 200 },
      );
    };
    await assert.rejects(submitLead("leads", crypto.randomUUID(), contact, "contato"));
  }
  assert.equal(window.dataLayer.length, 0);
  assert.equal(localStorage.getItem("status_leads"), null);
  fail = true;
  await assert.rejects(runKv(submission(), caller));
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM lead_receipts").get().count, 0);
});
test("client accepted retry produces only one analytics conversion", async () => {
  consent.saveConsent(true, false);
  globalThis.fetch = async (_url, options) => {
    const result = await runKv(JSON.parse(options.body), {
      ...caller,
      token: options.headers["x-client-token"],
    });
    return new Response(JSON.stringify(result), { status: result.status });
  };
  const id = crypto.randomUUID();
  await submitLead("leads", id, contact, "contato");
  await submitLead("leads", id, contact, "contato");
  assert.equal(window.dataLayer.filter((e) => e.event === "generate_lead").length, 1);
});
test("analytics failure cannot invalidate an acknowledged lead", async () => {
  consent.saveConsent(true, false);
  globalThis.fetch = async (_url, options) => {
    const request = JSON.parse(options.body);
    return new Response(JSON.stringify({ data: { accepted: true, receipt: request.id } }));
  };
  window.dataLayer.push = () => {
    throw Error("tag failed");
  };
  await assert.doesNotReject(submitLead("leads", crypto.randomUUID(), contact, "contato"));
});
test("legacy webhook configuration is not exposed publicly", async () => {
  await runKv(
    {
      op: "set",
      table: "settings",
      id: "tracking",
      value: {
        webhook_url: "https://example.test/secret",
        gsc_enabled: true,
        gsc_verification: "public",
      },
    },
    { ...caller, admin: true },
  );
  const result = await runKv({ op: "get", table: "settings", id: "tracking" }, caller);
  assert.deepEqual(result.data, { gsc_enabled: true, gsc_verification: "public" });
});
