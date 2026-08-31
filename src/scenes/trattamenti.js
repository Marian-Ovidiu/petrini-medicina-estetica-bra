import { pointer } from "../core/pointer.js";
import { ScrollTrigger } from "../core/scroll.js";

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
// La didascalia non è un sottotitolo: da quando le zone sono pozze
// di luce e non più segni colorati, è l'unico posto in cui le
// strutture hanno un nome. Chi non vede la lastra ha solo questa, e
// chi la vede ci legge quello che la luce non sa dire — che quella
// pozza sul ramo della mandibola è il bruxismo e non una guancia.
// Va tenuta allineata alle forme dell'SVG: «profilo mento» stava qui
// da quando il mento era una delle zone, ed è rimasta a nominare una
// forma che il cliente aveva già fatto togliere.
const ZONE = {
  botox: "fronte, zampe di gallina e bruxismo — <b>dove il muscolo lavora troppo</b>",
  filler:
    "zigomi, codice a barre, labbra, rughe marionetta e linea della mandibola — <b>dove serve sostegno</b>",
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

  /**
   * Prenota l'altezza della didascalia più lunga.
   *
   * È lo stesso salto di layout corretto in TOPOGRAFIA: cambiando
   * trattamento cambia il testo sotto la lastra; nel layout affiancato
   * cambia quindi l'altezza della riga e l'elenco si sposta sotto un
   * puntatore fermo. Il puntatore entra nella voce vicina, il testo
   * cambia ancora e i due stati possono rincorrersi all'infinito.
   *
   * Sotto i 900px testo e lastra sono in sequenza: la didascalia sta
   * dopo i comandi e non può spostarli, quindi prenotare spazio lì
   * lascerebbe soltanto un vuoto inutile.
   */
  const affiancato = window.matchMedia("(min-width: 900px)");

  function prenotaAltezza() {
    if (!didascalia) return;
    didascalia.style.minHeight = "";
    if (!affiancato.matches) return;

    const contenuto = didascalia.innerHTML;
    const ariaLive = didascalia.getAttribute("aria-live");
    // Le scritture usate solo per misurare non sono aggiornamenti da
    // annunciare: la regione live torna attiva dopo il ripristino.
    didascalia.setAttribute("aria-live", "off");
    let max = 0;
    for (const testo of Object.values(ZONE)) {
      didascalia.innerHTML = testo;
      max = Math.max(max, didascalia.offsetHeight);
    }
    didascalia.style.minHeight = `${Math.ceil(max)}px`;
    didascalia.innerHTML = contenuto;
    if (ariaLive === null) didascalia.removeAttribute("aria-live");
    else didascalia.setAttribute("aria-live", ariaLive);
  }

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

  // I font decidono gli a capo e quindi l'altezza da prenotare. Dopo
  // la misura vanno ricalcolati anche i trigger delle scene successive,
  // perché la nuova quota cambia le loro coordinate nel documento.
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    prenotaAltezza();
    ScrollTrigger.refresh();
  });

  let attesa;
  window.addEventListener("resize", () => {
    clearTimeout(attesa);
    attesa = setTimeout(() => {
      prenotaAltezza();
      ScrollTrigger.refresh();
    }, 180);
  });
}
