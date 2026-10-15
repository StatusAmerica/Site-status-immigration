-- Local receipt/idempotency metadata; no CRM fields or remote API contract.
CREATE TABLE IF NOT EXISTS lead_receipts (
  receipt_id TEXT PRIMARY KEY,
  table_name TEXT NOT NULL,
  owner_hash TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE TABLE IF NOT EXISTS lead_rate_limits (
  bucket TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 1,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_lead_rate_expiry ON lead_rate_limits(expires_at);
