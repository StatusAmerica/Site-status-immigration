/**
 * Conteúdo editável da home, defaults consumidos pelos componentes.
 *
 * Os componentes leem via `useContent(key)` que tenta primeiro o dataStore
 * (tabela `site_content`) e cai para o default abaixo. Assim o admin pode
 * espelhar/sobrescrever sem alterar componentes.
 *
 * O site público nunca renderiza marcadores internos de revisão editorial.
 */

import { useEffect, useState } from "react";
import { list } from "./dataStore";
import {
  CLAIM_FAMILIAS,
  CLAIM_PROCESSOS,
  CLAIM_SATISFACAO,
  CLAIM_AVALIACOES,
  BBB_LABEL,
} from "@/config/credentials";
// Fotografias hero por página de visto (defaults). Placeholders
// art-direcionados no tratamento padrão do site — substituir por foto real
// específica de cada visto, nunca imagem genérica de IA, nunca compartilhar
// a mesma imagem entre vistos.
import visaHeroEb2Niw from "@/assets/visa-hero-eb2-niw.jpg";
import visaHeroEb1 from "@/assets/visa-hero-eb1.jpg";
import visaHeroEb3 from "@/assets/visa-hero-eb3.jpg";
// Dobra "01 Definição" — mérito da carreira = mostrar o profissional
// beneficiário no exercício da sua competência, não o escritório.
// Substituir por fotografia real art-direcionada com o tratamento padrão.
import visaDefinitionEb2Niw from "@/assets/visa-eb2-niw-definition.jpg";
import visaDefinitionEb1 from "@/assets/visa-eb1-definition.jpg";
import visaDefinitionEb3 from "@/assets/visa-eb3-definition.jpg";

export const defaultContent = {
  "hero.eyebrow": "IMIGRAÇÃO PARA OS ESTADOS UNIDOS. EB-2 NIW",
  "hero.title": "Transforme a sua carreira em um Green Card americano.",
  "hero.subtitle":
    "Advocacia de imigração para profissionais e famílias brasileiras. Análise jurídica, estratégia e acompanhamento em processos EB-1, EB-2 NIW e O-1.",
  "hero.cta": "Iniciar triagem do meu caso",
  // COMPLIANCE: números removidos até validação documental (ver src/config/credentials.ts).
  "hero.proof":
    "Licensed in NY and AZ · Federal immigration practice only",
  "hero.videoUrl": "/videos/hero-home.mp4",
  "hero.posterUrl": "/videos/hero-home-poster.jpg",
  "hero.videoHidden": "",

  "institutional.eyebrow": "VÍDEO INSTITUCIONAL",
  "institutional.title": "Conheça a Status Immigration Law Firm.",
  "institutional.lead": "Em 90 segundos, entenda quem somos, como trabalhamos e por que centenas de famílias brasileiras confiam a construção do seu Green Card à nossa equipe.",
  "institutional.videoUrl": "/videos/institucional-opcoes.mp4",
  "institutional.videoHidden": "",


  "contrast.title": "Você não precisa começar do zero.",
  "contrast.subtitle": "Precisa de um novo cenário para a carreira que você já construiu.",

  "niw.title": "EB-2 NIW: o Green Card por mérito profissional",
  "niw.lead":
    "O National Interest Waiver permite que profissionais altamente qualificados solicitem a residência permanente nos EUA sem patrocinador, demonstrando que a atuação proposta tem mérito substancial e importância nacional para os Estados Unidos.",

  "process.title": "Um método. Quatro etapas. Acompanhamento jurídico.",

  "why.title": "Por que a Status Immigration Law Firm",
  // COMPLIANCE: "duas décadas" removido — sem lastro documental (FTC/FDUTPA).
  "why.lead":
    "Equipe com trajetória consolidada em processos de imigração, com sede própria em Orlando desde 2022.",

  "cta.title": "Entenda quais documentos costumam ser exigidos pelo USCIS em cada categoria.",
  "cta.subtitle":
    "Levantamento inicial de informações, gratuito e confidencial. Em até 48h nossa equipe organiza as informações do seu perfil e apresenta um panorama das categorias de visto aplicáveis.",

  // ==== Selos e parceiros (Correções 3) ============================
  // Faixa de credenciais tratada como selos oficiais. Slots com `.url`
  // vazio renderizam moldura placeholder, o cliente envia os arquivos
  // e o admin cola a URL da imagem no /admin/conteudo.
  "partners.eyebrow": "CREDENCIAIS E PARCEIROS",
  "partners.title": "Registros e presença institucional.",
  // COMPLIANCE: rótulos BBB e Google — ver src/config/credentials.ts.
  // PENDENTE (cliente): confirmar se é "BBB Accredited Business" (acreditação)
  // ou apenas "BBB Rating A" (nota). São coisas diferentes; hoje usamos o mais
  // conservador. Não cravar nota do Google em texto estático.
  "partners.slot1.label": "BBB Rating A",
  "partners.slot1.url": "",
  "partners.slot2.label": "Licensed in NY and AZ",
  "partners.slot2.url": "",
  "partners.slot3.label": "EIN 42-4745152",
  "partners.slot3.url": "",
  "partners.slot4.label": "CNPJ 62.917.376/0001-21",
  "partners.slot4.url": "",

  // ==== Depoimentos em vídeo + estudos de caso =====================
  // O caso EB-2 on-message é o do Helder (sócio que obteve Green Card
  // via EB-2 NIW). O segundo slot fica reservado para vídeo de cliente
  // real (ex.: engenheiro/empresário aprovado) conforme surgirem os
  // estudos de caso do YouTube. URLs vazias → renderiza placeholder.
  "testimonials.videoEyebrow": "CASOS REAIS EM VÍDEO",
  "testimonials.videoTitle": "Quem já passou pelo processo, no vídeo.",
  "testimonials.helderName": "Helder Moreira",
  "testimonials.helderCaption": "Caso real. Green Card EB-2 NIW",
  "testimonials.helderRole": "Sócio da Status Immigration Law Firm",
  "testimonials.helderVideoUrl": "",
  "testimonials.secondaryName": "Cliente aprovado",
  "testimonials.secondaryCaption": "Caso de cliente, em breve",
  "testimonials.secondaryRole": "Engenheiro / Empresário",
  "testimonials.secondaryVideoUrl": "",
  "testimonials.googleReviewsUrl":
    "https://www.google.com/search?q=Status+na+Am%C3%A9rica+Orlando+reviews",

  // ==== Hero das páginas de visto (subtítulo enxuto + vídeo por página) ====
  // Cada página de visto lê seu próprio vídeo aqui; vazio → placeholder.
  // ==== Hero das páginas de visto (subtítulo enxuto + vídeo + IMAGEM por visto) ====
  // Cada página de visto lê seu próprio vídeo E sua própria imagem aqui.
  // heroImage: URL da fotografia de fundo, específica de cada visto.
  // NUNCA compartilhar a mesma imagem entre vistos, nem usar IA genérica.
  "visa.eb2-niw.heroSubtitle":
    "O Green Card por mérito profissional, sem empresa patrocinadora e sem oferta de emprego.",
  "visa.eb2-niw.heroVideoUrl": "/videos/visto-eb2-niw.mp4",
  "visa.eb2-niw.heroVideoThumb": "/videos/visto-eb2-niw-poster.jpg",
  "visa.eb2-niw.heroVideoHidden": "",
  // EB-2 NIW: profissional brasileiro 40+ consolidado com toque
  // de família ao fundo em contexto americano aspiracional. Substituir por
  // fotografia real art-direcionada com o tratamento padrão — nunca imagem
  // genérica de IA; imagem específica deste visto, não compartilhada.
  "visa.eb2-niw.heroImage": visaHeroEb2Niw,
  // Dobra 01 Definição — profissional beneficiário no exercício da sua
  // competência (ex.: engenheiro/médico/cientista em ação). NÃO usar
  // executiva de braços cruzados (comunica escritório de advocacia, o
  // oposto do posicionamento). Editável no admin.
  "visa.eb2-niw.definitionImage": visaDefinitionEb2Niw,
  "visa.eb1.heroSubtitle":
    "O Green Card para profissionais com habilidade extraordinária comprovada, sem patrocinador, sem PERM.",
  "visa.eb1.heroVideoUrl": "/videos/visto-eb1.mp4",
  "visa.eb1.heroVideoThumb": "/videos/visto-eb1-poster.jpg",
  "visa.eb1.heroVideoHidden": "",
  // EB-1 (habilidade extraordinária): figura de excelência/liderança em
  // ambiente de alto padrão (escritório executivo, laboratório, palco).
  // Substituir por fotografia real art-direcionada com o tratamento padrão —
  // nunca imagem genérica de IA; imagem específica deste visto, não compartilhada.
  "visa.eb1.heroImage": visaHeroEb1,
  "visa.eb1.definitionImage": visaDefinitionEb1,
  "visa.eb3.heroSubtitle":
    "O Green Card com oferta formal de emprego nos EUA, exige patrocinador e PERM.",
  "visa.eb3.heroVideoUrl": "",
  "visa.eb3.heroVideoThumb": "",
  "visa.eb3.heroVideoHidden": "",
  // EB-3 (profissional qualificado): profissional em ambiente de trabalho
  // americano concreto (hospital, indústria, empresa). Tom mão-na-massa /
  // oportunidade real. Substituir por fotografia real art-direcionada com o
  // tratamento padrão — nunca imagem genérica de IA; imagem específica deste
  // visto, não compartilhada.
  "visa.eb3.heroImage": visaHeroEb3,
  "visa.eb3.definitionImage": visaDefinitionEb3,
  "visa.o1.heroSubtitle":
    "Visto temporário para habilidade extraordinária. Admite empregador ou agente peticionário — sem exigência de oferta permanente.",
  "visa.o1.heroVideoUrl": "/videos/visto-o1.mp4",
  "visa.o1.heroVideoThumb": "/videos/visto-o1-poster.jpg",
  "visa.o1.heroVideoHidden": "",
  "visa.o1.heroImage": visaHeroEb1,
  "visa.o1.definitionImage": visaDefinitionEb1,


  // ==== Página de Contato =========================================
  "contato.eyebrow": "FALE CONOSCO",
  "contato.title": "Vamos conversar sobre a sua documentação.",
  "contato.subtitle":
    "Tire suas dúvidas com nossa equipe ou faça seu levantamento inicial de informações.",
  "contato.usa.title": "Matriz. Estados Unidos",
  "contato.usa.company": "Status Immigration Law Firm PLLC",
  "contato.usa.address": "7575 KingsPointe Pkwy #4, Orlando, FL 32819",
  "contato.usa.phone1": "+1 689 251-0985",
  "contato.usa.phone2": "+1 689 220-9691",
  "contato.usa.ein": "EIN 42-4745152",
  "contato.br.title": "Filial. Brasil",
  "contato.br.company": "Alphaville · CEA Corporate",
  "contato.br.address": "Alameda Araguaia 2104, Barueri/SP · CEP 06455-000",
  "contato.br.cnpj": "CNPJ 62.917.376/0001-21",
  "contato.br.phone": "+1 689 220-9714",
  "contato.expansao.title": "Expansão internacional",
  "contato.expansao.text": "Portugal e Dubai · em breve.",
  "contato.form.title": "Deixe uma mensagem",
  "contato.form.lead":
    "Para uma triagem inicial completa, use o botão “Iniciar triagem do meu caso”. Este canal é para dúvidas rápidas e mensagens.",
  "contato.form.success": "Recebemos sua mensagem. Retornaremos em breve.",

  // ==== Página Sobre ==============================================
  "sobre.hero.eyebrow": "QUEM SOMOS",
  "sobre.hero.title": "Status Immigration Law Firm. De Orlando para o Brasil.",
  // COMPLIANCE: "duas décadas" removido — sem lastro documental.
  "sobre.hero.subtitle":
    "Escritório de advocacia especializado exclusivamente em imigração federal, com sede em Orlando e atendimento em português.",
  "sobre.hero.image": "",

  "sobre.historia.eyebrow": "NOSSA HISTÓRIA",
  "sobre.historia.title": "Uma estrutura jurídica dedicada exclusivamente à imigração.",
  "sobre.historia.body":
    "A Status Immigration Law Firm reúne a experiência da operação que a antecedeu em uma nova estrutura de advocacia de imigração. Com sede em Orlando, atuação jurídica liderada por Meagan Zabadal e atendimento em português, o escritório acompanha profissionais e famílias do enquadramento do caso à decisão, com clareza sobre limites, riscos e próximos passos.",
  "sobre.historia.image": "",

  "sobre.diferencial.eyebrow": "NOSSO DIFERENCIAL",
  "sobre.diferencial.title": "Estamos fisicamente nos Estados Unidos.",
  "sobre.diferencial.lead":
    "Diferente de quem opera apenas à distância, a Status tem sede em Orlando. Acompanhamos o cliente antes, durante e depois da chegada.",
  "sobre.diferencial.p1.title": "Chegada aos EUA",
  "sobre.diferencial.p1.text": "Recepção, orientação inicial e conexão com a rede local de suporte.",
  "sobre.diferencial.p2.title": "Bancos e documentação",
  "sobre.diferencial.p2.text": "Suporte para abertura de contas, SSN, ITIN e documentos essenciais.",
  "sobre.diferencial.p3.title": "Moradia e escolas",
  "sobre.diferencial.p3.text": "Indicações de bairros, imobiliárias parceiras e escolas para os filhos.",
  "sobre.diferencial.p4.title": "Adaptação de família",
  "sobre.diferencial.p4.text": "Acompanhamento humano nos primeiros meses de vida nos EUA.",

  "sobre.equipe.eyebrow": "QUEM CUIDA DO SEU CASO",
  "sobre.equipe.title": "Estratégia jurídica e operação presentes nos dois países.",
  "sobre.equipe.note":
    "Fotos e biografias a substituir por conteúdo real fornecido pelo cliente.",
  "sobre.equipe.m1.nome": "Lia",
  "sobre.equipe.m1.papel": "Fundadora",
  "sobre.equipe.m1.bio": "",
  "sobre.equipe.m1.foto": "",
  "sobre.equipe.m2.nome": "David",
  "sobre.equipe.m2.papel": "Sócio",
  "sobre.equipe.m2.bio": "",
  "sobre.equipe.m2.foto": "",
  "sobre.equipe.m3.nome": "Helder Moreira",
  "sobre.equipe.m3.papel": "Sócio",
  "sobre.equipe.m3.bio": "",
  "sobre.equipe.m3.foto": "",
  "sobre.equipe.m4.nome": "Case Managers",
  "sobre.equipe.m4.papel": "Estrutura de atendimento",
  "sobre.equipe.m4.bio": "",
  "sobre.equipe.m4.foto": "",

  // COMPLIANCE: números vêm de src/config/credentials.ts (fonte única).
  // A exibição pública continua controlada pela fonte de credenciais.
  "sobre.numeros.eyebrow": "NÚMEROS E CREDENCIAIS",
  "sobre.numeros.title": "O que sustenta a nossa operação.",
  "sobre.numeros.n1.valor": CLAIM_FAMILIAS.value,
  "sobre.numeros.n1.label": CLAIM_FAMILIAS.label,
  "sobre.numeros.n2.valor": CLAIM_PROCESSOS.value,
  "sobre.numeros.n2.label": CLAIM_PROCESSOS.label,
  "sobre.numeros.n3.valor": CLAIM_SATISFACAO.value,
  "sobre.numeros.n3.label": CLAIM_SATISFACAO.label,
  "sobre.numeros.n4.valor": CLAIM_AVALIACOES.value,
  "sobre.numeros.n4.label": CLAIM_AVALIACOES.label,
  "sobre.numeros.n5.valor": "—",
  "sobre.numeros.n5.label": BBB_LABEL,

  "sobre.cta.title": "Entenda as possibilidades jurídicas do seu caso.",
  "sobre.cta.subtitle":
    "Comece pela triagem inicial. Quando houver aderência, sua situação poderá ser encaminhada para análise jurídica individualizada.",
};



export type ContentKey = keyof typeof defaultContent;

/* ============================================================
 * Store único de site_content.
 *
 * Antes cada `useContent(key)` disparava a sua própria consulta e começava
 * com o default. Para `*.videoHidden` isso significava renderizar a moldura
 * do vídeo e removê-la segundos depois ("flash"). Agora:
 *  - uma única leitura de `site_content` para todas as chaves;
 *  - cache em memória compartilhado entre componentes;
 *  - flag `ready` para os blocos que não podem piscar (slots de vídeo).
 * ============================================================ */

type ContentMap = Partial<Record<string, string>>;

let contentCache: ContentMap | null = null;
let contentPromise: Promise<ContentMap> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

async function loadContent(): Promise<ContentMap> {
  if (contentCache) return contentCache;
  if (contentPromise) return contentPromise;
  contentPromise = (async () => {
    const map: ContentMap = {};
    try {
      const rows = await list<{ value?: string }>("site_content");
      for (const row of rows) {
        if (row?.value) map[row.id] = row.value;
      }
    } catch { /* mantém defaults */ }
    contentCache = map;
    emit();
    return map;
  })();
  return contentPromise;
}

/** Invalida o cache (usado pelo admin após salvar conteúdo). */
export function refreshContentCache() {
  contentCache = null;
  contentPromise = null;
  void loadContent();
}

// O admin dispara `status:admin-change` (src/lib/admin/settings.ts) ao salvar.
if (typeof window !== "undefined") {
  window.addEventListener("status:admin-change", () => refreshContentCache());
}

function useContentStore(): { map: ContentMap; ready: boolean } {
  const [state, setState] = useState<{ map: ContentMap; ready: boolean }>(() =>
    contentCache ? { map: contentCache, ready: true } : { map: {}, ready: false },
  );

  useEffect(() => {
    let active = true;
    const sync = () => {
      if (active) setState({ map: contentCache ?? {}, ready: contentCache !== null });
    };
    listeners.add(sync);
    if (contentCache) sync();
    else void loadContent().then(sync);
    return () => { active = false; listeners.delete(sync); };
  }, []);

  return state;
}

export function useContent(key: ContentKey): string {
  const { map } = useContentStore();
  return map[key] ?? defaultContent[key];
}

/**
 * Igual a `useContent`, mas informa se o valor já veio do banco.
 * Enquanto `ready` for false, blocos ocultáveis (vídeo) não devem renderizar.
 */
export function useContentResolved(key: ContentKey): { value: string; ready: boolean } {
  const { map, ready } = useContentStore();
  return { value: map[key] ?? defaultContent[key], ready };
}

/** Conveniência: true somente quando o conteúdo já foi resolvido E não está oculto. */
export function useVisibleSlot(hiddenKey: ContentKey): boolean {
  const { value, ready } = useContentResolved(hiddenKey);
  const hidden = value === "1" || value === "true";
  return ready && !hidden;
}

