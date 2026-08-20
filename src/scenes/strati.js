import { gsap, ScrollTrigger, reducedMotion } from "../core/scroll.js";

const PIANI = [
  { fino: 0.26, nome: "superficie" },
  { fino: 0.52, nome: "volume" },
  { fino: 0.78, nome: "muscolo" },
  { fino: 1.01, nome: "osso" },
];

/**
 * 03 · STRATI — il piano che attraversa.
 *
 * Un solo elemento si muove: una linea. Tutto il resto — il ritaglio
 * dello strato anatomico, l'etichetta, la riga accesa nell'elenco —
 * è conseguenza della sua posizione. È il motivo per cui la scena
 * legge come un attraversamento e non come quattro animazioni.
 */
export function initStrati() {
  const scene = document.querySelector("#strati");
  if (!scene) return;

  const telaio = scene.querySelector("[data-strati-telaio]");
  const etichetta = scene.querySelector("[data-strati-etichetta]");
  const voci = [...scene.querySelectorAll("[data-strati-elenco] li")];

  const applica = (p) => {
    telaio.style.setProperty("--piano", `${p * 100}%`);
    const i = PIANI.findIndex((s) => p < s.fino);
    const idx = i === -1 ? PIANI.length - 1 : i;
    if (etichetta && etichetta.textContent !== PIANI[idx].nome) {
      etichetta.textContent = PIANI[idx].nome;
    }
    voci.forEach((v, n) => v.toggleAttribute("data-attivo", n === idx));
  };

  if (reducedMotion) {
    // Il piano si ferma a metà: la scena mostra comunque le due
    // condizioni — fotografia sopra, anatomia sotto — senza muoversi.
    applica(0.5);
    return;
  }

  applica(0);

  const stato = { p: 0 };
  gsap.to(stato, {
    p: 1,
    ease: "none",
    onUpdate: () => applica(stato.p),
    scrollTrigger: {
      trigger: scene,
      start: "top 68%",
      end: "bottom 78%",
      scrub: 0.8,
    },
  });

  ScrollTrigger.refresh();
}
