import { gsap, ScrollTrigger, reducedMotion } from "../core/scroll.js";
import { pointer, onPointer } from "../core/pointer.js";

/**
 * 04 · TOPOGRAFIA — il volto come interfaccia.
 *
 * Non c'è una griglia di card. C'è un profilo, e le regioni
 * anatomiche sono i comandi. La prossimità del puntatore decide,
 * in modo continuo, quale regione sta emergendo: non c'è un
 * confine on/off, c'è una distanza.
 *
 * Ogni punto è comunque un <button>: chi naviga da tastiera
 * attraversa la stessa scena, con la stessa informazione.
 */
// `ox/oy` è il punto della fotografia in cui la camera entra: coincide
// col landmark, non col centro dell'immagine. `macro` è la
// documentazione ravvicinata che accompagna la scheda.
const REGIONI = {
  fronte: {
    ox: "40%",
    oy: "14%",
    macro: "/media/img/oculus-560.avif",
    lat: "regio frontalis",
    nome: "Fronte",
    obiettivo: "Ridurre le rughe dinamiche senza spegnere l'espressione.",
    ragionamento:
      "Il frontale è l'unico elevatore del sopracciglio. Bloccarlo del tutto abbassa lo sguardo: si dosa per lasciargli un residuo di corsa.",
    procedura: "Tossina botulinica, punti multipli, dose frazionata.",
    durata: "15 minuti",
    recupero: "Nessuno. Effetto pieno in 10–14 giorni.",
  },
  perioculare: {
    ox: "31%",
    oy: "30%",
    macro: "/media/img/oculus-560.avif",
    lat: "musculus orbicularis oculi",
    nome: "Perioculare",
    obiettivo: "Ammorbidire le rughe della risata mantenendo il sorriso vero.",
    ragionamento:
      "L'orbicolare lavora anche quando l'occhio sorride. Si tratta la porzione laterale e si lascia intatta quella che chiude la palpebra.",
    procedura: "Tossina botulinica, 3 punti per lato, superficiale.",
    durata: "10 minuti",
    recupero: "Possibile ecchimosi puntiforme per 2–3 giorni.",
  },
  zigomo: {
    ox: "46%",
    oy: "42%",
    macro: "/media/img/zygoma-560.avif",
    lat: "os zygomaticum",
    nome: "Zigomo",
    obiettivo: "Restituire proiezione e sostegno al terzo medio.",
    ragionamento:
      "La guancia non scende perché è vuota: scende perché ha perso l'appoggio osseo. Si ricostruisce il sostegno in profondità, non il volume in superficie.",
    procedura: "Filler ad alta coesività, piano sovraperiosteo, bolo.",
    durata: "25 minuti",
    recupero: "Gonfiore 48 ore. Assestamento a 3 settimane.",
  },
  labbra: {
    ox: "17%",
    oy: "63%",
    macro: "/media/img/labium-560.avif",
    lat: "labium superius et inferius",
    nome: "Labbra",
    obiettivo: "Definire il bordo e restituire idratazione, non aumentare.",
    ragionamento:
      "Il labbro invecchia perdendo bordo e proiezione dell'arco di Cupido, non volume. Riempirlo senza ridisegnarlo produce quella bocca che si riconosce da lontano.",
    procedura: "Filler a bassa densità, retrotraccia lineare sul vermiglio.",
    durata: "30 minuti",
    recupero: "Gonfiore marcato 24–72 ore. Risultato reale a 2 settimane.",
  },
  mento: {
    ox: "25%",
    oy: "78%",
    macro: "/media/img/mandibula-560.avif",
    lat: "musculus mentalis",
    nome: "Mento",
    obiettivo: "Correggere la proiezione e distendere la buccia d'arancia.",
    ragionamento:
      "Un mento corto accorcia otticamente tutto il profilo e carica il collo. Spesso è qui che si risolve un problema che il paziente attribuisce alla mandibola.",
    procedura: "Filler strutturale in profondità; tossina sul mentale.",
    durata: "20 minuti",
    recupero: "48 ore di gonfiore contenuto.",
  },
  mandibola: {
    ox: "51%",
    oy: "80%",
    macro: "/media/img/mandibula-560.avif",
    lat: "angulus mandibulae",
    nome: "Mandibola",
    obiettivo: "Rendere leggibile il contorno tra viso e collo.",
    ragionamento:
      "Si lavora sul bordo, non sull'angolo, se l'obiettivo è la linea. Sull'angolo si interviene quando il massetere è ipertrofico e allarga il terzo inferiore.",
    procedura: "Filler sul bordo mandibolare; tossina sul massetere.",
    durata: "30 minuti",
    recupero: "Nessuno per il filler; 2 settimane per l'effetto sul massetere.",
  },
};

export function initTopografia() {
  const scene = document.querySelector("#topografia");
  if (!scene) return;

  const campo = scene.querySelector("[data-topo-campo]");
  const bottoni = [...scene.querySelectorAll("[data-topo-regione]")];
  const profilo = scene.querySelector("[data-topo-profilo]");
  const macro = scene.querySelector("[data-d-macro]");
  const istruzione = scene.querySelector("[data-topo-istruzione]");
  const out = {
    lat: scene.querySelector("[data-d-lat]"),
    nome: scene.querySelector("[data-d-nome]"),
    obiettivo: scene.querySelector("[data-d-obiettivo]"),
    ragionamento: scene.querySelector("[data-d-ragionamento]"),
    procedura: scene.querySelector("[data-d-procedura]"),
    durata: scene.querySelector("[data-d-durata]"),
    recupero: scene.querySelector("[data-d-recupero]"),
  };

  let corrente = null;

  function mostra(chiave) {
    if (chiave === corrente) return;
    corrente = chiave;

    const r = chiave ? REGIONI[chiave] : null;

    bottoni.forEach((b) =>
      b.toggleAttribute("data-attivo", b.dataset.topoRegione === chiave)
    );
    if (chiave) campo.dataset.regione = chiave;
    else delete campo.dataset.regione;

    if (istruzione) istruzione.style.opacity = chiave ? "0" : "";

    // Senza regione la camera torna al profilo intero: l'assenza di
    // selezione è uno stato, non un buco.
    if (profilo) {
      profilo.style.setProperty("--zoom", r ? "2.15" : "1");
      if (r) {
        profilo.style.setProperty("--ox", r.ox);
        profilo.style.setProperty("--oy", r.oy);
      }
    }

    if (!r) return;
    if (macro && r.macro) macro.src = r.macro;

    out.lat.textContent = r.lat;
    out.nome.textContent = r.nome;
    out.obiettivo.textContent = r.obiettivo;
    out.ragionamento.textContent = r.ragionamento;
    out.procedura.textContent = r.procedura;
    out.durata.textContent = r.durata;
    out.recupero.textContent = r.recupero;
  }

  // Tastiera e touch: intento esplicito, nessuna distanza da calcolare.
  bottoni.forEach((b) => {
    const k = b.dataset.topoRegione;
    b.addEventListener("focus", () => mostra(k));
    b.addEventListener("click", () => mostra(k));
    b.addEventListener("pointerenter", () => mostra(k));
  });

  // Puntatore fine: la regione più vicina vince, ma solo entro un
  // raggio. Fuori da quel raggio nessuna regione è attiva — il volto
  // torna intero, e l'assenza di selezione è uno stato leggibile.
  if (pointer.fine && !reducedMotion) {
    onPointer(() => {
      const r = campo.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;

      const soglia = r.width * 0.42;
      let vicino = null;
      let min = Infinity;

      for (const b of bottoni) {
        const br = b.getBoundingClientRect();
        const d = Math.hypot(
          pointer.spx - (br.left + br.width / 2),
          pointer.spy - (br.top + br.height / 2)
        );
        if (d < min) {
          min = d;
          vicino = b.dataset.topoRegione;
        }
      }
      mostra(min < soglia ? vicino : null);
    });
  }

  // All'ingresso della scena una regione si apre da sola: nessuno
  // deve indovinare che il volto è un comando.
  ScrollTrigger.create({
    trigger: scene,
    start: "top 55%",
    once: true,
    onEnter: () => {
      if (!corrente) gsap.delayedCall(0.5, () => mostra("zigomo"));
    },
  });
}
