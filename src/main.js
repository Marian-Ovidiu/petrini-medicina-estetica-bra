import "./styles/base.css";
import "./styles/scenes.css";
import "./styles/canone.css";
import "./styles/trattamenti.css";
import "./styles/topografia.css";
import "./styles/editoriali.css";

import { initScroll, getLenis, gsap, ScrollTrigger, reducedMotion } from "./core/scroll.js";
import { initPointer } from "./core/pointer.js";
import { initSoglia } from "./scenes/soglia.js";
import { initLuce } from "./scenes/luce.js";
import { initCanone } from "./scenes/canone.js";
import { initTrattamenti } from "./scenes/trattamenti.js";
import { initTopografia } from "./scenes/topografia.js";
import { initConsulto } from "./scenes/consulto.js";

initScroll();
initPointer();

// Il fondo del documento segue la scena attiva, così le campiture piene
// si scambiano senza che i bordi del viewport lampeggino.
//
// La testata invece segue la scena che ha *sotto*, non quella
// dominante: sta incollata in alto, e con il fondo sbagliato il suo
// velo diventa una banda chiara sopra una fotografia scura.
function watchGround() {
  const testata = document.querySelector("[data-testata]");
  const scenes = document.querySelectorAll("[data-ground][data-scene]");

  scenes.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 55%",
      end: "bottom 55%",
      onToggle: ({ isActive }) => {
        if (isActive) document.body.dataset.ground = el.dataset.ground;
      },
    });

    ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom top",
      onToggle: ({ isActive }) => {
        if (isActive && testata) testata.dataset.ground = el.dataset.ground;
      },
    });
  });
}

const teardown = [];

async function boot() {
  await initSoglia();
  // L'hero va montato per primo: è lui a definire l'altezza del
  // documento, e tutto ciò che si crea dopo misura la pagina vera.
  teardown.push(await initLuce());
  initCanone();
  initTrattamenti();
  initTopografia();
  initConsulto();
  watchGround();
  ScrollTrigger.refresh();
}

boot();

// Senza questo l'HMR lascia dietro contesti WebGL e ScrollTrigger vivi:
// due scene disegnano sulla stessa tela e i valori che leggi non sono
// quelli che vedi.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    teardown.forEach((fn) => fn?.());
    ScrollTrigger.getAll().forEach((t) => t.kill());
  });
}

if (import.meta.env?.DEV) {
  window.__canone = { gsap, ScrollTrigger, reducedMotion, lenis: getLenis };
}
