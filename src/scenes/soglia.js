import { gsap, reducedMotion } from "../core/scroll.js";

// La nomenclatura scorre mentre la linea disegna. È il primo contatto
// col doppio registro del brand: latino clinico sotto, bellezza sopra.
const NOMEN = [
  "os frontale",
  "arcus superciliaris",
  "orbita",
  "os zygomaticum",
  "sulcus nasolabialis",
  "labium superius",
  "mandibula",
  "angulus mandibulae",
];

/**
 * SOGLIA — nessun contatore di percentuale.
 *
 * Una hairline di sanguigna disegna un profilo. Quando ha finito,
 * si apre e lascia passare la luce. È il primo stato de LA LINEA:
 * la stessa linea che attraverserà tutto il documento.
 */
export function initSoglia() {
  const soglia = document.querySelector("#soglia");
  if (!soglia) return Promise.resolve();

  const path = soglia.querySelector(".soglia__profilo");
  const nomen = soglia.querySelector("[data-nomen]");

  if (reducedMotion) {
    soglia.remove();
    document.body.classList.add("is-pronto");
    return Promise.resolve();
  }

  document.body.classList.add("is-soglia");

  const len = path.getTotalLength();
  gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });

  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        soglia.remove();
        document.body.classList.remove("is-soglia");
        document.body.classList.add("is-pronto");
        resolve();
      },
    });

    tl.to(path, {
      strokeDashoffset: 0,
      duration: 1.5,
      // Il tratto parte deciso e rallenta arrivando al mento: è il
      // ritmo di una mano che disegna, non di una barra che si riempie.
      ease: "power2.inOut",
    })
      .to(
        nomen,
        {
          duration: 1.5,
          ease: "none",
          onUpdate() {
            const i = Math.min(
              NOMEN.length - 1,
              Math.floor(this.progress() * NOMEN.length)
            );
            if (nomen.textContent !== NOMEN[i]) nomen.textContent = NOMEN[i];
          },
        },
        0
      )
      // Pausa. Il disegno resta fermo un istante prima di aprirsi:
      // è la sosta che rende il movimento successivo un evento.
      .to({}, { duration: 0.35 })
      .to(nomen, { opacity: 0, duration: 0.3, ease: "power1.in" })
      .to(
        path,
        { strokeDashoffset: -len, duration: 0.9, ease: "power3.in" },
        "<0.1"
      )
      .to(soglia, { opacity: 0, duration: 0.7, ease: "power2.inOut" }, "<0.35");
  });
}
