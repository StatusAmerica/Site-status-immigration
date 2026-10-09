# Contexto do projeto

Site da **Status Immigration Law Firm** (captação de leads para vistos EB nos EUA),
domínio de produção **statusimmigrationlaw.com.br**.

O projeto **saiu da Lovable** e roda 100% na Cloudflare:

| Peça | Onde |
|---|---|
| App (TanStack Start, SSR) | Cloudflare Workers, Worker `site-status-immigration` |
| Banco | D1 `site-status-immigration`, tabela única `kv_records` (ver `migrations/`) |
| Mídia enviada pelo admin | R2 `site-status-immigration-media`, servida em `/media/*` |
| Login do `/admin` | E-mail + senha próprios (tabelas `admin_users` / `admin_sessions` no D1) |
| Deploy | Workers Builds conectado ao GitHub: cada push faz build + deploy automático |

## Fluxo de trabalho

- **Commits e pushes são feitos pelo dono do projeto via GitHub Desktop.** Agentes
  não devem rodar `git commit`/`git push`; deixe as mudanças no working tree e diga
  o que commitar.
- Push na branch de produção = deploy automático. Mantenha a branch sempre buildando
  (`npm run build`).
- Não reintroduza Supabase, `@lovable.dev/*` ou `nitro`.

## Arquitetura de dados

- Todo acesso a dados passa por `src/lib/dataStore.ts` (`get/list/set/remove`).
  No navegador ele chama `POST /api/kv`; no SSR acessa o D1 direto.
- As permissões (o que visitante anônimo pode ler/gravar) ficam em
  `src/lib/kv.server.ts`. Admin = requisição com cookie de sessão válido
  (`src/lib/adminAuth.server.ts`: PBKDF2, sessão de 7 dias, bloqueio após 5 falhas).
- Primeiro admin: `node scripts/criar-admin.mjs` (produção) ou `--local`. Os demais
  em /admin/usuarios. Não existe cadastro público.
- Arquivos `*.server.ts` só podem ser importados dinamicamente dentro de handlers
  de servidor (`await import(...)`), nunca no topo de rotas/componentes.

## Comandos

```sh
npm run dev                # local (D1/R2 simulados). Admin local:
                           # node scripts/criar-admin.mjs --local
npm run build
npm run db:migrate:local   # aplica migrations/ no D1 local
npm run db:migrate:remote  # aplica migrations/ no D1 de produção
npm run cf-typegen         # regenera worker-configuration.d.ts após mudar wrangler.jsonc
```

Migração única dos dados antigos do Lovable Cloud: `scripts/migrar-dados-lovable.mjs`
(ver `docs/MIGRACAO-CLOUDFLARE.md`).
