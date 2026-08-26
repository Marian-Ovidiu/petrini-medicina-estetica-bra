import { getLenis, reducedMotion } from "./scroll.js";

/**
 * Atterraggio morbido per lo scroll touch.
 *
 * Il gesto resta interamente nativo: non cambiamo né la distanza
 * percorsa dal dito né l'inerzia del sistema. Quando l'inerzia è
 * davvero finita, correggiamo soltanto gli arresti già molto vicini
 * all'inizio di una scena. È un assestamento, non uno scroll a pagine.
 */
export function initSmartScroll() {
  const coarse = window.matchMedia("(pointer: coarse)");
  const lenis = getLenis();
  if (reducedMotion || !coarse.matches || !lenis) return () => {};

  const ancore = ["canone", "trattamenti", "topografia", "metodo", "medico"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const topografia = document.getElementById("topografia");
  if (!ancore.length) return () => {};

  let toccando = false;
  let armato = false;
  let assestando = false;
  let partenza = window.scrollY;
  let precedente = window.scrollY;
  let direzione = 0;
  let timer = 0;

  const posizione = (el) => window.scrollY + el.getBoundingClientRect().top;

  function annullaTimer() {
    window.clearTimeout(timer);
    timer = 0;
  }

  function dentroTopografia(y) {
    if (!topografia) return false;
    const inizio = posizione(topografia);
    const fine = inizio + topografia.offsetHeight;

    // L'ingresso della scena può essere allineato, il suo interno no:
    // fotografia e dossier formano un'unica lettura interattiva.
    // Correggere lo scroll lì sposterebbe il testo senza un gesto
    // dell'utente.
    const sogliaIngresso = Math.min(150, window.innerHeight * 0.18);
    return y > inizio + sogliaIngresso && y < fine;
  }

  function assesta() {
    timer = 0;
    if (!armato || toccando || assestando) return;

    armato = false;
    const y = window.scrollY;
    if (Math.abs(y - partenza) < 18 || dentroTopografia(y)) return;

    const soglia = Math.min(150, window.innerHeight * 0.18);
    const superamento = Math.min(48, soglia * 0.36);
    let scelta = null;

    for (const ancora of ancore) {
      const destinazione = posizione(ancora);
      const delta = destinazione - y;

      // Scendendo si privilegia la prossima scena e si tollera solo
      // un piccolo superamento; salendo vale la regola speculare.
      const coerente =
        direzione >= 0
          ? delta >= -superamento && delta <= soglia
          : delta >= -soglia && delta <= superamento;
      if (!coerente) continue;

      if (!scelta || Math.abs(delta) < Math.abs(scelta.delta)) {
        scelta = { destinazione, delta };
      }
    }

    if (!scelta || Math.abs(scelta.delta) < 2) return;

    assestando = true;
    lenis.scrollTo(scelta.destinazione, {
      duration: 0.42,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      onComplete: () => {
        assestando = false;
      },
    });
  }

  function programma() {
    annullaTimer();
    if (!armato || toccando || assestando) return;
    timer = window.setTimeout(assesta, 160);
  }

  function alTocco() {
    annullaTimer();

    // Un nuovo gesto ha sempre la precedenza sull'atterraggio in
    // corso. Fermiamo Lenis sulla posizione corrente prima di armare
    // la nuova lettura del gesto.
    if (assestando) {
      lenis.scrollTo(window.scrollY, { immediate: true, force: true });
      assestando = false;
    }

    toccando = true;
    armato = true;
    partenza = precedente = window.scrollY;
    direzione = 0;
  }

  function dopoTocco() {
    toccando = false;
    programma();
  }

  function alloScroll() {
    if (armato && !assestando) {
      const y = window.scrollY;
      if (y !== precedente) direzione = y > precedente ? 1 : -1;
      precedente = y;
    }
    programma();
  }

  const passive = { passive: true };
  window.addEventListener("touchstart", alTocco, passive);
  window.addEventListener("touchend", dopoTocco, passive);
  window.addEventListener("touchcancel", dopoTocco, passive);
  window.addEventListener("scroll", alloScroll, passive);

  return () => {
    annullaTimer();
    window.removeEventListener("touchstart", alTocco);
    window.removeEventListener("touchend", dopoTocco);
    window.removeEventListener("touchcancel", dopoTocco);
    window.removeEventListener("scroll", alloScroll);
  };
}
