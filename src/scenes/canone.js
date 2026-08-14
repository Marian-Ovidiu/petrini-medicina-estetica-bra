import { gsap, ScrollTrigger, reducedMotion } from "../core/scroll.js";
import { pointer, onPointer } from "../core/pointer.js";

/**
 * 02 · CANONE — la costruzione.
 *
 * Le linee non compaiono in dissolvenza: si *disegnano*, una dopo
 * l'altra, con una sosta prima che arrivino le quote. È il ritmo di
 * una mano che misura, ed è la ragione per cui questa scena non
 * assomiglia a un grafico animato.
 *
 * Il puntatore muove la sorgente di luce sul ritratto. Non è un
 * effetto: è l'argomento della scena — la luce è ciò che rivela
 * l'architettura, quindi spostarla cambia cosa si vede.
 */
export function initCanone() {
  const scene = document.querySelector("#canone");
  if (!scene) return;

  const lines = scene.querySelectorAll("[data-c-line]");
  const dots = scene.querySelectorAll("[data-c-dot]");
  const quote = scene.querySelectorAll("[data-c-quota]");
  const scarto = scene.querySelector("[data-canone-scarto]");
  const lastra = scene.querySelector("[data-canone-lastra]");

  // Stato di partenza: foglio bianco. Anche con reduced-motion il
  // disegno esiste — semplicemente è già finito.
  const prep = (el) => {
    const len = el.getTotalLength?.() ?? 0;
    if (!len) return;
    gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
  };
  lines.forEach(prep);

  if (reducedMotion) {
    gsap.set(lines, { strokeDashoffset: 0 });
    gsap.set([dots, quote, scarto], { opacity: 1, scale: 1 });
    return;
  }

  gsap.set(dots, { opacity: 0, scale: 0 });
  gsap.set(quote, { opacity: 0, x: -8 });
  gsap.set(scarto, { opacity: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: lastra,
      start: "top 78%",
      end: "bottom 60%",
      scrub: 1.1,
    },
  });

  // I quattro orizzontali si tracciano dall'alto verso il basso,
  // sfalsati: il disegno ha una direzione.
  tl.to(lines, {
    strokeDashoffset: 0,
    duration: 1,
    ease: "power2.inOut",
    stagger: { each: 0.22, from: "start" },
  })
    // I punti si agganciano ai landmark con uno scatto secco —
    // l'unico movimento meccanico della pagina, ed è voluto:
    // è il rumore di uno strumento che si posa.
    .to(
      dots,
      {
        opacity: 1,
        scale: 1,
        duration: 0.22,
        ease: "back.out(3)",
        stagger: 0.1,
      },
      0.55
    )
    // Sosta. Poi le quote, che sono lettura, non disegno.
    .to(
      quote,
      { opacity: 1, x: 0, duration: 0.4, ease: "power2.out", stagger: 0.12 },
      1.35
    )
    .to(scarto, { opacity: 1, duration: 0.4, ease: "power1.out" }, 1.9);

  // ── la luce ──────────────────────────────────────────────────
  // Una sorgente che si sposta sopra la fotografia in soft-light.
  // Niente WebGL: su un monocromo con modellato forte questo legge
  // già come luce che gira, e costa una proprietà compositata.
  if (pointer.fine) {
    lastra.classList.add("canone__lastra--viva");
    let inside = false;

    lastra.addEventListener("pointerenter", () => (inside = true));
    lastra.addEventListener("pointerleave", () => (inside = false));

    onPointer((p) => {
      if (!inside) return;
      const r = lastra.getBoundingClientRect();
      const x = ((p.spx - r.left) / r.width) * 100;
      const y = ((p.spy - r.top) / r.height) * 100;
      lastra.style.setProperty("--lx", `${x}%`);
      lastra.style.setProperty("--ly", `${y}%`);
    });
  }

  ScrollTrigger.refresh();
}
