import Lenis from "lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

let lenis = null;

/**
 * Lo scroll è un controller di camera, non un trasporto verticale.
 * Lenis dà la massa; ScrollTrigger dà la posizione. Tutto il resto
 * del sito legge il progresso da qui — nessuna scena ascolta `scroll`
 * per conto proprio.
 */
export function initScroll() {
  if (reducedMotion) {
    // Niente inerzia: chi ha chiesto meno movimento non deve subire
    // una pagina che continua a muoversi dopo che ha smesso di scrollare.
    ScrollTrigger.refresh();
    return null;
  }

  lenis = new Lenis({
    // Volutamente pesante: il volto ha massa, la camera anche.
    duration: 1.15,
    easing: (t) => 1 - Math.pow(1 - t, 3.2),
    gestureOrientation: "vertical",
    smoothWheel: true,
    // Il touch resta nativo: l'inerzia simulata su mobile è sempre
    // peggiore di quella del sistema.
    syncTouch: false,
    touchMultiplier: 1.6,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function getLenis() {
  return lenis;
}

export function scrollTo(target, opts = {}) {
  if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.6, ...opts });
  else document.querySelector(target)?.scrollIntoView();
}

export { gsap, ScrollTrigger };
