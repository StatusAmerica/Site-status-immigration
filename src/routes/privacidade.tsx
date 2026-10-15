/**
 * /privacidade — Política de Privacidade.
 *
 * COMPLIANCE (PARTE A · P1): página obrigatória para operar tráfego pago em
 * Meta/Google e cumprir LGPD (art. 9º) e o Florida Digital Bill of Rights.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade | Status Immigration Law Firm" },
      {
        name: "description",
        content:
          "Como a Status Immigration Law Firm coleta, usa, armazena e protege os dados pessoais dos usuários do site, em conformidade com a LGPD.",
      },
      { name: "robots", content: "noindex,follow" },
    ],
  }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container-x pb-16 pt-32 md:pb-20 md:pt-40 max-w-4xl">
        <p className="font-mono-label text-gold/85">DOCUMENTO LEGAL</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl leading-tight">
          Política de Privacidade
        </h1>
        <p className="mt-4 text-sm text-foreground/70">
          Última atualização: {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}.
        </p>

        <section className="legal-sheet prose-legal mt-10 space-y-8 text-[15px] leading-relaxed text-foreground/85">
          <div>
            <h2 className="font-display text-2xl text-foreground">1. Quem somos</h2>
            <p className="mt-3">
              Esta política se aplica ao site <strong>statusimmigrationlaw.com.br</strong>{" "}
              e demais domínios operados por <strong>Status Immigration Law Firm PLLC</strong>{" "}
              (EIN 42-4745152), com sede em 7575 KingsPointe Pkwy #4, Orlando, FL
              32819, EUA, e por sua filial no Brasil <strong>Status Immigration Law Firm</strong>{" "}
              (CNPJ 62.917.376/0001-21), em Alameda Araguaia, 2104, Barueri/SP.
            </p>
            <p className="mt-3">
              A Status Immigration Law Firm é um escritório de advocacia especializado em
              imigração federal. A prática jurídica é conduzida por advogada licenciada em
              Nova York e Arizona. <em>Federal immigration practice only.</em>
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground">2. Dados que coletamos</h2>
            <p className="mt-3">Coletamos as seguintes informações, todas fornecidas voluntariamente pelo próprio usuário:</p>
            <ul className="mt-3 list-disc pl-6 space-y-2">
              <li>
                <strong>Formulário de Análise (/avaliacao):</strong> nome completo, e-mail,
                WhatsApp, objetivo do visto, profissão, formação acadêmica, faixa etária,
                faixa de renda mensal aproximada e momento da decisão.
              </li>
              <li>
                <strong>Pré-qualificação (/pre-qualificacao):</strong> nome, e-mail,
                WhatsApp e respostas de múltipla escolha sobre formação, experiência
                profissional, reconhecimento na área e contexto migratório.
              </li>
              <li>
                <strong>Contato (/contato):</strong> nome, e-mail, WhatsApp e a mensagem
                digitada pelo usuário.
              </li>
              <li>
                <strong>Dados de navegação:</strong> páginas visitadas, origem do tráfego
                (utm_*, gclid, fbclid, referrer), user-agent e endereço IP.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground">3. Finalidade e base legal</h2>
            <p className="mt-3">Tratamos os dados acima para as seguintes finalidades, tendo como base legal o <strong>consentimento</strong> do titular (art. 7º, I da LGPD) manifestado ao enviar cada formulário:</p>
            <ul className="mt-3 list-disc pl-6 space-y-2">
              <li>Realizar o levantamento inicial de informações e retornar por e-mail ou WhatsApp em até 48h.</li>
              <li>Gerar o mapa informativo de categorias na pré-qualificação.</li>
              <li>Responder à mensagem enviada pelo canal de contato.</li>
              <li>Medir o desempenho de campanhas de marketing e melhorar o site.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground">4. Cookies, pixels e analytics</h2>
            <p className="mt-3">
              O site utiliza cookies próprios e de terceiros, além de pixels de rastreamento do{" "}
              <strong>Meta (Facebook/Instagram)</strong> e do <strong>Google
              (Ads, Analytics, Tag Manager)</strong>, para medir conversões, otimizar
              campanhas e viabilizar remarketing. Esses parceiros podem tratar os dados de
              navegação segundo suas próprias políticas.
            </p>
            <p className="mt-3">As ferramentas de medição só são carregadas após sua autorização em “Preferências de privacidade”. A permissão de publicidade é opcional e separada. Você pode recusar ou revogar essas escolhas e continuar usando os formulários.</p>
            <p className="mt-3">A escolha é lembrada por até 180 dias. Com sua autorização, a primeira e a última origem de campanha são mantidas no navegador por até 30 dias e anexadas ao formulário enviado. Identificadores de clique de anúncios dependem da permissão de publicidade. Ao revogar, a atribuição local é apagada; registros já recebidos seguem a política de retenção abaixo.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground">5. Compartilhamento e transferência internacional</h2>
            <p className="mt-3">
              Os dados são armazenados em infraestrutura de nuvem localizada nos{" "}
              <strong>Estados Unidos da América</strong>. Ao utilizar os
              formulários, o titular está ciente e autoriza a transferência
              internacional para os EUA, com base no art. 33, IX da LGPD
              (consentimento específico e destacado).
            </p>
            <p className="mt-3">
              Compartilhamos dados apenas com prestadores de serviço necessários à operação
              (hospedagem, e-mail transacional, plataforma de anúncios) e sob obrigação
              contratual de confidencialidade. Não vendemos dados a terceiros.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground">6. Retenção</h2>
            <p className="mt-3">
              Dados de leads são mantidos enquanto houver relacionamento ativo com o titular
              e por até <strong>5 anos</strong> após o último contato, para fins de
              histórico comercial e cumprimento de obrigações legais e regulatórias. Após
              esse prazo, os dados são anonimizados ou excluídos.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground">7. Direitos do titular</h2>
            <p className="mt-3">Nos termos da LGPD (art. 18), o titular pode a qualquer momento solicitar:</p>
            <ul className="mt-3 list-disc pl-6 space-y-2">
              <li>Confirmação da existência de tratamento e acesso aos seus dados.</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
              <li>Anonimização, bloqueio ou eliminação dos dados.</li>
              <li>Portabilidade dos dados a outro fornecedor.</li>
              <li>Revogação do consentimento e eliminação dos dados tratados com base nele.</li>
              <li>Informação sobre entidades públicas e privadas com as quais houve compartilhamento.</li>
            </ul>
            <p className="mt-3">
              Para exercer qualquer desses direitos, envie um e-mail para{" "}
              <a href="mailto:contato@statusnaamerica.com" className="text-gold underline underline-offset-4 hover:text-gold/80">
                contato@statusnaamerica.com
              </a>.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground">8. Contato inicial e relação profissional</h2>
            <p className="mt-3">
              O envio de informações por este site permite uma triagem inicial pela equipe,
              mas não cria, por si só, uma relação advogado-cliente. Essa relação somente é
              formalizada após a aceitação do caso pelo escritório e a celebração do contrato
              aplicável. Até essa formalização, evite enviar informações que não sejam
              necessárias para a triagem solicitada.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground">9. Alterações</h2>
            <p className="mt-3">
              Podemos atualizar esta política a qualquer tempo. A data de última
              atualização, no topo desta página, indica a versão em vigor.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-foreground">10. Contato do encarregado (DPO)</h2>
            <p className="mt-3">
              Dúvidas sobre esta política ou sobre o tratamento dos seus dados podem ser
              enviadas para{" "}
              <a href="mailto:contato@statusnaamerica.com" className="text-gold underline underline-offset-4 hover:text-gold/80">
                contato@statusnaamerica.com
              </a>.
            </p>
          </div>
        </section>

        <div className="mt-14 flex flex-wrap gap-4 text-sm">
          <Link to="/termos" className="text-gold hover:text-gold/80 underline underline-offset-4">
            Ver Termos de Uso
          </Link>
          <Link to="/contato" className="text-gold hover:text-gold/80 underline underline-offset-4">
            Falar com a equipe
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
