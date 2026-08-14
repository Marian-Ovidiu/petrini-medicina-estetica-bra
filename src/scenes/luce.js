import { gsap, ScrollTrigger, reducedMotion } from "../core/scroll.js";
import { pointer } from "../core/pointer.js";
import { frag } from "../shaders/luce.glsl.js";
import { createQuad, loadTexture, createTextureFromCanvas } from "../core/gl.js";

// Gli stessi due estremi del duotone in tokens.css: lo shader rifà
// la rimappatura per conto suo, sui pixel che compone.
const PECE = [0.055, 0.071, 0.027]; // #0e1207
const MARKER = [0.937, 0.224, 0.518]; // #ef3984
const LATTE = [0.973, 1.0, 0.949]; // #f8fff2

/**
 * Dipinge la parola in Bodoni su una texture.
 *
 * Sta in un canvas invece che nel DOM perché deve poter essere
 * *occlusa dal volto*: solo dentro il compositore le lettere possono
 * passare dietro il naso. Il testo leggibile resta nel DOM, nascosto
 * ai vedenti ma disponibile a screen reader e motori.
 */
function disegnaParola(word = "CANONE") {
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
  ctx.textBaseline = "middle";

  // Si parte grandi e si stringe finché la parola non tocca i margini:
  // la scala è dettata dalla parola, non da un numero scelto a mano.
  let size = h * 1.05;
  ctx.font = `400 ${size}px "Bodoni Moda", Didot, serif`;
  size *= (w * 0.94) / ctx.measureText(word).width;

  ctx.font = `400 ${size}px "Bodoni Moda", Didot, serif`;
  ctx.letterSpacing = `${-size * 0.015}px`;
  ctx.fillText(word, w / 2, h / 2);

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

  const [portrait, matte, macro] = await Promise.all([
    loadTexture(gl, "/media/img/volto-2560.avif"),
    loadTexture(gl, "/media/img/volto-matte.avif"),
    loadTexture(gl, "/media/img/macro-1600.avif"),
  ]);

  if (!portrait || !matte || !macro) {
    quad.destroy();
    return statica();
  }

  // I font devono essere pronti *prima* di dipingere la parola:
  // disegnarla col fallback significa incidere il ripiego dentro una
  // texture che non si aggiorna più.
  await (document.fonts ? document.fonts.ready : Promise.resolve());
  const canvasParola = disegnaParola("CANONE");
  const parola = createTextureFromCanvas(gl, canvasParola);

  const stato = {
    progresso: 0,
    linea: 0,
    alfaParola: 0,
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
      uMacro: macro,
      uRes: res,
      uImgAspect: portrait.width / portrait.height,
      uTypeAspect: parola.width / parola.height,
      uMacroAspect: macro.width / macro.height,
      uProgress: stato.progresso,
      uTime: (performance.now() - t0) / 1000,
      uPointer: [pointer.sx, pointer.sy],
      uLinea: stato.linea,
      uTypeAlpha: stato.alfaParola,
      uGround: PECE,
      uSanguigna: MARKER,
      uFigure: LATTE,
    });
  }

  // ── coreografia ────────────────────────────────────────────
  // Lo scroll guida la camera. La tipografia e la linea non entrano
  // insieme al movimento: aspettano che la camera abbia già arretrato,
  // così il montaggio ha un tempo invece di un accordo unico.
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "+=320%",
      pin: ".luce__pin",
      scrub: 0.9,
      anticipatePin: 1,
      // Questo pin allunga il documento di tre viewport. Deve
      // ricalcolarsi per primo, altrimenti ogni trigger sotto misura
      // una pagina che non esiste più e si accende alla posizione
      // sbagliata.
      refreshPriority: 10,
    },
  });

  tl.to(stato, { progresso: 1, ease: "none", duration: 1 }, 0)
    .to(stato, { alfaParola: 1, ease: "power2.out", duration: 0.28 }, 0.3)
    .to(stato, { linea: 1, ease: "power1.inOut", duration: 0.22 }, 0.52)
    // Poi la linea si spegne: ha fatto il suo lavoro e lascia
    // la scena al volto. Il silenzio fa parte della sequenza.
    .to(stato, { linea: 0.32, ease: "power1.in", duration: 0.18 }, 0.8);

  gsap.to("[data-luce-invito]", {
    opacity: 0,
    ease: "none",
    scrollTrigger: { trigger: section, start: "top top", end: "+=60%", scrub: true },
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
    window.__luce = { stato, render, get visibile() { return visibile; } };
  }

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    window.removeEventListener("resize", resize);
    quad.destroy();
  };
}
