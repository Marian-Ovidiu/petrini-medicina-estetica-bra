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
// `ox/oy` è il punto in cui l'anello si chiude: coincide col segno
// tracciato dal medico sulla lastra. `macro` è la documentazione
// ravvicinata che accompagna la scheda.
//
// I nomi visibili sono quelli con cui il medico parla ai pazienti —
// "zampe di gallina", "codice a barre" — perché sono quelli con cui
// i pazienti arrivano. Il latino non sparisce: resta nella riga
// tecnica sopra il titolo, che è il suo posto.
const REGIONI = {
  fronte: {
    ox: "40%", oy: "9%",
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
  zampe: {
    ox: "51.6%", oy: "32.8%",
    macro: "/media/img/oculus-560.avif",
    lat: "musculus orbicularis oculi, pars lateralis",
    nome: "Zampe di gallina",
    obiettivo: "Ammorbidire le rughe della risata mantenendo il sorriso vero.",
    ragionamento:
      "L'orbicolare lavora anche quando l'occhio sorride. Si tratta la porzione laterale e si lascia intatta quella che chiude la palpebra.",
    procedura: "Tossina botulinica, 3 punti per lato, superficiale.",
    durata: "10 minuti",
    recupero: "Possibile ecchimosi puntiforme per 2–3 giorni.",
  },
  zigomo: {
    ox: "50.7%", oy: "46.9%",
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
  codice: {
    ox: "16.2%", oy: "63%",
    macro: "/media/img/labium-560.avif",
    lat: "rugae peribuccales",
    nome: "Codice a barre",
    obiettivo:
      "Attenuare le righe verticali del labbro superiore senza appesantire la bocca.",
    ragionamento:
      "Nascono dalla contrazione ripetuta dell'orbicolare su un bordo che ha perso sostegno. Riempirle una per una le rende più evidenti: si restituisce prima il bordo, poi si lavora in superficie.",
    procedura:
      "Micro-infiltrazioni di acido ialuronico a bassa densità; tossina a dose minima sull'orbicolare.",
    durata: "25 minuti",
    recupero: "Piccoli pomfi per 24 ore.",
  },
  labbra: {
    ox: "16%", oy: "69.6%",
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
  marionetta: {
    ox: "37%", oy: "71.1%",
    macro: "/media/img/mandibula-560.avif",
    lat: "sulcus labiomandibularis",
    nome: "Rughe marionetta",
    obiettivo:
      "Sollevare l'angolo della bocca e attenuare il solco che scende verso il mento.",
    ragionamento:
      "Il solco non si riempie: si sostiene. Scende perché il depressore tira verso il basso e perché è mancato l'appoggio sopra. Trattarlo direttamente, senza ricostruire il sostegno, lascia un cordone visibile.",
    procedura:
      "Tossina sul depressore dell'angolo della bocca; filler strutturale davanti alla mandibola.",
    durata: "20 minuti",
    recupero: "48 ore di gonfiore contenuto.",
  },
  bruxismo: {
    ox: "78.5%", oy: "72.7%",
    macro: "/media/img/mandibula-560.avif",
    lat: "musculus masseter",
    nome: "Curare bruxismo",
    obiettivo:
      "Ridurre la forza di serramento e l'ipertrofia del massetere che allarga il terzo inferiore.",
    ragionamento:
      "Il trattamento agisce sul muscolo, non sulla causa: il bruxismo resta e va gestito anche altrove. Riducendo la forza si tolgono il dolore mattutino, l'usura dello smalto e il volume dell'angolo — la masticazione non si perde.",
    procedura:
      "Tossina botulinica sul massetere, 3 punti per lato, intramuscolo profondo.",
    durata: "15 minuti",
    recupero:
      "Nessuno. Effetto sulla forza in 2 settimane, sul volume in 2–3 mesi.",
  },
  mento: {
    ox: "51.6%", oy: "86.6%",
    macro: "/media/img/mandibula-560.avif",
    lat: "musculus mentalis — pogonion",
    nome: "Profilo mento",
    obiettivo: "Correggere la proiezione e distendere la buccia d'arancia.",
    ragionamento:
      "Un mento corto accorcia otticamente tutto il profilo e carica il collo. Spesso è qui che si risolve un problema che il paziente attribuisce alla mandibola.",
    procedura: "Filler strutturale in profondità; tossina sul mentale.",
    durata: "20 minuti",
    recupero: "48 ore di gonfiore contenuto.",
  },
};

export function initTopografia() {
  const scene = document.querySelector("#topografia");
  if (!scene) return;

  const campo = scene.querySelector("[data-topo-campo]");
  const bottoni = [...scene.querySelectorAll("[data-topo-regione]")];
  const anello = scene.querySelector("[data-topo-anello]");
  const macro = scene.querySelector("[data-d-macro]");
  const istruzione = scene.querySelector("[data-topo-istruzione]");
  // Su un telefono non ci si "avvicina" a niente.
  if (istruzione && !pointer.fine) {
    istruzione.textContent = "tocca una regione del profilo";
  }
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
  // L'apertura automatica all'ingresso non è un'interazione: se la
  // conta come tale, l'istruzione si spegne mezzo secondo dopo
  // l'arrivo e non la legge nessuno — che è esattamente il motivo per
  // cui la scena sembra priva di istruzioni.
  let toccato = false;

  function mostra(chiave) {
    if (chiave === corrente) return;
    corrente = chiave;

    const r = chiave ? REGIONI[chiave] : null;

    bottoni.forEach((b) =>
      b.toggleAttribute("data-attivo", b.dataset.topoRegione === chiave)
    );
    if (chiave) campo.dataset.regione = chiave;
    else delete campo.dataset.regione;

    if (istruzione) istruzione.style.opacity = toccato ? "0" : "";

    // L'anello si sposta sul landmark. La fotografia non si muove:
    // resta bloccata alla propria sagoma.
    if (anello && r) {
      anello.style.setProperty("--ox", r.ox);
      anello.style.setProperty("--oy", r.oy);
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

  /** La regione il cui punto è più vicino a una coordinata di schermo. */
  function piuVicina(sx, sy) {
    let vicino = null;
    let min = Infinity;
    for (const b of bottoni) {
      const r = b.getBoundingClientRect();
      const d = Math.hypot(sx - (r.left + r.width / 2), sy - (r.top + r.height / 2));
      if (d < min) {
        min = d;
        vicino = { chiave: b.dataset.topoRegione, distanza: min };
      }
    }
    return vicino;
  }

  // Il volto *è* l'interfaccia: si tocca la faccia, non un bersaglio.
  // Un tocco ovunque sulla lastra sceglie la regione più vicina, quindi
  // la precisione richiesta non dipende più da quanto sono distanti fra
  // loro i punti — che su schermo piccolo arrivano a 26px.
  campo.addEventListener("click", (e) => {
    if (e.target.closest("[data-topo-regione]")) return; // già gestito
    const v = piuVicina(e.clientX, e.clientY);
    if (v) { toccato = true; mostra(v.chiave); }
  });

  // Tastiera e touch: intento esplicito, nessuna distanza da calcolare.
  bottoni.forEach((b) => {
    const k = b.dataset.topoRegione;
    b.addEventListener("focus", () => { toccato = true; mostra(k); });
    b.addEventListener("click", () => { toccato = true; mostra(k); });
    b.addEventListener("pointerenter", () => { toccato = true; mostra(k); });
  });

  // Puntatore fine: la regione più vicina vince, ma solo entro un
  // raggio. Fuori da quel raggio nessuna regione è attiva — il volto
  // torna intero, e l'assenza di selezione è uno stato leggibile.
  if (pointer.fine && !reducedMotion) {
    onPointer(() => {
      // Senza questo il ciclo gira comunque, calcola la regione più
      // vicina al centro del viewport e sovrascrive a ogni frame la
      // scelta fatta col focus o col clic: chi naviga da tastiera
      // vedeva sempre e solo l'ultima regione.
      if (!pointer.active) return;

      const r = campo.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;

      const soglia = r.width * 0.42;
      const v = piuVicina(pointer.spx, pointer.spy);
      const dentro = v && v.distanza < soglia;
      if (dentro) toccato = true;
      mostra(dentro ? v.chiave : null);
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
