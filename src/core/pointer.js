import { reducedMotion } from "./scroll.js";

/**
 * Un solo lettore di puntatore per tutto il sito.
 *
 * Espone posizione grezza, posizione smorzata e velocità. Le scene
 * leggono da qui invece di attaccare i propri listener: così la
 * risposta al puntatore ha *la stessa massa* ovunque, che è quello che
 * fa sembrare l'interfaccia un oggetto fisico unico.
 */
const state = {
  // normalizzati -1..1 rispetto al centro del viewport
  x: 0,
  y: 0,
  // versione smorzata — quella che le scene dovrebbero usare
  sx: 0,
  sy: 0,
  // pixel assoluti
  px: 0,
  py: 0,
  spx: 0,
  spy: 0,
  velocity: 0,
  active: false,
  fine: window.matchMedia("(pointer: fine)").matches,
};

const listeners = new Set();

export function initPointer() {
  if (!state.fine) return state;

  state.px = window.innerWidth / 2;
  state.py = window.innerHeight / 2;
  state.spx = state.px;
  state.spy = state.py;

  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      state.px = e.clientX;
      state.py = e.clientY;
      state.x = (e.clientX / window.innerWidth) * 2 - 1;
      state.y = (e.clientY / window.innerHeight) * 2 - 1;
      state.active = true;
    },
    { passive: true }
  );

  window.addEventListener("pointerleave", () => {
    state.active = false;
  });

  // Lo smorzamento gira su un rAF proprio anche con reduced-motion:
  // serve a *non* far scattare le cose, quindi va tenuto.
  const damp = reducedMotion ? 1 : 0.085;
  let last = { x: state.spx, y: state.spy };

  function tick() {
    // Verso il centro quando il puntatore esce: la composizione si
    // riposa da sola invece di restare bloccata all'ultimo angolo.
    const tx = state.active ? state.px : window.innerWidth / 2;
    const ty = state.active ? state.py : window.innerHeight / 2;

    state.spx += (tx - state.spx) * damp;
    state.spy += (ty - state.spy) * damp;
    state.sx = (state.spx / window.innerWidth) * 2 - 1;
    state.sy = (state.spy / window.innerHeight) * 2 - 1;

    const dx = state.spx - last.x;
    const dy = state.spy - last.y;
    state.velocity = Math.hypot(dx, dy);
    last = { x: state.spx, y: state.spy };

    for (const fn of listeners) fn(state);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  return state;
}

export function onPointer(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const pointer = state;
