# Deploy na Cloudflare — Status Immigration

Repositório: https://github.com/StatusAmerica/Site-status-immigration
Branch de produção: `main`.

## Nomes dos recursos

| Recurso | Nome |
|---|---|
| Projeto npm | `site-status-immigration` |
| Worker | `site-status-immigration` |
| Banco D1 (binding `DB`) | `site-status-immigration` |
| Bucket R2 (binding `MEDIA`) | `site-status-immigration-media` |

Os nomes em minúsculas são intencionais. O nome do repositório no GitHub
continua `Site-status-immigration`. Renomear a configuração não renomeia recursos
que já existem na Cloudflare.

## Etapas do cliente na Cloudflare

1. Entrar na conta que contém o Worker `site-status-immigration`.
2. Em **Storage & Databases → D1**, criar o banco `site-status-immigration`.
   Copiar o **Database ID** e enviá-lo ao responsável pelo repositório.
3. Criar as tabelas no Console do banco executando, nesta ordem, o SQL de
   `migrations/0001_kv_records.sql` e `migrations/0002_admin_auth.sql`.
   Como alternativa, depois de atualizar o ID no repositório, executar
   `npm run db:migrate:remote` com o Wrangler autenticado nessa conta.
   As migrations usam `IF NOT EXISTS`; não é necessário marcar manualmente
   migrations como aplicadas quando o SQL for executado pelo Console.
4. Em **R2**, criar o bucket `site-status-immigration-media`, se ainda não existir.
   O bucket com o nome anterior não é renomeado nem copiado automaticamente.
   Como não há conteúdo relevante a migrar, não é necessário importar dados antigos.
5. No Worker, conferir **Settings → Builds**:
   - Repositório: `StatusAmerica/Site-status-immigration`.
   - Branch: `main`.
   - Build command: `npm run build`.
   - Deploy command: `npx wrangler deploy`.
6. Depois do push, acompanhar o build/deploy e testar o endereço do Worker.
7. Após preparar o banco, criar o primeiro administrador com
   `node scripts/criar-admin.mjs`, autenticado na mesma conta Cloudflare.
   As tabelas vazias não criam um usuário automaticamente.
8. Adicionar `statusimmigrationlaw.com.br` em **Domains** quando a zona estiver
   nessa conta. O domínio público não mudou com a padronização de nomes.

## Configuração do banco e publicação

O binding `DB` em `wrangler.jsonc` aponta para o banco `site-status-immigration`
com Database ID `42af0ae5-4b29-4244-9713-97b9feef758e`, informado pelo cliente.
Esse ID substitui o identificador legado que causava o erro 10181.

Depois de confirmar que as tabelas foram criadas na conta correta:

```sh
npm ci
npm run build
```

Fazer commit e push para `main` após a validação. O push inicia o deploy automático.
Para futuras mudanças de schema, aplicar `npm run db:migrate:remote` antes de
publicar código que dependa das novas tabelas/colunas.

## Desenvolvimento local

```sh
npm ci
npm run db:migrate:local
npm run dev
```

D1 e R2 são simulados localmente. Não é necessário criar recursos remotos para
validar o build. O script `scripts/migrar-dados-lovable.mjs` fica disponível apenas
para uma eventual importação do sistema antigo; não faz parte deste deploy vazio.
