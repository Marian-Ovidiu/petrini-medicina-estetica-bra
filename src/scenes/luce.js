import { gsap, ScrollTrigger, reducedMotion } from "../core/scroll.js";
import { pointer } from "../core/pointer.js";
import { frag } from "../shaders/luce.glsl.js";
import { createQuad, loadTexture, createTextureFromCanvas } from "../core/gl.js";

// Gli stessi due estremi del duotone in tokens.css: lo shader rifà
// la rimappatura per conto suo, sui pixel che compone.
const PECE = [0.055, 0.071, 0.027]; // #0e1207
const MARKER = [0.937, 0.224, 0.518]; // #ef3984
const LATTE = [0.973, 1.0, 0.949]; // #f8fff2

// Il nome in hero, una riga per elemento.
//
// È tornato al solo cognome per scelta del cliente, dopo aver provato
// WILLIAM sopra PETRINI. La pila funzionava, ma costringeva il blocco
// a stringersi per non farsi mangiare le ultime lettere dal profilo —
// e un cognome solo, su una riga, può tornare grande. La macchina
// regge entrambe le forme: si rimette un elemento nell'array e la
// composizione si ricalcola da sé. Cambiando forma vanno però
// riguardati `tScale` e `tCenter` nello shader, che sono tarati
// sull'ingombro reale del blocco.
const NOME = ["PETRINI"];

// Quanta della larghezza della texture occupa il blocco. Governa la
// misura di tutto: le righe sono giustificate a questo valore e
// l'altezza viene di conseguenza.
const LARGHEZZA = 0.94;

// Interlinea, in frazione dell'altezza media delle maiuscole. Stretta:
// due righe di Bodoni a questa scala devono leggersi come un blocco
// unico, non come due parole che si trovano nella stessa inquadratura.
const INTERLINEA = 0.14;

/**
 * Dipinge il nome in Bodoni su una texture, su due righe.
 *
 * Sta in un canvas invece che nel DOM perché deve poter essere
 * *occluso dal volto*: solo dentro il compositore le lettere possono
 * passare dietro il naso. Il testo leggibile resta nel DOM, nascosto
 * ai vedenti ma disponibile a screen reader e motori.
 *
 * Le righe sono portate alla stessa **larghezza**, non allo stesso
 * corpo, e le due conseguenze sono entrambe volute.
 *
 * La prima è di gerarchia. In Bodoni WILLIAM è molto più larga di
 * PETRINI a parità di corpo — due W contro due I — quindi giustificarle
 * fa il cognome più grande del nome. È l'ordine giusto per un marchio:
 * il nome presenta, il cognome è quello che resta.
 *
 * La seconda è di meccanica, ed è il motivo per cui la pila regge in
 * questa scena invece di essere solo una riga in più. Il profilo taglia
 * le due righe alla stessa ascissa, quindi l'occlusione resta un gesto
 * unico — un bordo verticale di volto che passa davanti a un blocco —
 * invece di sfrangiarsi su due parole di larghezza diversa, dove una
 * finirebbe dietro la faccia e l'altra no.
 *
 * Resta vero quello che valeva per la riga sola: la scala è dettata
 * dalle parole, non da un numero scelto a mano, e quindi qualunque
 * nome occupa la stessa frazione di texture e viene tagliato nello
 * stesso punto. Cambia solo *quale* lettera ci finisce sotto — e
 * quella va guardata, non dedotta. Una lettera tonda mozzata a metà si
 * legge come un errore, un montante che continua dietro il naso si
 * legge come una lettera occlusa.
 */
function disegnaNome(righe = NOME) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.min(4096, Math.round(2400 * dpr));
  const h = Math.round(w * 0.42);

  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  const font = (size) => `400 ${size}px "Bodoni Moda", Didot, serif`;
  // La crenatura negativa va applicata *prima* di misurare: entra nella
  // larghezza, e misurare senza per poi disegnare con significa
  // consegnare righe più corte del bersaglio — e di quanto dipende da
  // quante lettere ha la parola, cioè le righe non tornerebbero più
  // giustificate fra loro.
  const componi = (riga, size) => {
    ctx.font = font(size);
    ctx.letterSpacing = `${-size * 0.015}px`;
  };

  // Ogni riga si misura a un corpo di riferimento e poi si riscala:
  // la larghezza è lineare nel corpo, quindi un passaggio solo basta.
  const misure = righe.map((riga) => {
    const rif = h;
    componi(riga, rif);
    const size = (rif * (w * LARGHEZZA)) / ctx.measureText(riga).width;
    componi(riga, size);
    const m = ctx.measureText(riga);
    return { riga, size, cap: m.actualBoundingBoxAscent };
  });

  const capMedia = misure.reduce((s, m) => s + m.cap, 0) / misure.length;
  const interlinea = capMedia * INTERLINEA;
  let blocco =
    misure.reduce((s, m) => s + m.cap, 0) + interlinea * (misure.length - 1);

  // Rete di sicurezza per il ripiego tipografico: senza Bodoni le
  // metriche cambiano, e un blocco più alto della texture verrebbe
  // tagliato di netto invece che rimpicciolito. Non dovrebbe scattare
  // mai — i font sono attesi prima di dipingere.
  const eccesso = blocco / (h * 0.98);
  if (eccesso > 1) {
    for (const m of misure) {
      m.size /= eccesso;
      m.cap /= eccesso;
    }
    blocco /= eccesso;
  }

  let y = (h - blocco) / 2;
  for (const m of misure) {
    y += m.cap;
    componi(m.riga, m.size);
    ctx.fillText(m.riga, w / 2, y);
    y += interlinea;
  }

  return c;
}

export async function initLuce() {
  const canvas = document.querySelector("[data-luce-canvas]");
  const section = document.querySelector("#luce");
  if (!canvas || !section) return;

  const statica = () => section.classList.add("luce--statica");

  // Chi ha chiesto meno movimento riceve la composizione già arrivata,
  // non una versione mutilata: il concetto sopravvive, la coreografia no.
  if (reducedMotion) return statica();

  let quad;
  try {
    quad = createQuad(canvas, frag);
  } catch (e) {
    console.warn("[luce]", e.message);
    return statica();
  }
  if (!quad) return statica();

  const { gl } = quad;

  const [portrait, matte] = await Promise.all([
    loadTexture(gl, "/media/img/volto-2560.avif"),
    loadTexture(gl, "/media/img/volto-matte.avif"),
  ]);

  if (!portrait || !matte) {
    quad.destroy();
    return statica();
  }

  // I font devono essere pronti *prima* di dipingere la parola:
  // disegnarla col fallback significa incidere il ripiego dentro una
  // texture che non si aggiorna più.
  await (document.fonts ? document.fonts.ready : Promise.resolve());
  const canvasNome = disegnaNome();
  const parola = createTextureFromCanvas(gl, canvasNome);

  const stato = {
    progresso: 0,
    linea: 0,
    alfaParola: 0,
    apertura: 0,
  };

  let res = [1, 1];
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    res = quad.resize(
      canvas.clientWidth || window.innerWidth,
      canvas.clientHeight || window.innerHeight,
      dpr
    );
  }
  resize();
  window.addEventListener("resize", resize);

  const t0 = performance.now();

  function render() {
    quad.draw({
      uPortrait: portrait,
      uMatte: matte,
      uType: parola,
      uRes: res,
      uImgAspect: portrait.width / portrait.height,
      uTypeAspect: parola.width / parola.height,
      uProgress: stato.progresso,
      uTime: (performance.now() - t0) / 1000,
      uPointer: [pointer.sx, pointer.sy],
      uLinea: stato.linea,
      uApertura: stato.apertura,
      uTypeAlpha: stato.alfaParola,
      uGround: PECE,
      uSanguigna: MARKER,
      uFigure: LATTE,
    });
  }

  // ── coreografia ────────────────────────────────────────────
  // La sequenza si suona da sola all'atterraggio, non la guida lo
  // scroll. Chi arriva vede l'apertura per intero senza dover fare
  // niente, e quando finisce la pagina è già pronta a scorrere sul
  // resto: l'hero non chiede più tre schermate di scroll per
  // raccontarsi.
  //
  // La tipografia e la linea non entrano insieme al movimento:
  // aspettano che la camera abbia già arretrato, così il montaggio ha
  // un tempo invece di un accordo unico.
  const tl = gsap.timeline({ paused: true, onComplete: () => finita() });

  // La luce e la camera sono due battute distinte, non la stessa curva:
  // agganciate insieme, il diaframma ereditava l'avvio lento della
  // carrellata e per un secondo e mezzo non succedeva niente.
  tl.to(stato, { apertura: 1, duration: 1.8, ease: "power2.out" }, 0)
    .to(stato, { progresso: 1, duration: 3.5, ease: "power2.inOut" }, 0)
    .to(stato, { alfaParola: 1, duration: 1.0, ease: "power2.out" }, 1.1)
    .to(stato, { linea: 1, duration: 0.8, ease: "power1.inOut" }, 2.0)
    // Poi la linea si spegne: ha fatto il suo lavoro e lascia la
    // scena al volto. Il silenzio fa parte della sequenza — ma è una
    // sosta, non un'attesa: sotto i quattro secondi in totale, perché
    // chi atterra non ha chiesto di guardare un filmato.
    .to(stato, { linea: 0.32, duration: 0.7, ease: "power1.in" }, 3.0);

  const invito = section.querySelector("[data-luce-invito]");
  gsap.set(invito, { opacity: 0, y: 6 });

  let conclusa = false;
  function finita() {
    if (conclusa) return;
    conclusa = true;
    // L'invito a scorrere compare quando c'è davvero qualcosa da
    // scorrere: prima sarebbe un invito a interrompere.
    gsap.to(invito, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
  }

  // Chi decide di muoversi prima della fine non va trattenuto: la
  // sequenza accelera fino in fondo invece di essere saltata di netto,
  // così non si perde lo stato d'arrivo della composizione.
  function accelera() {
    if (tl.progress() < 1) gsap.to(tl, { timeScale: 5, duration: 0.4 });
  }
  const opzioni = { passive: true, once: true };
  window.addEventListener("wheel", accelera, opzioni);
  window.addEventListener("touchstart", accelera, opzioni);
  window.addEventListener("keydown", accelera, opzioni);

  tl.play();

  // Superato l'hero l'invito non serve più
  ScrollTrigger.create({
    trigger: section,
    start: "bottom 85%",
    onEnter: () => gsap.to(invito, { opacity: 0, duration: 0.3 }),
    onLeaveBack: () => {
      if (conclusa) gsap.to(invito, { opacity: 1, duration: 0.3 });
    },
  });

  let raf = 0;
  let visibile = true;
  const io = new IntersectionObserver(([e]) => (visibile = e.isIntersecting), {
    rootMargin: "10%",
  });
  io.observe(section);

  function tick() {
    raf = requestAnimationFrame(tick);
    // Fuori campo non si disegna: la GPU serve alla scena che si vede.
    if (!visibile) return;
    render();
  }
  tick();

  if (import.meta.env?.DEV) {
    // Quando il pannello di anteprima è sospeso il rAF si ferma e gli
    // screenshot di QA catturano un fotogramma vecchio.
    window.__luce = {
      stato,
      render,
      // La QA scorre la sequenza nel tempo, non nello scroll: senza
      // questo non c'è modo di fotografare un fotogramma preciso.
      seek: (t) => { tl.pause().progress(t); render(); },
      get visibile() { return visibile; },
    };
  }

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    window.removeEventListener("resize", resize);
    quad.destroy();
  };
}
