# Instrumentação GTM, GA4 e preparação para CRM

Atualizado em 15/10/2026. Implementação local; não publicada pelo agente.

## Estado da entrega

| Parte                                                        | Estado                                                                             |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Contêiner `GTM-5ZFTCPP6` e consentimento no site             | Implementados; carga e revogação verificadas no navegador local                    |
| `page_view`, `form_start`, `generate_lead`, `click_whatsapp` | Implementados no dataLayer, condicionados a consentimento                          |
| Atribuição primeira/última origem                            | Persistência local por 30 dias e snapshot no lead recebido                         |
| Recebimento de leads                                         | Validação, recibo transacional no D1, limite de tentativas e confirmação explícita |
| Tags, propriedade e recebimento GA4                          | Dependem de revisão/configuração externa e Preview/DebugView                       |
| Criação de contatos/oportunidades no CRM                     | Pendente de `CRM_INTEGRATION_SPEC.md`                                              |
| Conversas WhatsApp, qualificação e venda                     | Pendentes da integração real do CRM                                                |
| Produção                                                     | Migração remota, commit/push pelo dono e validação pós-deploy pendentes            |

O recebimento confirmado significa **lead salvo no D1**. Não significa entrega ao CRM. O registro local recebe `crm_integration.status = "pending_spec"`; esse é um estado interno, não um campo ou contrato presumido do CRM. Não existe fila de entrega, tentativa de envio externo nem backfill automático nesta fase.

## Auditoria inicial e decisões

- TanStack Start com SSR no Cloudflare Worker, D1 por `dataStore.ts`/`kv.server.ts`, R2 e autenticação administrativa própria. Essa arquitetura foi mantida. Imports de implementação de servidor continuam dinâmicos dentro dos caminhos de servidor.
- O `TrackingInjector` anterior recriava scripts por rota e permitia GTM, GA4 direto, Meta, RD e scripts livres simultaneamente. Agora o contêiner é único por documento e as injeções diretas legadas estão desativadas. A verificação pública do Search Console foi preservada.
- O helper anterior enviava eventos por múltiplos caminhos e admitia metadados arbitrários. Agora só publica quatro eventos e parâmetros permitidos no dataLayer.
- Páginas de obrigado e ações de WhatsApp geravam leads sem novo recebimento. Esses disparos foram removidos. Recarregar uma página de obrigado não cria conversão.
- `dataStore.set` podia absorver uma falha e continuar o fluxo de sucesso. Os formulários finais agora usam `dataStore.submitLead`, que exige ACK válido do servidor e não grava cópia do lead final no cache local.
- O proxy público de webhook aceitava URL/payload do cliente. Ele agora responde HTTP 410 e não faz requisições externas. Os parâmetros antigos de tracking/webhook não são mais expostos pela leitura pública de settings.
- Não havia gestão de consentimento de analytics. Há agora preferências persistidas, escolhas separadas, recusa, revisão e revogação. Sessões/A/B próprios também respeitam analytics.
- O CTA flutuante usava UTMs internas que sobrescreviam a origem de aquisição. Agora usa `src=whatsapp_popup`; a campanha anterior permanece.

**Impacto operacional:** GA4 direto, pixel Meta, RD, scripts personalizados e webhook genérico configurados anteriormente no admin deixam de executar. Auditar as dependências existentes antes da publicação e migrar apenas tags aprovadas para o GTM. Não foi apagada nem modificada qualquer automação no CRM.

Durante o teste local com analytics permitido e publicidade recusada, o contêiner publicado carregou scripts com os IDs `G-PLR7C3ELVR` e `AW-18369444344`. São IDs **observados no DOM**, sem confirmação de propriedade, destino correto ou recebimento dos eventos. A presença do script Ads não comprova uma conversão ou armazenamento de cookies; exige revisão dos requisitos de consentimento das tags no GTM. Nenhuma configuração externa foi alterada.

## Contrato do dataLayer

| Evento           | Disparo                                                                          | Parâmetros específicos                         |
| ---------------- | -------------------------------------------------------------------------------- | ---------------------------------------------- |
| `page_view`      | Primeira página após consentimento e mudança de pathname da SPA                  | Contexto de página                             |
| `form_start`     | Primeira alteração relevante pelo usuário, uma vez por montagem do formulário    | `form_id`, `form_name`                         |
| `generate_lead`  | ACK `accepted: true` com recibo correspondente, depois da persistência           | `form_id`, `form_name`, `lead_channel: "form"` |
| `click_whatsapp` | Clique em link WhatsApp ou tentativa de abertura após formulário WhatsApp aceito | `link_type: "whatsapp"`                        |

Os nomes de formulário permitidos são `avaliacao`, `avaliacao-whatsapp`, `avaliacao-legacy`, `contato` e `pre-qualificacao`. Landing pages que reutilizam o formulário progressivo usam `avaliacao`.

Todos os eventos incluem `page_path`, `page_location`, `page_title` e `page_referrer`. O título é o caminho normalizado; referrer é vazio no analytics. Query strings e fragmentos não são enviados. Tokens de resultado são substituídos por `:token`, slugs dinâmicos por `:slug` e caminhos desconhecidos por `/other`. Rotas admin/auth/api são excluídas. Isso reduz a granularidade por artigo/landing page em troca de não expor identificadores de URLs. A lista em `safePage` deve ser revisada quando novas rotas públicas forem criadas.

Exemplo de evento produzido pelo aplicativo (não adicionar outro disparador equivalente):

```json
{
  "event": "generate_lead",
  "page_path": "/contato",
  "page_location": "https://statusimmigrationlaw.com.br/contato",
  "page_title": "/contato",
  "page_referrer": "",
  "form_id": "contato",
  "form_name": "contato",
  "lead_channel": "form",
  "link_type": null
}
```

Parâmetros não aplicáveis são explicitamente `null` para não herdar valores do evento anterior. Nome, e-mail, telefone, texto da mensagem, respostas, score, status de qualificação, ID do lead, token de resultado, UTMs e IDs de clique não entram nos eventos do aplicativo. As tags externas também precisam respeitar essa restrição: não ler campos/DOM/URL bruta nem ativar coleta automática de dados fornecidos pelo usuário.

`click_whatsapp` é intenção, inclusive quando o navegador bloqueia a abertura automática. Não comprova conversa. Os links `wa.me`, `api.whatsapp.com`, `web.whatsapp.com` e `whatsapp:` são capturados centralmente; não adicionar outro onClick que envie o mesmo evento. O CTA flutuante leva a um formulário interno e não conta como clique externo até a tentativa real de abrir o WhatsApp. A mensagem WhatsApp preexistente pode conter respostas/UTMs consentidas, mas esse conteúdo não vai para o dataLayer.

`qualify_lead` e `close_convert_lead` **não são emitidos**. O score local e a rota “obrigado qualificado” não representam qualificação comercial no CRM.

## Consentimento e atribuição

- Consentimento: `status_consent_v1` no localStorage, versão 1, validade 180 dias. Ausência, expiração ou formato inválido significam recusa. Sem storage disponível, fallback em memória no documento.
- Consent Mode: `analytics_storage`, `ad_storage`, `ad_user_data` e `ad_personalization` começam negados antes de inserir o GTM. Analytics libera medição; publicidade libera os três sinais de anúncios. A UI exige analytics para habilitar publicidade.
- O GTM só é inserido após analytics permitido. Não há iframe noscript que contorne a escolha. Eventos anteriores à escolha não são reproduzidos retroativamente.
- Revogar limpa a atribuição, caches de analytics próprios e cookies conhecidos de analytics/ads acessíveis por JavaScript. A página recarrega para descartar código já carregado. Preferências em outra aba também causam sincronização e recarga. Cookies de terceiros/HttpOnly não podem ser removidos pelo site.
- Atribuição: `status_attribution_v1`, validade fixa de 30 dias desde a primeira captura consentida. Preserva `first` e `last`, cada um com `params`, `landing_page`, `referrer` (somente origem externa) e `captured_at`.
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` exigem analytics. `gclid` e `fbclid` exigem também publicidade. Valores têm limite de 200 caracteres. Não colocar dados pessoais em UTMs.
- Navegação interna ou retorno direto não apagam a campanha anterior. Uma campanha diferente atualiza a última origem. Repetição dos mesmos parâmetros conserva o toque anterior. Se o visitante só consentir depois de sair da URL de campanha, a origem anterior não é recuperada.
- O backend valida o formato e a validade de consentimento/atribuição, remove atribuição sem analytics e IDs de clique sem publicidade. Dados vindos do navegador são contexto de marketing, não prova de origem autenticada.
- O lead recebe um snapshot com `conversion_page`, `form_id`, `lead_channel`, consentimento e atribuição. Campos locais `utm`/`origin` são mantidos por compatibilidade com o admin. Não há coleta de client_id/session_id do GA4 para conversões offline nesta fase.

A política de privacidade recebeu texto sobre as escolhas e os prazos locais. Os prazos de 180/30 dias não apagam automaticamente dados já recebidos no D1. A base legal e retenção de leads, recibos, rascunhos e dados do CRM precisam ser definidas pelo responsável. O salvamento parcial existente em `leads_partial` e os rascunhos locais continuam sendo funções do formulário; não são consentimento para publicidade. A pré-qualificação mantém o mecanismo existente de resultado público por token; quem possui o link pode acessar o resultado. Esses pontos devem integrar a revisão de privacidade/retention, sem alegação de certificação jurídica desta entrega.

## Recebimento no backend

Usa o endpoint **existente** `POST /api/kv`, com nova operação interna `submitLead`, chamada exclusivamente pelos componentes via `dataStore.submitLead(table, id, value, form)`. Não é endpoint do CRM.

Contrato tipado e validado em `src/lib/leadSubmission.ts`: `op`, `table`, `id`, `form`, `value`, `consent`, `attribution`, `conversion_page`. Aceita somente `leads` e `prequal_responses`, com correspondência de formulário/tabela. Valida nome, e-mail, telefone, campos obrigatórios e autorização de contato nos formulários que a possuem. Campos estranhos são descartados. A pré-qualificação é recalculada no servidor; o resultado enviado pelo cliente não é confiado.

Resposta de sucesso: HTTP 200, `data: { accepted: true, receipt: <id>, crm_status: "pending_spec" }`. Erros: 400 contrato/contexto, 403 permissão/origem, 413 corpo excessivo, 415 conteúdo não JSON, 422 campos, 409 reuso conflitante, 429 limite e 500 armazenamento. O cliente só mostra sucesso/dispara evento quando o ACK corresponde ao ID enviado. Erros inesperados registram apenas `[api/kv] storage_operation_failed`, sem corpo, contato, token ou exceção detalhada.

Proteções implementadas:

- JSON e limite de corpo de 32 KiB para visitante (1,9 MB para operações admin), inclusive corpo transmitido em partes; verificação de Origin quando presente.
- 20 tentativas com dados válidos por IP em janela fixa de 10 minutos, incluindo reenvios. Usa o IP fornecido pela Cloudflare, hash por janela e descarte oportunista de buckets vencidos; não armazena IP bruto nessa tabela. No ambiente local há fallback compartilhado. Não substitui WAF/Turnstile contra abuso distribuído.
- Recibo e registro inseridos em batch transacional D1. Um ID fica vinculado a hash do navegador, tabela e conteúdo validado. Repetir exatamente o envio retorna o mesmo sucesso sem outro registro; alterar dados ou dono retorna conflito.
- Cada formulário conserva um UUID durante a montagem e bloqueia envios simultâneos. A conversão analítica tem deduplicação adicional por recibo no documento; recibo não é enviado ao GA4.
- Escrita genérica anônima em `leads` e criação genérica de pré-qualificação ficam proibidas. Marcação de WhatsApp na pré-qualificação exige o navegador dono e não altera respostas.

Limites: recarregar/remontar um formulário cria outro UUID; isso não é deduplicação de contato por e-mail/telefone. Essa regra depende do CRM. A entrega analítica é best effort: bloqueador, ausência de consentimento, fechamento da página ou falha externa podem impedir GA4 mesmo com lead salvo. Não há garantia de exactly-once entre navegador e GA4. IDs de recibo e registros existentes não têm expiração automática; retenção e exclusão devem ser tratadas juntas.

## Configuração externa obrigatória — GTM/GA4

Antes do deploy, o responsável pelo contêiner deve revisar sua versão publicada e salvar uma versão recuperável:

1. Confirmar propriedade/fluxo GA4 correto. O ID observado `G-PLR7C3ELVR` não foi validado na conta. Não instalar outro snippet direto no site.
2. Configurar uma única Google tag e o envio manual dos quatro eventos. Criar variáveis Data Layer v2 para os parâmetros permitidos acima, e acionadores Custom Event com os nomes exatos. O evento `page_view` deve vir do dataLayer do app.
3. Desabilitar o page view automático da Google tag (`send_page_view: false`) e o page view por histórico/Enhanced Measurement para este fluxo. Remover acionadores redundantes History Change/All Pages para eventos equivalentes. Desabilitar a medição automática de formulários e cliques de saída que possa duplicar eventos ou capturar `link_url` com mensagens/tokens.
4. Mapear `page_location`, `page_title` e `page_referrer` com os valores sanitizados do dataLayer; não usar as variáveis nativas de URL/título brutos. Revisar também eventos automáticos que possam carregar URLs não sanitizadas, sobretudo em páginas de resultado.
5. Exigir analytics para GA4. Exigir os consentimentos de anúncios nas tags de publicidade, inclusive a tag Ads observada, com bloqueio adicional quando a política exigir ausência de requisições antes da escolha. As verificações embutidas de Consent Mode, sozinhas, não representam necessariamente bloqueio total de carregamento. Revisar HTML customizado e tags de terceiros.
6. Marcar `generate_lead` como evento principal de lead. `click_whatsapp` permanece microconversão. Não configurar regras que transformem obrigado, score ou clique em qualificação/venda.
7. Validar no Preview/Tag Assistant e GA4 DebugView: primeiro acesso, navegação SPA, voltar/avançar, recarga, query/hash, recusa, analytics sem anúncios, aceite total, revogação, erros e sucesso. Conferir requisições/cookies e ausência de PII. Uma instância do script não prova ausência de tags/eventos duplicados dentro do contêiner.
8. Definir filtro de desenvolvimento/hostname para não misturar localhost e produção, retenção GA4 e eventuais dimensões de formulário/canal. Não publicar alterações em anúncios/funis sem revisar seus impactos.

A escolha de page views manuais segue a documentação oficial de [page views GA4](https://developers.google.com/analytics/devguides/collection/ga4/views) e [SPA](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications). O fluxo de defaults/update segue a [documentação de consentimento Google](https://developers.google.com/tag-platform/security/guides/consent). A configuração efetiva da conta continua pendente.

## Integração CRM aguardada

Entregar `CRM_INTEGRATION_SPEC.md` com plataforma, pipeline/etapas reais, IDs dos campos, URLs da API, autenticação, payloads, regras de deduplicação, limites/erros, webhooks, integração WhatsApp e requisitos de privacidade. Incluir somente nomes/referências dos segredos, nunca seus valores.

Depois do contrato: implementar adaptador autenticado no servidor, mapeamento validado, fila/retries e estratégia de backfill dos registros pendentes; validar contatos e oportunidades no CRM. Definir autenticação/assinatura, proteção contra replay e IDs dos eventos de webhook. Somente então implementar `qualify_lead`/`close_convert_lead`, correlação consentida com analytics e eventual valor/moeda. Nada disso é simulado nesta entrega. A mensagem recebida pela integração WhatsApp, e não o clique do site, deverá originar o contato comercial desse canal.

## Testes e implantação

Executados localmente em 15/10/2026, com dados sintéticos:

- `npm run test:tracking`: 15 testes passando. Usa Node, transpile de TypeScript e SQLite em memória com as migrations reais; não usa CRM nem D1 remoto. Cobre recusa, primeira/última campanha, anúncios separados, revogação/expiração, armazenamento malformado, allowlist/PII, validação de todos os formulários, bloqueio de bypass, reenvio/conflito, rate limit, falhas de rede/banco/ACK/analytics e ocultação do webhook legado.
- `npx tsc --noEmit`: sem erros.
- ESLint nos módulos novos/reformulados de tracking, consentimento e recebimento: sem erros. `git diff --check`: sem problemas de whitespace. Não foi feita limpeza global de lint do projeto.
- `npm run build`: build de cliente e Worker validado; avisos preexistentes de plugin de paths e API de server function.
- `npm run db:migrate:local`: migrations 0001, 0002 e 0003 aplicadas ao D1 local. Nenhuma migração remota executada.
- Navegador local: formulário contato vazio bloqueado; mensagem sintética válida recebida com analytics recusado; GTM ausente antes da escolha; um script correto após aceite e após navegação SPA; revogação recarregou sem tags. Teste de backend cobre os demais formulários, mas seus fluxos visuais completos e GA4 DebugView continuam no roteiro de homologação.

Reprodução: usar Node com `node:sqlite` e `registerHooks` (Node 22.15+; execução desta entrega em 25.9), instalar pelo lockfile, migrar D1 local, executar os comandos acima e `npm run dev`. A suíte não usa dados de produção. A captura local da UI foi entregue no chat.

Ordem de publicação:

1. Revisar as alterações e configurar/validar o contêiner externo conforme este documento.
2. Antes de publicar o código, aplicar `npm run db:migrate:remote` no banco correto e confirmar `0003_lead_receipts.sql`. É aditiva; sem ela os novos envios falharão. Não apagar tabelas como rollback.
3. Dono do projeto faz commit e push pelo GitHub Desktop. Sugestão: `Instrumenta GTM com consentimento e recebimento validado de leads`. O push na branch de produção dispara Workers Builds.
4. Conferir o build/deploy Cloudflare e homologar um lead autorizado no domínio final, mais Preview/DebugView, consentimento e navegação. Monitorar 4xx/5xx e os recibos sem exportar PII para logs.
5. Entregar a especificação CRM para a etapa seguinte. Até lá os leads finais permanecem no D1 e o admin continua sendo o canal operacional.

Nenhum commit, push, deploy, migração de produção ou alteração de configuração externa foi realizado nesta entrega.
