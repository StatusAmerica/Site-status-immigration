/**
 * Patches (selos) desenhados em SVG para a dobra "Registros e presença institucional".
 * Cada patch faz referência visual direta ao conteúdo do campo:
 *   - BBB Rating A       -> escudo com "A" e fita
 *   - Avaliações Google  -> "G" nas cores oficiais + estrelas
 *   - EIN (EUA)          -> selo com bandeira dos EUA e "EIN"
 * Sem dependência externa, sem imagens raster.
 */
import { FlagUS } from "./flags";

const RING = "absolute inset-0 rounded-full border border-gold/60";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-grid place-items-center h-20 w-20 rounded-full bg-white shadow-soft">
      <span aria-hidden className={RING} />
      <span aria-hidden className="absolute inset-[3px] rounded-full border border-gold/25" />
      {children}
    </span>
  );
}

/** Escudo com nota "A" e fita — referência ao BBB Rating A. */
export function PatchBBB() {
  return (
    <Frame>
      <svg viewBox="0 0 40 40" className="h-12 w-12" aria-hidden>
        <path
          d="M20 4l11 4v11c0 8-5.4 13.4-11 16-5.6-2.6-11-8-11-16V8l11-4z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="text-oxblood"
        />
        <text
          x="20"
          y="24"
          textAnchor="middle"
          className="fill-oxblood"
          style={{ font: "700 22px ui-serif, Georgia, serif" }}
        >
          A
        </text>
        <path d="M14 31l6 3 6-3" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-gold" />
      </svg>
    </Frame>
  );
}

/** "G" nas cores do Google + estrelas — referência às avaliações 5★. */
export function PatchGoogle() {
  return (
    <Frame>
      <span className="flex flex-col items-center leading-none">
        <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
          <path fill="#4285F4" d="M23 12.2c0-.8-.07-1.6-.2-2.3H12v4.4h6.1a5.3 5.3 0 01-2.3 3.5v2.9h3.7c2.2-2 3.5-5 3.5-8.5z" />
          <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.6-2-6.5-4.8H1.7v3A12 12 0 0012 24z" />
          <path fill="#FBBC05" d="M5.5 14.6a7.2 7.2 0 010-4.6v-3H1.7a12 12 0 000 10.6l3.8-3z" />
          <path fill="#EA4335" d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.6 11.6 0 0012 0 12 12 0 001.7 6l3.8 3C6.4 6.7 9 4.8 12 4.8z" />
        </svg>
        <span aria-hidden className="mt-1 text-[10px] tracking-[0.1em] text-[#F5A623]">★★★★★</span>
      </span>
    </Frame>
  );
}

/** Bandeira dos EUA em selo — referência ao EIN (registro nos EUA). */
export function PatchEIN() {
  return (
    <Frame>
      <span className="flex flex-col items-center gap-1">
        <FlagUS className="w-10 rounded-[2px]" style={{ height: 18 }} />
        <span className="font-mono-label text-[10px] text-ink-text/70">USA</span>
      </span>
    </Frame>
  );
}
