# Evidências da inspeção CRM — 15/10/2026

Inspeção parcial; bloqueadores e contrato consolidados em `../CRM_INTEGRATION_SPEC.md`. Sem alterações remotas. Credenciais não registradas.

Login concluído pelo usuário no navegador. Título: Agente de IA + CRM. Configurações em `/configuracoes` exibem **Modo visualização** e controles desabilitados. Conta da sessão: Lucas Martins. Menu Vinculações mostra 0 e “Nenhuma conta disponível para conexão”. Funis identificam Status na América; tenant ID ainda não exposto.

## Funis (IDs reais exibidos em Configurações > CRM > Funis)

| ID | Nome | Estágios |
| --- | --- | --- |
| 9967 | EB-2 NIW \| Status na América | 9 |
| 9975 | EB-1 \| Habilidade Extraordinária | 7 |
| 9976 | O-1 \| Habilidade Extraordinária | 7 |
| 10205 | Triagem | 4 — marcado Padrão |

A UI informa genericamente que um funil padrão é necessário para criação automática; Triagem já tem a marca Padrão. Não interpretar o aviso genérico como ausência de padrão.

## Fontes (IDs reais)

| ID | Nome | Source exibido |
| --- | --- | --- |
| 17276 | Meta Ads | — |
| 17277 | Google Ads - Search | — |
| 17278 | Google Ads - YouTube | — |
| 17279 | Indicação | — |
| 17280 | Instagram Orgânico | — |
| 17281 | Site / SEO | — |
| 17308 | Landing Page - Formulário Longo | — |
| 17309 | WhatsApp Direto | — |

## Campos personalizados (IDs reais)

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

A UI informa que IA preenche campos conforme conversa/pergunta. Campo agregado 5636 existe; campos individuais de atribuição não apareceram na lista inspecionada. Não assumir schema de API a partir destes rótulos.

## Conversas (configurações somente leitura)

- Assinatura de mensagens: desativada.
- Criar negociação automaticamente (mesmo sem agente IA): desativado.
- Reabrir conversa automaticamente: desativado.
- Transcrever áudio no chat: ativado.
- Sons: ativados, volume 70%.

## Integrações

Abas disponíveis: Pagamentos e infoprodutos; Assinatura de documentos; Captação de leads; Planilhas e dados; CRMs; E-commerce; Portais e classificados; Saúde e clínicas; Jurídico; Personalizado. Controles Conectar desabilitados em modo visualização. Catálogo não equivale a integração ativa.

Modelo de mensagem existente: `TESTE Boas Vindas`, conteúdo de teste. Nenhum disparo executado.

Dashboard: instâncias WhatsApp 1/1; métricas de 15/09–15/10/2026 exibem zero novas negociações e contatos, valores zerados. Isso não comprova base vazia nem conexão de mensagem funcional.

## Complemento da inspeção autenticada

- 27 etapas dos quatro funis verificadas por identificadores `stage-*` no quadro. Tabela completa na seção 2.4 do contrato. Zero negócios no filtro criadas ou movidas de 16/09 a 15/10/2026 não representa total histórico.
- Contatos mostra nenhum contato cadastrado nesta sessão; histórico de automações referencia contatos anteriores. Escopo/permissões/arquivamento precisam ser esclarecidos.
- Conversão ativa Detectar interesse em agendar conversa: prioridade 1, três palavras OR, Toda a conversa, destino EB-2 9967 / Reunião agendada 68423. Histórico de 18 e 21/09/2026; não houve teste novo.
- Tarefa ativa Notificar equipe humana ao entrar em Agendado usa modelo Escalonamento Humano - Status na América, responsável da negociação e vencimento Mesmo dia. Entrega não validada.
- Movimentação por inatividade: nenhuma regra. Eventos Google/Meta aguardam conexão/configuração; nenhum formulário Meta, pixel ou link WhatsApp no módulo Rastreamento.
- WhatsApp: 1 conexão de 1, Comercialvihij, rótulo v2, ATIVO, número terminado em 6303. Provedor, IDs técnicos e entrega fim a fim não confirmados.
- Fluxos, após carregar: modo Fluxos ativo, Agente IA pausado. Atendimento inicial ID 2030 ativo, 6 blocos, 251 conversas, 1 WhatsApp; Qualificação EB-2 NIW inativo, 11 blocos, 1 conversa, 1 WhatsApp. Contadores históricos, não homologação.
- Editor 2030: espera de 2 segundos, saudação, tag SITE, Triagem/Novo Lead e responsável Rafael Patrick. Nenhuma edição/simulação/publicação. Revisar interação com nova captação antes de ativar automações concorrentes.
- Não houve criação de campos, envio de mensagens, contato de teste, chamada à API CRM ou alteração remota. Contrato da API e permissões de Configurações permanecem bloqueadores; Follow-Up e detalhes da IA não inspecionados.
