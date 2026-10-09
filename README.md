# Status Immigration Law Firm

# PROJETO: Status Immigration Law Firm — Site Brasil (Imigração EB para os EUA)

Construa a FUNDAÇÃO + DESIGN SYSTEM + HOME INSTITUCIONAL de um site de captação para o mercado brasileiro. Stack padrão Lovable: React + Vite + Tailwind + shadcn/ui. NÃO conecte Supabase ainda — use a camada de dados em localStorage descrita abaixo, com abstração para migração futura.

## CONTEXTO DO NEGÓCIO (leia antes de construir)

A Status Immigration Law Firm é uma assessoria de mobilidade migratória sediada em Orlando/FL que ajuda brasileiros QUALIFICADOS a imigrar legalmente para os EUA. Carro-chefe: visto EB-2 NIW (National Interest Waiver) — Green Card por mérito, SEM necessidade de patrocinador/empregador, com Green Card estendido a cônjuge e filhos. Coadjuvantes: EB-1 (habilidade extraordinária) e EB-3 (exige patrocinador).

Público-alvo Brasil: profissionais consolidados, 40+, com pós-graduação/mestrado, em capitais, alto poder aquisitivo. Personas: Médico Consolidado, Engenheiro Consolidado, Empresário Calculista. Ticket alto (USD 15k–30k), ciclo de decisão longo (processo dura ~2 anos).

## REGRAS DE CONTEÚDO (OBRIGATÓRIAS — não viole)

1. APENAS vistos EB no site (EB-2 NIW em destaque, EB-1 e EB-3 secundários). NÃO inclua Visto T, Visto U, VAWA, asilo, DACA ou qualquer serviço humanitário — é proibido oferecer isso a quem está no Brasil.

2. Nível de consciência do público é BAIXO: o topo da página vende dor/desejo (qualidade de vida, segurança, futuro dos filhos, salário em dólar) e SÓ DEPOIS educa sobre o visto. Não abra a página com siglas técnicas.

3. NENHUMA promessa de aprovação garantida, prazo garantido ou resultado assegurado. Linguagem ética: "maior probabilidade", "estratégia comprovada", "método". 

4. Todo texto em português do Brasil.

5. Números de prova social entram como editáveis e marcados [CONFIRMAR] — não invente estatísticas.

## DESIGN SYSTEM (defina como tokens globais reutilizáveis)

Estética: confiança premium americana, sóbria, sofisticada. Continuidade com a marca atual (dark + dourado).

- Cores: fundo escuro `#0B1120` (navy quase preto); superfície `#111A2E`; texto claro `#F5F3EF` (off-white quente); accent primário dourado/âmbar `#C9A24B`; accent secundário `#1E3A5F` (navy americano); sucesso `#3FA66A`. Seções alternam dark e creme claro `#F7F4ED` para ritmo visual.

- Tipografia: títulos em serifada elegante (ex: "Fraunces" ou "Playfair Display") para autoridade; corpo em sans-serif limpa (ex: "Inter"). Hierarquia forte, headlines grandes.

- Componentes shadcn: Button (primário dourado sólido, secundário outline), Card, Accordion (FAQ), Input/Select/RadioGroup (formulário), Dialog, Badge, Tabs.

- Detalhes: cantos suaves (rounded-xl), sombras discretas, micro-animações de entrada (fade/slide on scroll), faixa sutil com motivo de bandeira/estrela sem ser kitsch. Mobile-first, 100% responsivo.

## CAMADA DE DADOS (localStorage com abstração para migração)

Crie `src/lib/dataStore.ts` exportando funções assíncronas: `get(table, id)`, `list(table)`, `set(table, id, value)`, `remove(table, id)`. Implementação atual: localStorage com chave `status_${table}`. ISOLE toda persistência aqui — nenhum componente acessa localStorage direto. Assim, migrar para Supabase depois = reescrever só este arquivo.

Tabelas usadas agora:

- `leads`: cada lead capturado (ver formulário abaixo)

- `site_content`: textos editáveis da home por seção/chave (já estruture com os valores reais abaixo como default, para o admin futuro espelhar). Os componentes da home devem LER de site_content com fallback para o texto padrão.

## ESTRUTURA DA HOME (/) — dobras em ordem

1. HEADER fixo: logo Status Immigration Law Firm (placeholder), menu (Início · Vistos [EB-2 NIW, EB-1, EB-3] · Para quem [Médicos, Engenheiros, Empresários] · Sobre · Conteúdo · Contato), botão CTA "Avaliação gratuita" (dourado) e ícone WhatsApp. Menu hambúrguer no mobile.

2. HERO: fundo dark com vídeo/imagem placeholder (terra→EUA). 

   - Eyebrow: "IMIGRAÇÃO PARA OS ESTADOS UNIDOS • EB-2 NIW"

   - H1: "Seu Green Card americano baseado no mérito da sua carreira."

   - Sub: "A Status Immigration Law Firm ajuda profissionais brasileiros consolidados a conquistar a residência permanente nos EUA pelo EB-2 NIW — sem patrocinador, sem loteria, com Green Card para o cônjuge e os filhos."

   - CTA primário: "Fazer minha avaliação gratuita" (rola até o formulário)

   - Faixa de prova social: "+1.000 famílias atendidas [CONFIRMAR] · Nota 5,0 no Google · Sede em Orlando, Flórida"

3. FAIXA DE MÍDIA/AUTORIDADE: logos placeholder (imprensa/selos) + selo "Better Business Bureau" placeholder.

4. BRASIL vs EUA (duas colunas contrastantes):

   - "A realidade que você já conhece no Brasil": insegurança, carga tributária alta, instabilidade política/econômica, oportunidades limitadas mesmo com qualificação, futuro incerto para os filhos.

   - "O que os EUA oferecem a quem é qualificado": economia estável e dólar forte, segurança para a família, carreira valorizada, educação e saúde de ponta, caminho legal baseado em mérito.

   - Fecho: "Você não precisa recomeçar do zero. Precisa de um novo cenário para a carreira que você já construiu."

5. O CARRO-CHEFE — EB-2 NIW: bloco explicativo com espaço para VÍDEO (placeholder) "Entenda o EB-2 NIW em X minutos". Texto: o que é o National Interest Waiver, por que dispensa patrocinador, por que se encaixa em profissionais consolidados que geram renda, impostos e empregos. 4 bullets: "Sem necessidade de empregador patrocinador" · "Baseado no seu histórico e contribuição profissional" · "Green Card para cônjuge e filhos" · "Caminho para a cidadania após 5 anos". CTA "Quero saber se tenho perfil".

6. VISTOS (cards): EB-2 NIW (card em destaque, dourado) · EB-1 (habilidade extraordinária) · EB-3 (com nota: "exige patrocinador"). Cada card linka para /vistos/[slug] (rotas podem ser stubs por enquanto).

7. PARA O SEU MOMENTO DE CARREIRA: 3 cards — Médicos · Engenheiros · Empresários — cada um com headline curta segmentada e CTA "Ver caminho para [segmento]" linkando para /lp/[segmento] (stubs por enquanto). Deixe comentário no código: "Estes cards apontam para o motor de Landing Pages do Prompt 2".

8. PROCESSO EM 3 PASSOS: 01 Avaliação gratuita do seu perfil · 02 Estratégia e preparação da petição (rigor USCIS) · 03 Acompanhamento até a aprovação e adaptação nos EUA.

9. POR QUE A STATUS IMMIGRATION LAW FIRM: sede própria em Orlando, equipe dedicada, +25 anos de experiência [CONFIRMAR], nota 5,0 no Google, +1.000 famílias [CONFIRMAR], assessoria completa (documentação, tradução, mudança, bancos, escolas).

10. SALÁRIO BRASIL vs EUA (comparativo visual): bloco com números editáveis (ex.: profissão, média Brasil, média EUA) — deixe genérico na home, pois os números específicos por cargo virão no motor de LPs. Marque [CONFIRMAR] nos valores.

11. DEPOIMENTOS por profissão (carrossel/cards): 4 placeholders atribuídos a Médico, Engenheiro, Empresário, Família — com nota 5 estrelas. Comentário: "substituir por depoimentos reais autorizados".

12. FAQ (accordion) — inclua obrigatoriamente:

   - "O EB-2 NIW exige que eu tenha uma empresa me contratando nos EUA?" 

   - "Preciso ter inglês fluente para começar?"

   - "Quanto tempo dura o processo?" (responder ~2 anos, ciclo longo, por isso começar cedo)

   - "Não tenho mestrado, ainda tenho perfil?"

   - "Como estão as filas e a emissão de vistos para brasileiros hoje?" → resposta sóbria: há flutuações consulares e por isso o planejamento antecipado importa; a Status acompanha o cenário e estrutura cada caso conforme as regras vigentes. SEM prometer prazos.

   - "Quanto custa?" → responder que há avaliação gratuita e que valores dependem do perfil/família.

13. CTA FINAL + FORMULÁRIO (ver seção formulário). Headline: "Descubra se você já tem perfil para o Green Card."

14. FOOTER: logo, frase de autoridade, contatos BR e EUA (placeholders), WhatsApp BR/EUA, redes sociais, CNPJ [CONFIRMAR], links legais (Termos, Privacidade), endereço Orlando.

## FORMULÁRIO COM LEAD SCORING (núcleo da conversão)

Formulário multi-etapa (stepper, 2–3 passos) que ao final salva em `leads` (dataStore) e mostra tela de agradecimento "Recebemos seu perfil. Nossa equipe vai analisar e entrar em contato." Capture UTMs da URL (utm_source/medium/campaign/content/term) e salve junto. Campos:

- Nome completo (texto)

- E-mail (texto, validar)

- WhatsApp (texto, máscara BR)

- Profissão / área de atuação (select: Médico / Dentista / Engenheiro / Advogado / Empresário / TI / Outra área qualificada / Outra)

- Faixa etária (select: até 29 / 30–39 / 40–49 / 50+)

- Formação (select: Ensino superior / Pós-graduação / Mestrado / Doutorado / Sem ensino superior)

- Cidade (texto) + UF (select)

- Renda mensal aproximada (select em faixas: até R$10k / R$10–20k / R$20–40k / R$40k+)

- Momento da decisão (select: "Já decidi, quero ir o quanto antes" / "Pretendo nos próximos 1–2 anos" / "Ainda é um sonho/estou pesquisando")

CALCULE um `score` (0–100) e uma `classificacao` no submit, salvos no lead. Rubrica:

- Profissão: Médico/Engenheiro/Empresário/Dentista/Advogado/TI = 25 · Outra qualificada = 12 · Outra = 4

- Formação: Doutorado/Mestrado = 20 · Pós = 15 · Superior = 8 · Sem superior = 2

- Faixa etária: 40–49 = 15 · 50+ = 13 · 30–39 = 10 · até 29 = 4

- Renda: R$40k+ = 25 · R$20–40k = 18 · R$10–20k = 10 · até R$10k = 3

- Momento: "Já decidi" = 15 · "1–2 anos" = 9 · "Sonho/pesquisando" = 3

- Cidade capital/região metropolitana = +0 (informativo agora; usado em análise depois)

Classificação: A (SQL quente) ≥ 80 · B (MQL) 60–79 · C (nutrir) 40–59 · D (desqualificado) < 40. Salve score e classificacao no objeto do lead, mas NÃO mostre a classificação ao usuário.

## SEO BASELINE

- HTML semântico (header/main/section/footer, h1 único por página).

- `react-helmet-async` (ou equivalente) para title/description por página. Home: title "Status Immigration Law Firm | Green Card EB-2 NIW para profissionais brasileiros"; description focada em imigração legal por mérito.

- Tags Open Graph + Twitter card com imagem placeholder.

- Estrutura preparada para sitemap e JSON-LD (Organization/LocalBusiness) — pode deixar o componente pronto com dados placeholder.

- Home indexável (index,follow).

## ENTREGÁVEL

Home (/) completa e responsiva, com todas as 14 dobras, design system aplicado, formulário com scoring funcionando e salvando em localStorage via dataStore, textos lendo de site_content com fallback. Rotas /vistos/* , /lp/* , /sobre, /contato, /blog podem ser páginas-stub por enquanto. Deixe o código organizado e comentado para os próximos prompts (motor de LPs, admin, blog).

## Hospedagem

O site roda na Cloudflare (Workers + D1 + R2; login próprio do painel). Veja `AGENTS.md` e
`docs/MIGRACAO-CLOUDFLARE.md`.

```sh
npm i
npm run db:migrate:local
npm run dev
```
