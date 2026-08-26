import { pointer } from "../core/pointer.js";

/**
 * 03 · TRATTAMENTI — quattro nomi, un volto.
 *
 * La scena fa una cosa sola: tiene allineati tre stati che devono
 * dire la stessa cosa — la voce accesa nell'elenco, il gruppo di
 * zone visibile sulla lastra, la didascalia che le nomina. Sono tre
 * perché tre sono i modi di leggerla: con gli occhi sull'elenco, con
 * gli occhi sulla fotografia, con uno screen reader.
 *
 * Il puntatore *anticipa* ma non decide: passando sopra una voce la
 * lastra la mostra, uscendo torna a quella scelta. È il
 * comportamento che rende l'elenco esplorabile col mouse senza
 * togliere a nessuno la possibilità di fermare una scelta — su touch,
 * dove l'anteprima non esiste, il tocco sceglie e basta.
 */
const ZONE = {
  botox: "fronte, glabella e zampe di gallina — <b>dove il muscolo muove la pelle</b>",
  filler: "zigomi, labbra, rughe marionetta e mento — <b>dove serve sostegno</b>",
  prx: "il viso intero — <b>un rinnovamento di superficie, senza un bersaglio</b>",
  bio: "viso, collo e décolleté — <b>dove la pelle perde qualità</b>",
};

export function initTrattamenti() {
  const scene = document.querySelector("#trattamenti");
  if (!scene) return;

  const bottoni = [...scene.querySelectorAll("[data-tratt]")];
  const gruppi = [...scene.querySelectorAll("[data-zona]")];
  const didascalia = scene.querySelector("[data-tratt-didascalia]");
  if (!bottoni.length) return;

  // La scelta ferma. L'anteprima del puntatore non la tocca: se la
  // sovrascrivesse, uscire dall'elenco lascerebbe la lastra su una
  // voce che nessuno ha scelto.
  let scelto = bottoni.find((b) => b.getAttribute("aria-pressed") === "true");
  scelto = scelto || bottoni[0];

  /** Mostra un trattamento sulla lastra. Non tocca la scelta. */
  const mostra = (chiave) => {
    gruppi.forEach((g) =>
      g.toggleAttribute("data-attivo", g.dataset.zona === chiave)
    );
    if (didascalia) didascalia.innerHTML = ZONE[chiave] ?? "";
  };

  const scegli = (bottone) => {
    scelto = bottone;
    bottoni.forEach((b) =>
      b.setAttribute("aria-pressed", String(b === bottone))
    );
    mostra(bottone.dataset.tratt);
  };

  bottoni.forEach((b) => {
    b.addEventListener("click", () => scegli(b));

    // Il focus sceglie, e non si limita ad anticipare: chi arriva
    // qui col tasto Tab non ha un secondo gesto per confermare, e
    // una freccia che scorre l'elenco senza cambiare la lastra
    // sarebbe una scena muta da tastiera.
    b.addEventListener("focus", () => scegli(b));

    if (pointer.fine) {
      b.addEventListener("pointerenter", () => mostra(b.dataset.tratt));
      b.addEventListener("pointerleave", () => mostra(scelto.dataset.tratt));
    }
  });

  scegli(scelto);
}
