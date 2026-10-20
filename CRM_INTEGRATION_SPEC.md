# CRM_INTEGRATION_SPEC — Status Immigration Law Firm

Contrato da integração **site → CRM** dos leads do formulário de triagem.
Qualquer mudança no envio, no payload ou nos nomes de campos precisa ser refletida aqui **e** no mapeamento do CRM (seção 6). Não renomear nem remover chaves do payload sem atualizar o CRM.

- **Status:** ativo em produção desde 16/10/2026 (primeiro evento confirmado no CRM: 16/10/2026 15:56).
- **Responsável técnico:** Lucas Martins (V4 / FariaTavares&CO).

---

## 1. Plataforma

| Item           | Valor                                                                             |
| -------------- | --------------------------------------------------------------------------------- |
| CRM            | CRM da V4 (Agente de IA + CRM) — painel `https://v4.sistemacrmcomia.com.br`       |
| Conta          | Status na América                                                                 |
| Recurso        | Webhook de **entrada** "Leads SITE" (id 166) — Configurações › Webhooks › Entrada |
| Fluxo acionado | "Lead do Site → CRM" (id 3955) — Fluxos                                           |

## 2. Endpoint

| Item              | Valor                                                                                |
| ----------------- | ------------------------------------------------------------------------------------ |
| URL               | `https://webhook.agendasistemacrm.com.br/api/v1/webhook-in/31Tr7r6Ausr2nCuOdZTFrZJJ` |
| Método            | `POST`                                                                               |
| Content-Type      | `application/json`                                                                   |
| Resposta esperada | HTTP 2xx. O corpo da resposta não é usado pelo site.                                 |

## 3. Autenticação

- **Atual:** o token no caminho da URL é o segredo. Tratar a URL como credencial: não expor no front-end, no GTM nem em repositório público.
- **Recomendado (próximo passo):**
  1. Mover a URL para variável de ambiente `CRM_WEBHOOK_URL`.
  2. Ativar no webhook do CRM a opção _Segurança › exigir header_ (`X-Webhook-Token`) e guardar o valor em `CRM_WEBHOOK_TOKEN`.
  3. Enviar o header em toda requisição.

## 4. Quando enviar (regras de disparo)

1. O envio acontece **no servidor** (handler de `/api/kv`, operação `submitLead`), **depois** que o lead foi gravado no D1 com sucesso.
2. Um envio por lead confirmado. Leads parciais (`leads_partial`) **não** são enviados.
3. O envio **não** depende de consentimento de cookies, do GTM nem do `dataLayer`. O `generate_lead` do `dataLayer` não leva dados pessoais e não deve ser usado para isso.
4. O envio não pode atrasar nem quebrar a resposta ao usuário: usar `context.waitUntil(...)` e capturar qualquer erro.
5. Falha no CRM **não** apaga nem invalida o lead no D1.

## 5. Payload

Evento único: `lead.created`. Todas as chaves são sempre enviadas; valor vazio = `""`.

| Chave                                                                 | Tipo           | Exemplo                              | Origem no site                                   |
| --------------------------------------------------------------------- | -------------- | ------------------------------------ | ------------------------------------------------ |
| `event`                                                               | string         | `lead.created`                       | fixo                                             |
| `id`                                                                  | string         | `lead_3e95…`                         | id do lead no D1                                 |
| `created_at`                                                          | ISO 8601       | `2026-10-16T18:56:34.189Z`           | `createdAt` do lead                              |
| `from_title`                                                          | string         | `Status Immigration Law Firm`        | fixo                                             |
| `nome`                                                                | string         | `Maria Souza`                        | campo `nome`                                     |
| `email`                                                               | string         | `maria@exemplo.com`                  | campo `email`                                    |
| `whatsapp`                                                            | string         | `(31) 99999-0000`                    | campo `whatsapp` (como digitado)                 |
| `whatsapp_e164`                                                       | string         | `5531999990000`                      | só dígitos; prefixa `55` se tiver até 11 dígitos |
| `objetivo_visto` / `objetivo_visto_label`                             | string         | `trabalhar` / `Trabalhar`            | campo `objetivo_visto`                           |
| `profissao` / `profissao_label`                                       | string         | `ti` / `Tecnologia / TI`             | campo `profissao`                                |
| `formacao` / `formacao_label`                                         | string         | `pos` / `Pós-graduação`              | campo `formacao`                                 |
| `faixa_etaria` / `faixa_etaria_label`                                 | string         | `30_39` / `30 a 39`                  | campo `faixaEtaria`                              |
| `renda` / `renda_label`                                               | string         | `20_40` / `R$ 20–40 mil`             | campo `renda`                                    |
| `momento` / `momento_label`                                           | string         | `proximos_1_2` / `Próximos 1–2 anos` | campo `momento`                                  |
| `segmento`                                                            | string         | `""`                                 | segmento da página, se houver                    |
| `score`                                                               | number \| `""` | `71`                                 | score local (não é qualificação comercial)       |
| `qualification`                                                       | string         | `qualificado` / `nao_qualificado`    | regra local do formulário                        |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` | string         | `google`                             | atribuição _last touch_ (cai para _first touch_) |
| `gclid`, `fbclid`                                                     | string         | `""`                                 | só quando há consentimento de marketing          |
| `referrer`                                                            | string         | `https://www.google.com`             | atribuição                                       |
| `landing_page`                                                        | string         | `/`                                  | atribuição                                       |
| `conversion_page`                                                     | string         | `/avaliacao`                         | página do envio                                  |

Os rótulos (`*_label`) vêm do mesmo dicionário usado no formulário (`objetivo_visto`, `profissao`, `formacao`, `faixaEtaria`, `renda`, `momento`). Ao criar uma nova opção no formulário, incluir o rótulo no envio também.

## 6. Como o CRM processa

**Webhook "Leads SITE" (id 166) › Mapeamento**

- Contato: Telefone ← `whatsapp_e164` (DDI Brasil) · Nome ← `nome` · E-mail ← `email`
- Variáveis disponíveis no fluxo: `nome`, `email`, `whatsapp`, `created_at`, `from_title`, `segmento`, `qualification`, `objetivo_visto`, `objetivo_visto_label`, `profissao_label`, `formacao_label`, `faixa_etaria`, `faixa_etaria_label`, `renda_label`, `momento_label`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `referrer`, `landing_page`

**Webhook › Fluxo:** Início → Iniciar Fluxo "Lead do Site → CRM" (reinicia sessão ativa).

**Fluxo "Lead do Site → CRM" (id 3955)** — ativo, gatilho apenas pela palavra-chave interna `#leadsite-interno` (não captura conversas comuns):

1. Criar negociação — funil **Triagem**, etapa **Novo Lead**, título `{{nome}} — Triagem do site`
2. Campos personalizados:
   - Cargo / Profissão (5550) ← `{{profissao_label}}`
   - Faixa de Renda Mensal (5551) ← `{{renda_label}}`
   - Visto de Interesse (5553) ← `{{objetivo_visto_label}}`
   - Formação e Tempo de Experiência (5554) ← `{{formacao_label}}`
   - Horizonte de Mudança para os EUA (5555) ← `{{momento_label}}`
   - Origem UTM / Campanha (5636) ← `{{utm_source}} / {{utm_medium}} / {{utm_campaign}}`
   - Já Preencheu Formulário da LP (5637) ← verdadeiro
3. Responsável: **David** (usuário 17649), responsável por todos os leads do site
4. Fonte: Landing Page - Formulário Longo (17308)
5. Mensagem de boas-vindas no WhatsApp em nome do David _(só é entregue com template aprovado pela Meta — ver abaixo)_
6. _(pendente)_ Aviso por e-mail ao escritório via Resend (bloco "E-mail: aviso de novo lead")

**Dependências críticas:**

- O fluxo precisa estar vinculado à conexão de WhatsApp ativa (hoje: API oficial `1526828448368230`, número +55 31 7338-6303). Sem conexão ativa ou sem vínculo, o evento aparece nos logs do webhook como `ignorado` e **nenhuma negociação é criada** (o contato é salvo, mas sem negociação).
- Na API oficial, a primeira mensagem para quem nunca falou com o número só é entregue como **template aprovado pela Meta**. Enquanto não houver template, a negociação é criada normalmente, mas a mensagem fica como "Janela de 24h expirada".
- Se houver leads `ignorado` nos logs, recuperar pelo **Importar (CSV)** do CRM, com `tipo = criar_negociacao`, funil Triagem / Novo Lead, `id_usuario = 17649` e `data_criacao` = data original do lead.

## 7. Duplicidade

| Situação                         | Comportamento                                                                                                                                                                           |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mesmo lead (mesmo `id`)          | O site envia uma única vez por lead confirmado. Não reenviar o mesmo `id`.                                                                                                              |
| Mesma pessoa preenche de novo    | Novo `id`, novo evento. O CRM identifica o contato pelo telefone (`whatsapp_e164`).                                                                                                     |
| Contato já tem negociação        | "Criar negociação" **não** cria outra: reaproveita a existente. Os campos personalizados são sobrescritos com as respostas mais recentes e a mensagem de boas-vindas é enviada de novo. |
| Telefone diferente, mesmo e-mail | Vira outro contato (a chave é o telefone).                                                                                                                                              |

## 8. Erros e reenvio

- **Atual:** uma tentativa. Falha (rede ou HTTP fora de 2xx) só gera log no servidor (`[crm] ...`).
- **Recomendado:**
  1. Gravar no lead do D1 `crm_status` (`sent` | `failed`) e `crm_sent_at`.
  2. Permitir reenvio manual pelo admin (`/admin/leads`) para os `failed`.
  3. Timeout de ~5 s na chamada.

## 9. LGPD

- Só são enviados dados que o próprio usuário preencheu no formulário e a atribuição de origem.
- `gclid` e `fbclid` só existem quando há consentimento de marketing (o site já remove sem consentimento).
- O aviso de privacidade do formulário deve mencionar que os dados vão para o CRM do escritório para retorno do atendimento.

## 10. Fora do escopo (próxima fase)

- `qualify_lead` e `close_convert_lead` **não** são enviados pelo site. Dependem de eventos autenticados do CRM, como os webhooks de **saída** "Nova Movimentação" e "Reunião Agendada", apontando para um endpoint autenticado do site, por exemplo `POST /api/crm-events`. Esse endpoint enviaria os eventos ao GA4 via Measurement Protocol.
- O score local não representa qualificação comercial.

## 11. Como testar

1. Preencher `/avaliacao?utm_source=teste&utm_medium=teste&utm_campaign=crm_webhook` com dados de teste (WhatsApp de alguém da equipe).
2. No CRM: Configurações › Webhooks › Leads SITE › **Logs** → o evento deve aparecer como `processado`.
3. Conferir no funil **Triagem › Novo Lead**: negociação, campos, responsável, fonte e a mensagem no WhatsApp.
4. Apagar o lead de teste no CRM e no `/admin/leads`.
