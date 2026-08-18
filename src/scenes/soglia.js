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
 * Una hairline di sanguigna disegna un profilo, poi la firma si
 * scrive sotto. Quando il marchio è composto, si apre e lascia
 * passare la luce. È il primo stato de LA LINEA — la stessa linea
 * che attraverserà tutto il documento — e insieme il modo in cui il
 * lockup di testata arriva: non compare, si è appena formato.
 */
export function initSoglia() {
  const soglia = document.querySelector("#soglia");
  if (!soglia) return Promise.resolve();

  const path = soglia.querySelector(".soglia__profilo");
  const nomen = soglia.querySelector("[data-nomen]");
  const firma = soglia.querySelector("[data-soglia-firma]");

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
      // La firma parte prima che il profilo abbia finito. Non è un
      // risparmio di tempo: due gesti in fila si guardano come una
      // lista, due gesti che si accavallano si guardano come una
      // mano sola che continua a scrivere. La sovrapposizione è
      // corta — il mento del profilo si sta ancora chiudendo.
      //
      // 0,85s è il tempo di scrivere un nome, non di rivelare
      // un'immagine: sotto sembra uno scatto, sopra un caricamento.
      .to(
        firma,
        {
          "--scrittura": "112%",
          duration: 0.85,
          // La mano parte, non accelera: `power1.out` toglie
          // l'avvio molle che farebbe leggere il gesto come una
          // dissolvenza. Oltre il 100% perché la sfumatura della
          // lama deve uscire dal bordo destro, altrimenti l'ultima
          // `i` resta più pallida del resto per sempre.
          ease: "power1.out",
        },
        1.0
      )
      // Pausa. Il marchio composto resta fermo un istante prima di
      // aprirsi: è la sosta che rende il movimento successivo un
      // evento.
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
