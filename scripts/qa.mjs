#!/usr/bin/env node
/**
 * QA visiva.
 *
 * Il giudizio su questo sito è visivo, non testuale: serve poter
 * guardare i fotogrammi chiave a comando, alle misure vere, e
 * rileggerli dopo ogni modifica.
 *
 *   node scripts/qa.mjs                 tutti i fotogrammi, desktop
 *   node scripts/qa.mjs --mobile        art direction mobile
 *   node scripts/qa.mjs --fps           misura il costo dell'hero
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const URL = process.env.QA_URL || "http://localhost:5180";
const OUT = "qa";
const args = process.argv.slice(2);
const mobile = args.includes("--mobile");
const wantFps = args.includes("--fps");

const VIEWPORT = mobile
  ? { width: 390, height: 844 }
  : { width: 1600, height: 900 };

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: VIEWPORT,
  deviceScaleFactor: 2,
  isMobile: mobile,
  hasTouch: mobile,
});

const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(URL, { waitUntil: "networkidle" });
// La soglia dura ~3s ed è parte dell'esperienza: si aspetta che
// finisca invece di scavalcarla, così si vede quello che vede
// davvero chi arriva.
await page.waitForFunction(() => document.body.classList.contains("is-pronto"), {
  timeout: 15000,
});
await page.waitForTimeout(600);

// Un solo refresh, a pagina ferma. Chiamarlo dentro il pin ricalcola
// le posizioni mentre l'hero è fisso e fa scattare i trigger delle
// scene sotto: si finisce per fotografare uno stato che nessun utente
// vedrà mai.
await page.evaluate(() => window.__canone.ScrollTrigger.refresh());
await page.waitForTimeout(200);

/** Porta lo scroll a una posizione e forza un fotogramma. */
async function at(y) {
  await page.evaluate((py) => {
    const C = window.__canone;
    C.lenis()?.scrollTo(py, { immediate: true });
    C.ScrollTrigger.update();
    window.__luce?.render();
  }, y);
  await page.waitForTimeout(350);
  await page.evaluate(() => window.__luce?.render());
  await page.waitForTimeout(120);
}

async function shot(name, y) {
  await at(y);
  const file = `${OUT}/${mobile ? "m-" : ""}${name}.png`;
  await page.screenshot({ path: file });
  console.log(`✓ ${file}`);
}

// L'hero non è più guidato dallo scroll: si suona da solo. I suoi
// fotogrammi si prendono cercando nel tempo della sequenza, sui
// momenti della coreografia — la luce che arriva, la parola che si
// posa, la linea al culmine, la composizione a riposo.
const H = VIEWPORT.height;

async function heroAt(name, t) {
  await page.evaluate((tt) => window.__luce?.seek(tt), t);
  await page.waitForTimeout(250);
  await page.evaluate(() => window.__luce?.render());
  await page.waitForTimeout(100);
  const file = `${OUT}/${mobile ? "m-" : ""}${name}.png`;
  await page.screenshot({ path: file });
  console.log(`✓ ${file}`);
}

for (const [name, t] of [
  ["01-apertura", 0],
  ["02-luce", 0.22],
  ["03-parola", 0.45],
  ["04-linea", 0.62],
  ["05-riposo", 1],
]) {
  await heroAt(name, t);
}

// Le scene sotto l'hero si misurano dalla loro posizione reale
const scenes = await page.evaluate(() =>
  [...document.querySelectorAll("[data-scene]")].slice(1).map((el) => ({
    id: el.id,
    top: el.getBoundingClientRect().top + window.scrollY,
    h: el.getBoundingClientRect().height,
  }))
);

for (const s of scenes) {
  await shot(`${s.id}-a`, s.top + H * 0.35);
  if (s.h > H * 1.5) await shot(`${s.id}-b`, s.top + s.h - H * 0.9);
}

if (wantFps) {
  await at(H * 1.6);
  const fps = await page.evaluate(
    () =>
      new Promise((res) => {
        let n = 0;
        const t0 = performance.now();
        const loop = () => {
          n++;
          if (performance.now() - t0 < 2000) requestAnimationFrame(loop);
          else res(Math.round((n / (performance.now() - t0)) * 1000));
        };
        requestAnimationFrame(loop);
      })
  );
  console.log(`\nFPS sull'hero (${VIEWPORT.width}×${VIEWPORT.height}): ${fps}`);
}

if (errors.length) {
  console.log(`\n⚠ ${errors.length} errori console:`);
  errors.slice(0, 10).forEach((e) => console.log("  " + e));
} else {
  console.log("\nNessun errore console.");
}

await browser.close();
