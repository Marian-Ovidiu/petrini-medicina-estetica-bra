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
    ox: "46%", oy: "24%",
    macro: "/media/img/oculus-560.avif",
    lat: "regio frontalis",
    nome: "Fronte",
    obiettivo:
      "Distendere le righe orizzontali della fronte senza togliere espressione allo sguardo.",
    ragionamento:
      "Le righe orizzontali sono la piega della pelle sopra l'unico muscolo che alza il sopracciglio. Toglierne tutta la forza fa scendere il sopracciglio e chiude lo sguardo: il volto sembra più stanco, non più riposato. Si riduce l'ampiezza della contrazione lasciando al muscolo un residuo di corsa.",
    procedura:
      "Tossina botulinica, dose frazionata su più punti, piano superficiale.",
    durata: "15 minuti",
    recupero: "Nessuno. Effetto pieno in 10–14 giorni.",
  },
  zampe: {
    ox: "35%", oy: "37%",
    macro: "/media/img/oculus-560.avif",
    lat: "musculus orbicularis oculi, pars lateralis",
    nome: "Zampe di gallina",
    obiettivo:
      "Ammorbidire le pieghe dell'angolo esterno dell'occhio lasciando intatto il sorriso.",
    ragionamento:
      "L'orbicolare è un anello: la porzione laterale increspa la pelle sottile dell'angolo esterno, quella interna chiude la palpebra e distribuisce il film lacrimale. Si tratta solo la prima. Ed è la stessa contrazione che rende vero un sorriso: spenta del tutto, il sorriso resta alla bocca e l'occhio non partecipa più.",
    procedura:
      "Tossina botulinica, tre punti per lato sulla porzione laterale, piano superficiale.",
    durata: "10 minuti",
    recupero: "Possibile ecchimosi puntiforme per 2–3 giorni.",
  },
  zigomo: {
    ox: "32%", oy: "45%",
    macro: "/media/img/zygoma-560.avif",
    lat: "os zygomaticum",
    nome: "Zigomo",
    obiettivo:
      "Restituire appoggio al terzo medio, non volume alla guancia.",
    ragionamento:
      "La guancia non scende perché si è svuotata: scende perché ha perso l'appoggio sotto. Il grasso del volto sta in compartimenti che poggiano sull'osso, e quando l'osso arretra scivolano verso il basso accumulandosi sopra il solco. Riempire l'avvallamento aggiunge peso a un tessuto già disceso: si ricostruisce il piano d'appoggio in profondità, e quello che sta sopra ritrova sostegno.",
    procedura:
      "Filler ad alta coesività, piano sovraperiosteo, deposito a bolo sull'arco zigomatico.",
    durata: "25 minuti",
    recupero: "Gonfiore 48 ore. Assestamento a 3 settimane.",
  },
  codice: {
    ox: "56%", oy: "61%",
    macro: "/media/img/labium-560.avif",
    lat: "rugae peribuccales",
    nome: "Codice a barre",
    obiettivo:
      "Attenuare le righe verticali del labbro superiore senza appesantire la bocca.",
    ragionamento:
      "Le fibre dell'orbicolare della bocca si inseriscono nella pelle: ogni parola la piega nello stesso punto. La piega resta quando il derma si assottiglia e il bordo del labbro perde proiezione. Riempire riga per riga alza una cresta che in movimento si vede di più: si restituisce prima il sostegno del bordo, poi si riduce la forza che piega.",
    procedura:
      "Acido ialuronico a bassa densità, micro-infiltrazioni intradermiche; tossina botulinica a dose minima sull'orbicolare.",
    durata: "25 minuti",
    recupero: "Piccoli pomfi per 24 ore.",
  },
  labbra: {
    ox: "59%", oy: "65%",
    macro: "/media/img/labium-560.avif",
    lat: "labium superius et inferius",
    nome: "Labbra",
    obiettivo:
      "Ridisegnare il bordo e restituire proiezione. Non aumentare.",
    ragionamento:
      "Un labbro non invecchia svuotandosi: si arrotola verso l'interno, il filtro si allunga, l'arco di Cupido si appiattisce. Il volume messo in un labbro che ha perso il margine non ha più niente che lo contenga e va in avanti: è la bocca che si riconosce da lontano. Si ricostruisce prima il margine, perché è il margine a dare proiezione senza volume.",
    procedura:
      "Filler a bassa densità, retrotraccia lineare sul vermiglio e sulle colonne del filtro.",
    durata: "30 minuti",
    recupero: "Gonfiore marcato 24–72 ore. Risultato reale a 2 settimane.",
  },
  marionetta: {
    ox: "50%", oy: "69%",
    macro: "/media/img/mandibula-560.avif",
    lat: "sulcus labiomandibularis",
    nome: "Rughe marionetta",
    obiettivo:
      "Rialzare l'angolo della bocca e attenuare il solco che scende verso il mento.",
    ragionamento:
      "Il solco è il punto in cui due cose si sommano: un muscolo che tira l'angolo della bocca verso il basso, e un sostegno venuto meno più in alto che scarica peso proprio lì. Riempirlo e basta lascia un cordone che si vede appena la persona parla. Si toglie prima la trazione, poi si ricostruisce l'appoggio davanti alla mandibola.",
    procedura:
      "Tossina botulinica sul depressor anguli oris; filler strutturale in profondità davanti al corpo mandibolare.",
    durata: "20 minuti",
    recupero: "48 ore di gonfiore contenuto.",
  },
  bruxismo: {
    ox: "23%", oy: "54%",
    macro: "/media/img/mandibula-560.avif",
    lat: "musculus masseter",
    nome: "Curare bruxismo",
    obiettivo:
      "Ridurre la forza del serramento e il volume che allarga il terzo inferiore.",
    ragionamento:
      "Il massetere risponde al carico come ogni muscolo: serrare per ore ogni notte lo fa crescere, e un muscolo più grosso serra più forte. Il circolo si alimenta da solo, e ridurre la contrazione lo interrompe: cala prima la forza, poi il volume dell'angolo. La causa del bruxismo resta e si affronta altrove; qui si tratta l'effetto.",
    procedura:
      "Tossina botulinica intramuscolo profondo, tre punti per lato sul ventre del massetere.",
    durata: "15 minuti",
    recupero:
      "Nessuno. Effetto sulla forza in 2 settimane, sul volume in 2–3 mesi.",
  },
  mento: {
    ox: "57%", oy: "73%",
    macro: "/media/img/mandibula-560.avif",
    lat: "musculus mentalis — pogonion",
    nome: "Profilo mento",
    obiettivo:
      "Dare al mento la proiezione che regge il profilo, e distendere la buccia d'arancia.",
    ragionamento:
      "Il mento è l'appoggio anteriore di tutto il terzo inferiore: se arretra, il profilo si accorcia e la linea verso il collo perde definizione. Spesso il problema che si attribuisce alla mandibola nasce qui. La buccia d'arancia è un'altra cosa: è il mentale che spinge in alto e increspa una pelle sottile ancorata all'osso. Due meccanismi, due gesti distinti.",
    procedura:
      "Filler strutturale su piano sovraperiosteo al pogonion; tossina botulinica sul musculus mentalis.",
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
    istruzione.textContent = "tocca una regione del volto";
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

  const dossier = scene.querySelector("[data-topo-dossier]");
  const CAMPI = Object.keys(out);
  const iniziale = Object.fromEntries(
    CAMPI.map((k) => [k, out[k] ? out[k].textContent : ""])
  );
  const scrivi = (r) => {
    for (const k of CAMPI) if (out[k]) out[k].textContent = r[k];
  };

  /**
   * Prenota l'altezza del dossier più lungo.
   *
   * È la correzione di un bug che sembrava del puntatore e invece era
   * di layout, e la catena vale la pena scriverla perché non si vede
   * leggendo nessuna delle due parti da sola:
   *
   *   cambia regione → cambia il testo → cambia l'altezza del dossier
   *   → cambia l'altezza della scena → se la scena cresce abbastanza
   *   da uscire dal viewport in basso, tutto scorre sotto un puntatore
   *   *fermo* → la regione più vicina diventa un'altra → cambia il
   *   testo, e si ricomincia.
   *
   * Il dossier sbatteva fra due regioni all'infinito finché non si
   * muoveva il mouse. L'isteresi qui sotto smorza, ma non basta: la
   * causa è il salto di layout, e si toglie prenotando una volta sola
   * l'altezza del testo più lungo. Otto reflow all'avvio, mai più.
   *
   * Solo da 1000px in su, dove lastra e scheda stanno affiancate e
   * l'altezza della scena la detta il dossier. Sotto, la lastra è
   * appiccicata in alto e la scheda le scorre sotto: lì prenotare
   * l'altezza massima lascerebbe solo un buco sotto le schede corte.
   */
  const affiancato = window.matchMedia("(min-width: 1000px)");

  function prenotaAltezza() {
    if (!dossier) return;
    dossier.style.minHeight = "";
    if (!affiancato.matches) return;

    let max = 0;
    for (const r of Object.values(REGIONI)) {
      scrivi(r);
      max = Math.max(max, dossier.offsetHeight);
    }
    dossier.style.minHeight = `${Math.ceil(max)}px`;
    // Rimette quello che c'era: il testo iniziale se nessuna regione è
    // ancora aperta, altrimenti quella aperta.
    scrivi(corrente ? REGIONI[corrente] : iniziale);
  }

  let corrente = null;
  // L'apertura automatica all'ingresso non è un'interazione: se la
  // conta come tale, l'istruzione si spegne mezzo secondo dopo
  // l'arrivo e non la legge nessuno — che è esattamente il motivo per
  // cui la scena sembra priva di istruzioni.
  let toccato = false;

  // Finché nessuno ha interagito, la scena si presenta: l'anello
  // respira. Al primo gesto vero smette.
  campo.dataset.invito = "";

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
    if (toccato) delete campo.dataset.invito;

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

      // Isteresi. Senza, sul confine fra due regioni non serve niente
      // per rubare la selezione: basta che l'altra sia più vicina di
      // un capello, e il tremolio di una mano ferma su un mouse vero
      // ci passa sopra decine di volte al secondo. La targhetta
      // sbatte fra due regioni e sembra un difetto del sito.
      // Per subentrare, la nuova deve essere più vicina del 12%: due
      // punti equidistanti non si contendono più il puntatore, e
      // quella già scelta resta finché il puntatore non si muove
      // davvero verso l'altra.
      if (dentro && corrente && v.chiave !== corrente) {
        const attuale = bottoni.find((b) => b.dataset.topoRegione === corrente);
        if (attuale) {
          const q = attuale.getBoundingClientRect();
          const d = Math.hypot(
            pointer.spx - (q.left + q.width / 2),
            pointer.spy - (q.top + q.height / 2)
          );
          if (v.distanza > d * 0.88) return;
        }
      }

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

  // I font cambiano dove va a capo il testo, e con quello l'altezza da
  // prenotare: misurare prima che siano pronti significa prenotare
  // l'altezza del ripiego.
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
