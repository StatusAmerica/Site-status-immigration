# CRM_INTEGRATION_SPEC — Status Immigration Law Firm

Data da inspeção: 15/10/2026 (America/Sao_Paulo).

**Estado: DIAGNÓSTICO PARCIAL AUTENTICADO; CONTRATO NÃO HOMOLOGADO. Não habilita a integração.**

O usuário concluiu o login em `https://v4.sistemacrmcomia.com.br/dashboard`. O painel **Agente de IA + CRM**, conta Lucas Martins, contém funis Status na América. Configurações exibem **Modo visualização** e controles de edição/conexão desabilitados. Nenhum campo, funil, contato ou automação foi alterado. IDs reais obtidos da interface constam abaixo; tenant e schema de API ainda precisam de confirmação; a aceitação dos IDs de etapas pela API não foi testada.

Este documento distingue fatos verificados no código local, requisitos do briefing e informações ainda dependentes do CRM. A existência deste arquivo **não** autoriza remover `pending_spec` nem ativar o envio externo. Concluir o inventário autenticado e a homologação antes de utilizá-lo como contrato definitivo.

## 1. Fontes e limites da inspeção

| Fonte | Evidência | Limite |
| --- | --- | --- |
| CRM indicado pelo usuário | Sessão autenticada; Configurações, Automações e Conexão inspecionadas | Modo visualização; inventário e homologação incompletos |
| Briefing GTM + GA4 + CRM fornecido | Campos, eventos e automações desejados | Requisitos, não configuração efetiva |
| `src/lib/leadSubmission.server.ts` | Persistência D1; canal `form`; estado `pending_spec` | Inspeção de código, não execução em produção |
| `src/lib/leadSubmission.ts` | Contrato validado de recebimento dos formulários | Não é o schema da API do CRM |
| `src/lib/leadWebhook.ts` | Envio externo desativado; teste informa integração pendente | Não comprova qualquer entrega ao CRM |
| `src/routes/api/public/lead-webhook.ts` | POST legado responde 410 | Não reutilizar como proxy público |
| `src/lib/attribution.ts`, `src/lib/tracking.ts` | Atribuição primeira/última origem; eventos permitidos | Configuração externa GTM/GA4 não inspecionada |
| `src/lib/whatsapp.ts` | Links `wa.me` com texto preenchido e número de settings | Não comprova integração de mensagens recebidas |
| `docs/GTM-GA4-CRM.md` | Histórico da instrumentação e testes anteriores | Resultados anteriores não foram reexecutados nesta auditoria |

Nenhuma credencial, cookie, chave privada, token de acesso ou dado de contato real deve ser incluído neste arquivo.

## 2. Inventário do CRM — evidências autenticadas

| Item | Estado / identificação real |
| --- | --- |
| Nome comercial / fornecedor / versão | Não confirmado; título visível: Agente de IA + CRM |
| Organização / workspace / tenant Status | Funis Status na América identificados; tenant ID não exposto |
| Perfil e permissões da conta | Lucas Martins; Configurações em Modo visualização |
| Contatos: volume, campos obrigatórios, duplicados, arquivados | Página mostra nenhum contato cadastrado nesta sessão; não permite auditar duplicação ou inferir total global |
| Funis existentes: nomes, IDs, finalidade e volume | Quatro funis; IDs e quantidade de etapas abaixo; volumes pendentes |
| Funil selecionado e ID | Triagem 10205 é o padrão atual; destino da nova integração ainda não homologado |
| Etapas: nomes, IDs, ordem, estados de ganho/perda | 27 etapas dos quatro funis mapeadas na UI; estados nativos de encerramento pendentes |
| Proprietários, equipes e regra de distribuição | Fluxo 2030 atribui a Rafael Patrick; ID do usuário e catálogo de equipes pendentes |
| Campos personalizados e IDs | Onze campos existentes inventariados; nenhum criado |
| Automações: IDs, status, gatilhos, filtros, ações, histórico | Regra de conversão e tarefa ativas; histórico observado; IDs não expostos |
| Integrações nativas / conectores | Catálogo de captação e webhook genérico; Conectar desabilitado |
| API: base URL, versão e documentação oficial | Não verificadas |
| Autenticação de integração / escopos / expiração | Não verificados; login de UI não comprova autenticação de API |
| Webhooks: eventos, assinatura, retries e ordenação | Não verificados |
| WhatsApp: provedor, canal, ID, conexão e roteamento | Uma conexão Comercialvihij, rótulo v2, status ATIVO; provedor e IDs técnicos não expostos; roteamento não homologado |
| Ambiente de testes / modo sem envio de mensagens | Não identificado |

Registrar IDs a partir da interface, documentação/exportação autorizada ou API suportada. Se a interface não expuser IDs, registrar a limitação e obter o catálogo oficial; não inferir IDs pelo índice visual de uma etapa.

### 2.1. Funis e fontes reais

| ID do funil | Nome | Etapas |
| --- | --- | --- |
| 9967 | EB-2 NIW \| Status na América | 9 |
| 9975 | EB-1 \| Habilidade Extraordinária | 7 |
| 9976 | O-1 \| Habilidade Extraordinária | 7 |
| 10205 | Triagem — Padrão | 4 |

| ID da fonte | Nome |
| --- | --- |
| 17276 | Meta Ads |
| 17277 | Google Ads - Search |
| 17278 | Google Ads - YouTube |
| 17279 | Indicação |
| 17280 | Instagram Orgânico |
| 17281 | Site / SEO |
| 17308 | Landing Page - Formulário Longo |
| 17309 | WhatsApp Direto |

A coluna SOURCE está sem valor nas fontes. Canal form não significa necessariamente fonte 17308: formulário longo, contato e pré-qualificação precisam de mapeamento explícito. A fonte comercial não substitui UTMs.

### 2.2. Campos personalizados reais

| ID | Nome | Tipo |
| --- | --- | --- |
| 5550 | Cargo / Profissão | Texto |
| 5551 | Faixa de Renda Mensal | Texto |
| 5552 | Cidade e Estado (onde mora hoje) | Texto |
| 5553 | Visto de Interesse | Texto |
| 5554 | Formação e Tempo de Experiência | Texto |
| 5555 | Horizonte de Mudança para os EUA | Texto |
| 5556 | Tamanho da Família (cônjuge/filhos) | Texto |
| 5557 | Já possui processo imigratório em andamento | Verdadeiro/Falso |
| 5635 | Motivador Principal | Texto |
| 5636 | Origem UTM / Campanha | Texto |
| 5637 | Já Preencheu Formulário da LP | Verdadeiro/Falso |

O campo agregado 5636 não oferece separação primeira/última origem nem cada UTM. Preservá-lo; os campos individuais da seção 4 não aparecem na lista inspecionada. A interface menciona preenchimento por IA conforme conversa: excluir campos técnicos desse preenchimento ao configurar a integração, se houver esse controle. Entidade, comprimento e representação de campos na API ainda não verificados.

### 2.3. Automações e integrações existentes

- Conversão: uma regra ativa, **Detectar interesse em agendar conversa**, prioridade 1, três palavras combinadas por OR, escopo Toda a conversa. Move para **9967 / Reunião agendada**, sem marcadores. Etapa 68423; ID da regra e duas das palavras não expostos; `agendar` consta no histórico.
- Histórico: em **21/09/2026 14:52:28**, pontuação 1 para `agendar`, ação de mover para Reunião agendada. Em **18/09/2026 10:41:04**, pontuação 1, Regra ativada. Horários conforme UI, fuso da UI não confirmado. São evidências históricas, não testes executados nesta tarefa.
- Tarefa ativa **Notificar equipe humana ao entrar em Agendado**: gatilho EB-2 NIW → Reunião agendada, vencimento Mesmo dia, responsável da negociação, modelo **Escalonamento Humano - Status na América**, com uma subtarefa. Modelo orienta atendimento humano para questões específicas/irritação/processo anterior. Entrega de notificação não comprovada.
- Revisão operacional necessária: intenção de agendar pode ser diferente de reunião confirmada; o modelo de escalonamento também pode não corresponder a toda reunião. Não alterar regra ou etapa sem avaliação do impacto.
- Movimentação por inatividade: zero regras.
- Conversas: Criar negociação automaticamente e Reabrir conversa automaticamente desligados. Portanto não presumir criação de oportunidade por qualquer inbound. Transcrição de áudio ligada.
- Eventos Google: conexão de conta Google Ads pendente; abas de automações/histórico desabilitadas. Não comprova integração GA4.
- Eventos Facebook: configuração de Pixel pendente; automações/histórico desabilitados. Texto de modo produção não comprova envio efetivo. Nenhum token acessado.
- Formulário META: nenhum formulário disponível; interface orienta conexão da página em Conexão → Formulário Instantâneo.
- Rastreamento nativo: nenhum pixel e nenhum link de WhatsApp criados; contadores de cliques/identificados exibem zero. É módulo separado do GTM do site.
- Captação oferece Typeform, Respondi, RD Station Marketing, Elementor Pro, Google Forms, LinkedIn Lead Gen e Leads por E-mail. Personalizado oferece **Outro sistema**, para webhooks com mapeamento de telefone, nome e evento. São capacidades do catálogo, não integrações ativas comprovadas; botão Conectar desabilitado.
- WhatsApp em Conexão: **1 de 1**, **Comercialvihij**, rótulo **v2**, **ATIVO**, número terminado em **6303**. O rótulo v2 não identifica fornecedor nem prova uso da API oficial. Não houve reconexão ou teste de mensagens.

Contatos: a página mostra “Ainda não existem contatos cadastrados”, apesar de contatos referenciados no histórico de conversão. Verificar escopo/permissões e eventual arquivamento com administrador; não inferir exclusão, perda de dados ou ausência global de contatos. Duplicação, campos obrigatórios e total global não puderam ser auditados. Detalhes de Follow-Up/Agente de IA e IDs de responsáveis permanecem pendentes.

### Fluxos de atendimento

Após o carregamento completo, a página `/fluxos` mostra **Modo: Fluxos**, **Fluxos ativos**, mensagens no motor de fluxos e **Agente IA pausado**. O estado inicial durante o carregamento não foi usado como evidência final. Nenhum seletor foi alterado.

| Fluxo | ID real | Estado | Gatilho listado | Blocos | Conversas exibidas | WhatsApps vinculados |
| --- | --- | --- | --- | --- | --- | --- |
| Atendimento inicial | 2030 (URL do editor) | Ativo | Padrão | 6 | 251 | 1 |
| Qualificação EB-2 NIW | Não inspecionado | Inativo | Padrão | 11 | 1 | 1 |

No editor do fluxo 2030, foram observados início, espera de 2 segundos, mensagem de saudação, aplicação da tag SITE, mudança para Triagem → Novo Lead (10205/70434) e atribuição ao SDR Rafael Patrick. O ID do responsável não foi exposto. O texto se apresenta como empresa preparadora de documentos imigratórios; revisar alinhamento com a comunicação do site com o responsável comercial, sem alteração nesta auditoria.

O editor oferece salvamento automático, publicação, logs, relatórios e simulação sem WhatsApp real. Nenhum bloco foi editado, publicado ou simulado. Os contadores não comprovam entrega de mensagem, criação de negociação ou sucesso em cada bloco. A atribuição incondicional de tag SITE e responsável exige revisão antes de encaminhar novas origens ao gatilho Padrão. Criar negociação automaticamente está desligado nas configurações; o efeito de Mudar etapa sobre contatos sem negociação ainda precisa ser testado.

Trocar o modo global entre Fluxos e Agente IA ou alterar o fluxo ativo afeta o atendimento existente e exige aprovação de impacto, conforme pedido do usuário. A restrição Modo visualização foi observada em Configurações; não se presume que todos os módulos tenham a mesma permissão só porque o editor mostra controles.

### 2.4. Etapas verificadas no quadro

IDs expostos nos contêineres `stage-*` do quadro, em ordem visual. Confirmar aceitação desses IDs no contrato da API antes do envio.

| Funil | ID da etapa | Nome |
| --- | --- | --- |
| 10205 | 70434 | Novo Lead |
| 10205 | 70436 | Em Qualificação |
| 10205 | 70438 | Perdido |
| 10205 | 82533 | Agendado |
| 9967 | 68420 | Novo lead |
| 9967 | 68421 | Em qualificação (IA) |
| 9967 | 68798 | Qualificado - MQL |
| 9967 | 68422 | Nutrição |
| 9967 | 68424 | Em Negociação |
| 9967 | 68423 | Reunião agendada |
| 9967 | 68799 | Reunião realizada |
| 9967 | 68425 | Cliente |
| 9967 | 68426 | Desqualificado |
| 9975 | 68487 | Entrada |
| 9975 | 68488 | Qualificação |
| 9975 | 68492 | Educação/Nutrição |
| 9975 | 68489 | Agendado |
| 9975 | 68490 | Em Negociação |
| 9975 | 68491 | Perdido/Fora de Perfil |
| 9975 | 68493 | Ganho |
| 9976 | 68494 | Entrada |
| 9976 | 68495 | Qualificação |
| 9976 | 68496 | Educação/Nutrição |
| 9976 | 68497 | Agendado |
| 9976 | 68498 | Em Negociação |
| 9976 | 68499 | Ganho |
| 9976 | 68500 | Perdido/Fora de Perfil |

Os quatro quadros inspecionados exibem zero negócios no filtro **criadas ou movidas de 16/09 a 15/10/2026**. Não representa total histórico. Agendado da Triagem não é a etapa Reunião agendada do EB-2: não intercambiar IDs.

EB-2 também exibe zero no mesmo filtro. A ordem visual coloca Em Negociação antes de Reunião agendada; preservada. Qualificado - MQL é candidato a evento de qualificação, e Cliente a ganho, mas esses rótulos não provam encerramento nativo nem autorizam conversões. Validar com o responsável comercial.

## 3. Origem dos dados no site — verificado no repositório

O site usa TanStack Start e Cloudflare Workers/D1. A entrada é `POST /api/kv`, operação `submitLead`; acesso a dados pelo `dataStore`. Isso é um endpoint **do site**, não do CRM.

| Identificador existente | Uso |
| --- | --- |
| `leads` | Avaliação e formulário de contato |
| `prequal_responses` | Pré-qualificação; identificação em `answers` |
| `avaliacao`, `avaliacao-whatsapp`, `avaliacao-legacy`, `contato`, `pre-qualificacao` | IDs de formulário aceitos pelo backend |
| `id` | Identificador/recibo de envio; não é contact ID do CRM |
| `crm_integration.status = "pending_spec"` | Lead salvo localmente, sem tentativa de entrega externa |
| `GTM-5ZFTCPP6` | Contêiner definido no briefing e documentação local |

Nome/e-mail/telefone vêm de `nome`, `email`, `whatsapp` em `leads`, ou de `answers.fullName`, `answers.email`, `answers.whatsapp` em `prequal_responses`. `createdAt`, `form_id`, `lead_channel`, `conversion_page`, `consent` e `attribution` ficam no registro. O backend define `status = "novo"` e `lead_channel = "form"`, inclusive no formulário `avaliacao-whatsapp`.

O ACK `accepted: true` confirma persistência local. Não confirma contato ou oportunidade no CRM. Não existe fila de entrega/backfill implementada nesse fluxo. O recibo evita reenvio idêntico dentro de seu contexto; não deduplica pessoas por telefone/e-mail.

O helper legado `buildLeadWebhookPayload` inclui `lead_raw`; não o adotar como contrato de CRM nem transmitir o objeto completo sem mapear os campos necessários.

## 4. Campos de atribuição — mapeamento proposto, ainda não aplicado

Todos os IDs de destino abaixo estão **pendentes**. Antes de criar campos, verificar equivalentes nativos e personalizados, tipos, comprimento, entidade (contato/oportunidade) e permissões de escrita. Reutilizar equivalentes compatíveis.

| Campo lógico do briefing | Fonte local / regra | Tipo proposto | ID real CRM |
| --- | --- | --- | --- |
| `utm_source` | `attribution.last.params.utm_source` | Texto até 200 | Pendente |
| `utm_medium` | `attribution.last.params.utm_medium` | Texto até 200 | Pendente |
| `utm_campaign` | `attribution.last.params.utm_campaign` | Texto até 200 | Pendente |
| `utm_content` | `attribution.last.params.utm_content` | Texto até 200 | Pendente |
| `utm_term` | `attribution.last.params.utm_term` | Texto até 200 | Pendente |
| `gclid` | `attribution.last.params.gclid`; só com marketing permitido | Texto até 200 | Pendente |
| `fbclid` | `attribution.last.params.fbclid`; só com marketing permitido | Texto até 200 | Pendente |
| `landing_page` | `attribution.first.landing_page` | Caminho sanitizado até 300 | Pendente |
| `conversion_page` | `conversion_page` | Caminho sanitizado até 300 | Pendente |
| `lead_channel` | `form` no recebimento local; `whatsapp` só em mensagem real | Enum | Pendente |
| `lead_status` | Estado comercial do CRM; `novo` local não é estágio CRM | Enum / campo nativo | Pendente |
| `created_at` | `createdAt` do site; preservar separadamente da criação no CRM | Data UTC ISO 8601 | Pendente |

Preservar primeira e última atribuição separadas, quando suportado: `first_utm_*`, `last_utm_*`, `first_gclid`, `last_gclid`, `first_fbclid`, `last_fbclid`, `first_landing_page`, `last_landing_page`, `first_captured_at`, `last_captured_at`. São nomes lógicos propostos, não nomes confirmados de API.

Campos auxiliares a avaliar: referência externa do envio, formulário, consentimento de analytics/marketing com versão/data, data de qualificação e ID da integração. Não criar um campo obrigatório global que impeça cadastros de outros canais.

Primeira origem do contato não deve ser sobrescrita a cada retorno. Cada oportunidade deve manter seu snapshot de aquisição. A última origem deve considerar a data do toque, inclusive em processamento fora de ordem; retorno direto e valores ausentes não apagam uma origem conhecida. Definir separadamente o processo de exclusão/revogação de dados já persistidos.

As URLs locais são caminhos sanitizados, sem query/hash e com slugs/tokens mascarados. Não prometer granularidade de landing page que o registro não contém. A captura de UTMs depende de analytics; IDs de clique dependem também de marketing. Os prazos locais são 30 dias de atribuição e 180 dias de consentimento; não representam retenção automática no CRM.

## 5. Funil e automações — requisitos ainda não configurados

### 5.1. Fluxo solicitado: Leads do site — Status Immigration

Escopo confirmado pelo usuário: captação de `https://statusimmigrationlaw.com.br/`. Em 15/10/2026 a home publicada apresenta links para `/avaliacao`, `/pre-qualificacao`, `/contato` e `/avaliacao/whatsapp`. Nenhum formulário de produção foi submetido nesta inspeção. O usuário informou que entrará com acesso de edição; a mudança de permissão ainda não foi verificada.

**Estado: desenho de configuração, ainda não criado nem ativado no CRM.** Nome proposto: **Leads do site — Status Immigration**. O processamento do formulário deve começar após recebimento válido no servidor, mesmo se o visitante não abrir o WhatsApp.

1. Receber o envio persistido pelo site por integração autenticada. Usar recibo como referência externa; não confiar apenas em texto digitado na conversa para classificar a origem.
2. Buscar contato por referência/telefone normalizado/e-mail, conforme suporte confirmado do CRM. Conflitos de identidade vão para revisão. Atualizar somente os campos recebidos e permitidos.
3. Procurar oportunidade em andamento compatível. Preservar etapa e responsável existentes. Para lead novo sem oportunidade compatível, criar em **Triagem 10205 → Novo Lead 70434**.
4. Identificar como captação do site e gravar formulário, data, página e atribuição consentida. Reutilizar a tag SITE somente após confirmar seu ID e sem remover outras tags. Manter origem de campanha separada do canal `form`.
5. Para oportunidade nova, usar o atendimento de Rafael Patrick observado no fluxo 2030 como proposta de distribuição; confirmar seu ID e disponibilidade. Não transferir oportunidades em andamento automaticamente.
6. Criar uma tarefa interna de primeiro atendimento, associada à oportunidade e ao responsável, sem duplicá-la em retentativas. Modelo e prazo precisam ser definidos no editor antes da ativação. A promessa de retorno publicada no site é de até 48h; não configurar prazo maior sem revisão comercial.
7. Se o visitante enviar mensagem pelo WhatsApp, associar a conversa ao contato/oportunidade já criados. Revisar a interação com o fluxo 2030 para não repetir saudação, resetar etapa ou sobrescrever responsável.

| Entrada | Identificador local | Condição de entrada | Origem proposta |
| --- | --- | --- | --- |
| Avaliação completa | `avaliacao` | Formulário recebido e persistido | Fonte 17308 somente se confirmado como formulário longo |
| Avaliação antes do WhatsApp | `avaliacao-whatsapp` | Formulário recebido, mesmo sem mensagem posterior | Canal `form`; guardar distinção do formulário |
| Pré-qualificação | `pre-qualificacao` | Envio com identificação persistido; não mero resultado anônimo | Canal `form`; não transformar score em qualificação comercial |
| Contato | `contato` | Formulário recebido e persistido | Canal `form`; fonte conforme atribuição e regra comercial |
| Formulário legado | `avaliacao-legacy` | Somente se ainda houver uso publicado | Compatibilidade; não reprocessar histórico automaticamente |

Não atribuir Site / SEO 17281 a todo envio: um visitante de anúncio também preenche formulário no site. Sem atribuição, registrar origem desconhecida, sem inventar campanha ou tráfego orgânico. O campo 5637 deve representar o formulário de LP correspondente, não qualquer contato.

O módulo Fluxos atualmente inspecionado opera conversas de WhatsApp; ainda não há evidência de que um formulário recebido dispare esse motor. Validar o conector **Configurações → Integrações → Personalizado → Outro sistema** e suas ações antes de escolher entre integração nativa e adaptador no backend. Criar apenas um chatbot no módulo Fluxos não conclui a conexão site → CRM.

Critério mínimo de aceite: um envio controlado gera um único contato e oportunidade, com origem e responsável corretos; repetir o envio não duplica; uma conversa posterior se associa ao mesmo registro; oportunidade preexistente mantém etapa/responsável. Teste sem mensagens a leads reais e sem disparos históricos. A ativação depende de contrato real, revisão dos efeitos no fluxo 2030 e homologação.

Preservar os quatro funis inventariados e homologar o mapeamento das etapas para as funções abaixo. Não renomear, mover negócios ou criar um novo funil sem avaliar a operação. Um novo funil depende da aprovação indicada no briefing.

| Função de referência | Nome / ID real no funil selecionado |
| --- | --- |
| Novo lead | Triagem 10205 / Novo Lead 70434; candidato para entrada, homologação pendente |
| Primeiro contato | Pendente |
| Em qualificação | Triagem 10205 / Em Qualificação 70436 |
| Lead qualificado | EB-2 9967 / Qualificado - MQL 68798; validar critério comercial |
| Proposta enviada | Pendente |
| Negociação | EB-2 9967 / Em Negociação 68424 |
| Ganho | Candidato EB-2 9967 / Cliente 68425; verificar estado nativo e critério |
| Perdido | Triagem 10205 / Perdido 70438; semântica de encerramento ainda não homologada |

| Automação | Comportamento requerido | Situação |
| --- | --- | --- |
| A — Formulário | Após persistência, localizar/criar contato, associar oportunidade, gravar origem, distribuir conforme regra existente e notificar se disponível | Não configurada nem testada |
| B — WhatsApp | Mensagem recebida autenticada, deduplicação por evento, contato/conversa/oportunidade associados e encaminhamento ao atendimento | Não configurada nem testada |
| C — Qualificação | Transição comercial real, data/estado registrados; `qualify_lead` somente após integração de mensuração validada | Não configurada nem testada |
| D — Venda | Ganho real, data, valor/moeda quando existentes e origem preservada; conversão externa só após validação | Não configurada nem testada |

A qualificação calculada pelo formulário não equivale à decisão comercial no CRM. O fluxo não deve decidir automaticamente elegibilidade jurídica com base no score local.

Antes de ativar A–D, identificar automações concorrentes, filtros de canal, reentrada, notificações, mensagens e efeitos retroativos. A captação nova deve ter escopo explícito, sem reprocessar automaticamente a base histórica. Disparos a pessoas reais e mudanças de alto impacto exigem revisão concreta e aprovação conforme pedido do usuário.

## 6. API e exemplos de payload

**Não há endpoint de API CRM, método de autenticação, schema de criação/atualização ou resposta homologado. Não implementar requisições contra URLs presumidas.**

Exemplo de **plano interno de mapeamento**, não payload aceito pelo CRM. Os IDs são reais da UI; o roteamento é candidato para um formulário longo, não uma regra ativa. `null` significa pendência neste documento e não deve ser transmitido à API.

```json
{
  "schema": "internal-mapping-proposal-v1",
  "enabled": false,
  "pipeline_id": 10205,
  "stage_id": 70434,
  "source_id": 17308,
  "existing_field_ids": {
    "legacy_origin_summary": 5636,
    "lp_form_completed": 5637
  },
  "attribution_field_ids": null,
  "crm_endpoint": null
}
```

| Operação necessária | Método / endpoint / schema real |
| --- | --- |
| Listar funis, etapas, responsáveis e campos | Pendente |
| Buscar contato por referência externa, telefone ou e-mail | Pendente |
| Criar contato e obter seu ID | Pendente |
| Atualizar campos específicos sem apagar os demais | Pendente |
| Buscar, criar e atualizar oportunidade | Pendente |
| Associar contato, conversa e oportunidade | Pendente |
| Consultar/criar webhook e validar assinatura | Pendente |

O exemplo abaixo é **somente entrada do site**, derivada do schema local. Usa dados sintéticos; não foi enviado ao CRM nem representa payload de sua API. O telefone não é destino autorizado para mensagens. Datas são ilustrativas e devem ser atuais em um teste real.

```json
{
  "op": "submitLead",
  "table": "leads",
  "id": "crm-audit-fixture-20261015-001",
  "form": "contato",
  "value": {
    "nome": "Teste Integração",
    "email": "crm-audit@example.invalid",
    "whatsapp": "+12025550123",
    "mensagem": "Registro sintético para homologação sem envio de mensagens.",
    "consent": true
  },
  "consent": {
    "analytics": true,
    "marketing": false,
    "version": 1,
    "updatedAt": "2026-10-15T12:00:00.000Z"
  },
  "attribution": {
    "first": {
      "params": { "utm_source": "qa", "utm_medium": "test", "utm_campaign": "crm_homologacao" },
      "landing_page": "/contato",
      "referrer": "",
      "captured_at": "2026-10-15T12:00:00.000Z"
    },
    "last": {
      "params": { "utm_source": "qa", "utm_medium": "test", "utm_campaign": "crm_homologacao" },
      "landing_page": "/contato",
      "referrer": "",
      "captured_at": "2026-10-15T12:00:00.000Z"
    },
    "expires_at": 1794657600000
  },
  "conversion_page": "/contato"
}
```

Resposta de sucesso definida no código local:

```json
{
  "data": {
    "accepted": true,
    "receipt": "crm-audit-fixture-20261015-001",
    "crm_status": "pending_spec"
  }
}
```

Completar esta seção com exemplos reais de **criação e atualização de contato e oportunidade**, contendo IDs confirmados de campo/funil/etapa, dados sintéticos, status HTTP e resposta sanitizada. Incluir semântica de campos omitidos versus `null`, paginação, obrigatoriedade, limites e concorrência. Não oferecer exemplos executáveis de CRM enquanto isso permanecer desconhecido.

## 7. Deduplicação e entrega — proposta a homologar

1. Distinguir idempotência do envio, identidade do contato e unicidade da oportunidade. Guardar a associação entre recibo local e IDs remotos.
2. Preferir referência externa estável, se suportada. Normalizar telefone com país explícito e e-mail com trim; confirmar a regra de comparação do CRM. Não confiar apenas no nome.
3. Se telefone e e-mail apontarem para contatos diferentes, registrar conflito para revisão; não fundir automaticamente nem sobrescrever dados.
4. Reenvio do mesmo recibo deve recuperar o mesmo contato/oportunidade. Novos formulários da mesma pessoa devem respeitar a regra comercial de oportunidade aberta; não reabrir negócios ganhos/perdidos automaticamente.
5. Preservar responsável e etapa de oportunidades em andamento. Escopo de uma eventual nova oportunidade depende do funil/produto identificado.
6. Implementar persistência de fila e retentativas no backend em fase posterior. Um timeout após criação remota tem resultado ambíguo: reconciliar por chave/consulta antes de criar novamente. Serializar operações concorrentes para a mesma identidade quando necessário.
7. Planejar backfill dos `pending_spec` como operação separada, com volume, janela, deduplicação, controle de notificações e aprovação quando houver alto impacto.

**Erros e limites CRM: desconhecidos.** Política candidata, a ajustar ao contrato real: interromper em 401/403 e alertar sem segredos; tratar erros de validação sem repetição cega; reconciliar conflitos; respeitar `Retry-After` em 429; backoff com jitter para falhas transitórias; limite de tentativas e revisão de falhas persistentes. Não assumir suporte a header de idempotência.

Os códigos 400/403/409/413/415/422/429/500 e o limite de 20 tentativas válidas por IP/10 minutos descritos em `docs/GTM-GA4-CRM.md` pertencem ao **site**, não ao CRM.

## 8. WhatsApp, webhooks e conversões

O site monta links `wa.me` a partir de `settings.whatsapp_br`, com fallback local. Texto pré-preenchido pode incluir dados do formulário. O CRM mostra uma conexão ativa com número terminado em 6303; a correspondência com o número publicado no site, o provedor e o uso de integração oficial/compatível ainda não foram homologados.

`click_whatsapp` mede o clique/tentativa de abertura, não mensagem recebida. Formulário anterior ao WhatsApp continua `form`; uma conversa posterior deve se associar ao contato existente sem duplicar indevidamente a oportunidade. Não há garantia de atribuir UTMs a uma conversa só porque houve clique; validar mecanismo real de correlação, sem incluir PII em analytics.

Para homologar WhatsApp, registrar provedor, conta/canal e IDs não secretos, estado da conexão, direção inbound, identificador da mensagem, associação ao contato e logs sanitizados. Usar remetente de teste autorizado; não enviar mensagens a leads reais. Examinar respostas automáticas antes de qualquer teste inbound.

Para qualificação/venda, registrar nomes exatos de eventos de webhook, IDs de origem, payload, assinatura/autenticação, política de retries e proteção contra replay. Deduplicar por ID do evento e transição comercial; prever reentrada e eventos fora de ordem. Nenhum endpoint receptor foi configurado nesta tarefa.

O site não coleta `client_id`/`session_id` GA4 nesse fluxo. A correlação para mensuração comercial precisa de definição técnica e consentimento antes de habilitar `qualify_lead` e `close_convert_lead`. Nenhum evento comercial foi enviado.

## 9. Segurança e operação

- Integração somente no backend; não usar GTM para enviar PII ao CRM.
- Segredos apenas no gerenciador de segredos/Cloudflare Worker. Nomes candidatos: `CRM_API_TOKEN` ou credenciais OAuth equivalentes, e `CRM_WEBHOOK_SECRET`, conforme autenticação efetivamente suportada. Não são variáveis implementadas nem evidência de suporte a Bearer/HMAC.
- Configuração não secreta deverá incluir base URL verificada, tenant, pipeline, etapas e mapeamento de campos. Não registrar URL contendo credencial.
- Não copiar cookies de sessão para automação de servidor. Novas credenciais, permissões ou escopos devem ser avaliados antes da criação.
- Logs: identificador técnico de correlação, operação, status, tentativa e horário; sem payload integral, contato, mensagem, token ou assinatura.
- Validar formato, comprimento, consentimento e destino dos dados. Não enviar campos jurídicos/financeiros do perfil apenas porque existem em `lead_raw`.
- Definir retenção, exclusão, revogação e acesso com o responsável pela operação. Esta especificação não certifica conformidade jurídica.
- Sem commit/push pelo agente; publicação via dono no GitHub Desktop. Não alterar infraestrutura nem reintroduzir dependências removidas.

## 10. Validação e critérios de aceite

| Teste | Evidência exigida | Resultado desta inspeção |
| --- | --- | --- |
| Acesso à URL | Página carregada | Sessão autenticada acessível |
| Organização correta | Nome/ID Status no painel | Funis Status na América; tenant ID pendente |
| Inventário | Funis, campos, contatos e automações com IDs e escopo | Parcial; seção 2 |
| Regra de agendamento existente | Histórico de execução | Dois registros de setembro; um confirma movimentação histórica, sem teste novo |
| Conexão WhatsApp | Estado no painel | ATIVO; não comprova entrega/recebimento fim a fim |
| Criação de campos | Persistência e leitura de volta por UI/API | Não executado |
| Novo formulário | Recibo local + contact ID + opportunity ID + campos de origem | Não executado |
| Reenvio e concorrência | Mesmo contato/oportunidade, sem duplicação | Não executado |
| Atualização | Campos novos aplicados; origem inicial e dados operacionais preservados | Não executado |
| Recusa / analytics / marketing | Atribuição e IDs de clique respeitam a escolha | Não executado nesta auditoria |
| Erro/timeout/rate limit | Retentativa ou falha controlada sem duplicação | Não executado |
| WhatsApp inbound | Evento real, conversa associada e encaminhamento correto | Não executado |
| Clique sem mensagem | Nenhuma conversa/oportunidade WhatsApp criada apenas pelo clique | Não executado |
| Qualificação | Transição real, data e evento deduplicado | Não executado |
| Ganho | Estado, valor/moeda e origem preservados | Não executado |
| Operação existente | Gatilhos anteriores e oportunidades existentes preservados | Nenhuma mutação CRM realizada |

A documentação de testes anteriores do site não valida automações CRM. Após cada teste integrado, registrar ambiente, horário, IDs sintéticos/reais de teste, esperado, observado e evidência sanitizada. Avaliar arquivamento/limpeza de registros de teste conforme recursos disponíveis; não excluir dados de produção sem aprovação.

Verificação local nesta tarefa: `npm run build` concluído com código de saída 0 em 15/10/2026, com avisos de resolução de paths e de API obsoleta de server functions. Alterações locais somente neste contrato e nas notas `docs/CRM_AUDIT_NOTES.md`; nenhum código de aplicação, commit, push, deploy ou migração remota foi realizado. O build não testa conectividade ou automações do CRM.

## 11. Próxima ação e pendências

1. Administrador disponibilizar sessão com edição das configurações da Status; verificar escopo da lista vazia de contatos e confirmar tenant. Login já concluído; não enviar segredos no chat.
2. Obter documentação oficial da API/webhook genérico e confirmar semântica das etapas, IDs de responsáveis e canal, gatilhos detalhados dos fluxos, IA/Follow-Up e regras de distribuição.
3. Preparar alterações aditivas usando campos existentes sempre que possível; obter aprovação concreta para novo funil ou efeitos destrutivos/de alto impacto.
4. Aplicar e verificar campos e fluxos autorizados; capturar evidência sem credenciais.
5. Completar payloads reais e regras de autenticação/erros/webhooks; implementar integração no servidor em fase apropriada.
6. Executar homologação com dados e remetente de teste autorizados; registrar pendências residuais e somente então marcar o contrato como validado.

**Bloqueadores atuais:** configurações em Modo visualização; contrato de API não disponível nas telas inspecionadas; ambiente/remetente de teste e efeitos de automações não homologados. Campos e fluxos solicitados não aplicados; diagnóstico completo e validação fim a fim ainda não concluídos. O contrato permanece `pending_spec`.
