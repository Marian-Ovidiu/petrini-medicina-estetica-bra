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
// i pazienti arrivano.
const REGIONI = {
  fronte: {
    ox: "64%", oy: "22%",
    macro: "/media/img/oculus-560.avif",
    nome: "Fronte",
    obiettivo:
      "Attenuare le rughe orizzontali della fronte, mantenendo uno sguardo naturale ed espressivo.",
    comeFunziona:
      "Le rughe della fronte compaiono soprattutto quando alziamo le sopracciglia. Il trattamento riduce questo movimento in modo controllato, rendendo la fronte più distesa senza togliere naturalezza allo sguardo.",
    trattamento:
      "Tossina botulinica, attraverso piccole iniezioni in punti scelti in base ai movimenti del viso.",
    risultato:
      "Si possono riprendere subito le normali attività. Può comparire un leggero rossore nei punti trattati. Il risultato si sviluppa gradualmente e si completa in circa 15–30 giorni.",
  },
  zampe: {
    ox: "35%", oy: "37%",
    macro: "/media/img/oculus-560.avif",
    nome: "Zampe di gallina",
    obiettivo:
      "Attenuare le rughe ai lati degli occhi, mantenendo un sorriso naturale ed espressivo.",
    comeFunziona:
      "Queste rughe compaiono soprattutto quando sorridiamo. Il trattamento riduce delicatamente la contrazione del muscolo, lasciando naturale il movimento degli occhi e del sorriso.",
    trattamento:
      "Tossina botulinica, attraverso piccole iniezioni ai lati degli occhi.",
    risultato:
      "Si possono riprendere subito le normali attività. In alcuni casi può comparire un piccolo livido nei punti trattati, che scompare in pochi giorni. Il risultato si sviluppa gradualmente e si completa in circa 15–30 giorni.",
  },
  zigomo: {
    ox: "36%", oy: "47%",
    macro: "/media/img/zygoma-560.avif",
    nome: "Zigomi",
    obiettivo:
      "Ridare sostegno e definizione agli zigomi, senza appesantire o gonfiare la guancia.",
    comeFunziona:
      "Con il tempo la zona degli zigomi può perdere sostegno e i tessuti tendono a scendere. Il trattamento aiuta a ricreare questo supporto in profondità, migliorando i contorni del viso in modo naturale.",
    trattamento:
      "Filler a base di acido ialuronico, posizionato in profondità in punti selezionati degli zigomi.",
    risultato:
      "Può comparire un leggero gonfiore per 1–2 giorni. Il risultato si stabilizza progressivamente nelle settimane successive.",
  },
  codice: {
    ox: "69%", oy: "59%",
    macro: "/media/img/labium-560.avif",
    nome: "Codice a barre",
    obiettivo:
      "Attenuare le piccole rughe verticali sopra il labbro, mantenendo la bocca naturale e leggera.",
    comeFunziona:
      "Con il tempo la pelle sopra il labbro può diventare più sottile e segnarsi più facilmente. Il trattamento aiuta a distendere queste piccole rughe senza aumentare troppo il volume delle labbra.",
    trattamento:
      "Filler a base di acido ialuronico, con piccole iniezioni nella zona trattata.",
    risultato:
      "Si possono riprendere subito le normali attività. Può comparire un leggero gonfiore o piccoli segni nei punti trattati per circa un giorno.",
  },
  labbra: {
    ox: "68%", oy: "64%",
    macro: "/media/img/labium-560.avif",
    nome: "Labbra",
    obiettivo:
      "Definire meglio il contorno delle labbra e renderle più armoniose, senza creare un effetto eccessivo.",
    comeFunziona:
      "Con il tempo le labbra possono perdere definizione e apparire più sottili. Il trattamento aiuta a ridisegnarne la forma e, quando serve, a restituire un po’ di volume in modo naturale.",
    trattamento:
      "Filler a base di acido ialuronico, applicato in piccoli punti in base alla forma delle labbra.",
    risultato:
      "Può comparire gonfiore per 1–3 giorni. Il risultato si stabilizza gradualmente nelle settimane successive.",
  },
  marionetta: {
    ox: "50%", oy: "69%",
    macro: "/media/img/mandibula-560.avif",
    nome: "Rughe della marionetta",
    obiettivo:
      "Attenuare le rughe che scendono dagli angoli della bocca verso il mento e dare al viso un aspetto più disteso.",
    comeFunziona:
      "Con il tempo gli angoli della bocca possono tendere verso il basso e comparire queste pieghe. Il trattamento aiuta a rilassare i muscoli che tirano la bocca verso il basso e, quando serve, a ridare sostegno alla zona.",
    trattamento:
      "Filler a base di acido ialuronico, con piccole iniezioni nella zona trattata.",
    risultato:
      "Si possono riprendere subito le normali attività. Può comparire un leggero gonfiore per uno o due giorni.",
  },
  bruxismo: {
    ox: "23%", oy: "54%",
    macro: "/media/img/mandibula-560.avif",
    nome: "Bruxismo",
    obiettivo:
      "Ridurre la forza con cui si stringono i denti e rilassare i muscoli della mandibola.",
    comeFunziona:
      "Quando stringiamo i denti troppo spesso, i muscoli della mandibola lavorano troppo e possono diventare più tesi e voluminosi. Il trattamento li aiuta a rilassarsi e a lavorare con meno forza.",
    trattamento:
      "Tossina botulinica, con piccole iniezioni nei muscoli della mandibola.",
    risultato:
      "Si possono riprendere subito le normali attività. Il risultato si sviluppa gradualmente e si completa in circa 15–30 giorni.",
  },
  mento: {
    ox: "33%", oy: "67%",
    macro: "/media/img/mandibula-560.avif",
    nome: "Profilo del mento",
    obiettivo:
      "Rendere il mento più armonioso e migliorare il profilo del viso. Si può anche rendere più liscia la pelle del mento.",
    comeFunziona:
      "Se il mento è poco pronunciato, il profilo può sembrare meno definito. Il trattamento può dare più forma al mento e rilassare il muscolo che crea le piccole pieghe sulla pelle.",
    trattamento:
      "Filler a base di acido ialuronico, con piccole iniezioni nella zona trattata.",
    risultato:
      "Si possono riprendere subito le normali attività. Può comparire un leggero gonfiore per uno o due giorni.",
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
    nome: scene.querySelector("[data-d-nome]"),
    obiettivo: scene.querySelector("[data-d-obiettivo]"),
    comeFunziona: scene.querySelector("[data-d-come-funziona]"),
    trattamento: scene.querySelector("[data-d-trattamento]"),
    risultato: scene.querySelector("[data-d-risultato]"),
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

    scrivi(r);
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
