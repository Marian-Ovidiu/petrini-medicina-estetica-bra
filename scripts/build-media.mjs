#!/usr/bin/env node
/**
 * Pipeline media.
 *
 * I raw di Higgsfield sono PNG da 7–20 MB: inutilizzabili in pagina.
 * Qui diventano AVIF a larghezze multiple, più la matte in scala di
 * grigi estratta dal canale alfa del cutout.
 *
 *   node scripts/build-media.mjs
 */
import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const RAW = "public/media/raw";
const OUT = "public/media/img";

// Larghezze pensate sui breakpoint reali, non su una scala arbitraria
const WIDTHS = {
  hero: [1280, 1920, 2560, 3200],
  scene: [720, 1080, 1600],
  crop: [560, 900, 1400],
  // Il ritratto del medico non è un render: è una fotografia vera, e
  // la sua risoluzione è quella che è. Le larghezze finiscono dove
  // finisce il file invece di dichiarare misure che non esistono.
  ritratto: [720, 968],
};

const JOBS = [
  { src: "hero-16x9.png", name: "volto", set: "hero" },
  { src: "macro-skin.png", name: "macro", set: "scene" },
  { src: "zygoma.png", name: "zygoma", set: "crop" },
  { src: "mandibula.png", name: "mandibula", set: "crop" },
  { src: "labium.png", name: "labium", set: "crop" },
  { src: "oculus.png", name: "oculus", set: "crop" },
  { src: "hero-c1.png", name: "volto-tre-quarti", set: "scene" },
  { src: "hero-c3.png", name: "volto-ii", set: "scene" },
  // Il ritratto arriva come scatto da tessera in verticale 2:3: testa
  // in alto e mezzo busto. Il taglio lo porta al 4:5 delle altre
  // lastre e si ferma appena sopra il ricamo «Dr. Petrini W.» sulla
  // casacca, che comparendo a metà si leggerebbe come una sbavatura —
  // e che comunque il sito dice già meglio, con la firma.
  // Il ciano della casacca e il fondo bianco non si correggono qui:
  // ci pensa il duotone del brand in `base.css`, che li porta dentro
  // la scala pece → latte come per ogni altra fotografia.
  {
    src: "medico-petrini.jpeg",
    name: "medico",
    set: "ritratto",
    crop: { left: 56, top: 45, width: 968, height: 1210 },
  },
];

await mkdir(OUT, { recursive: true });

for (const job of JOBS) {
  const src = path.join(RAW, job.src);
  if (!existsSync(src)) {
    console.warn(`· salto ${job.src} (assente)`);
    continue;
  }
  const meta = await sharp(src).metadata();
  // L'inquadratura sta qui e non in un file già ritagliato dentro
  // `raw/`: il ritaglio è una decisione, e una decisione va scritta
  // dove si rilegge, non incisa in un binario che nessuno riapre.
  const sorgente = () => (job.crop ? sharp(src).extract(job.crop) : sharp(src));
  const largh = job.crop ? job.crop.width : meta.width;

  for (const w of WIDTHS[job.set]) {
    if (w > largh * 1.05) continue; // niente upscale
    await sorgente()
      .resize({ width: w, withoutEnlargement: true })
      .avif({ quality: 62, effort: 6 })
      .toFile(path.join(OUT, `${job.name}-${w}.avif`));
  }
  // Fallback per Safari datati e per il preload dell'hero
  await sorgente()
    .resize({ width: WIDTHS[job.set].at(-1), withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(path.join(OUT, `${job.name}.webp`));

  console.log(`✓ ${job.name}  (${meta.width}×${meta.height})`);
}

/**
 * La matte esce dal canale alfa del cutout: è il ritaglio reale del
 * soggetto, non una soglia di luminanza che si mangerebbe le ombre
 * del volto. Bianco = soggetto.
 */
const CUT = path.join(RAW, "hero-16x9-cutout.png");
if (existsSync(CUT)) {
  const { width, height } = await sharp(CUT).metadata();
  await sharp(CUT)
    .ensureAlpha()
    .extractChannel("alpha")
    .resize({ width: Math.min(1600, width) })
    // Un filo di sfocatura: il bordo netto al 100% tradisce il ritaglio,
    // questo lo fa sedere sulla fotografia.
    .blur(0.6)
    .toColourspace("b-w")
    .avif({ quality: 70, effort: 6 })
    .toFile(path.join(OUT, "volto-matte.avif"));
  console.log(`✓ volto-matte  (da alfa ${width}×${height})`);
} else {
  console.warn("· matte assente: serve hero-16x9-cutout.png");
}

/**
 * TOPOGRAFIA lavora su un profilo verticale, non sull'inquadratura
 * larga dell'hero. Il ritaglio si fa qui e non a mano, così la
 * fotografia e la sua matte restano allineate al pixel: da quella
 * coincidenza dipende tutta la scena.
 */
if (existsSync(CUT)) {
  const src = path.join(RAW, "hero-16x9.png");
  const { width, height } = await sharp(src).metadata();
  const left = Math.round(width * 0.645);
  const box = { left, top: 0, width: width - left, height };

  const cutMeta = await sharp(CUT).metadata();
  const s = cutMeta.width / width; // il cutout torna a risoluzione diversa
  const cutBox = {
    left: Math.round(left * s),
    top: 0,
    width: cutMeta.width - Math.round(left * s),
    height: cutMeta.height,
  };

  /*
   * Niente ritaglio a sagoma per TOPOGRAFIA.
   *
   * Sul fondo inchiostro il profilo scontornato funzionava: i capelli
   * scuri su fondo scuro nascondevano l'imprecisione dello scontorno.
   * Sulla campitura lime quella stessa frangia diventa un alone verde
   * sulla testa, e nessuna soglia la risolve — i capelli e il fondo
   * hanno la stessa luminanza, non c'è informazione da cui separarli.
   *
   * La scena usa una lastra rettangolare, come CANONE e STRATI. Il
   * profilo si legge lo stesso, perché è illuminato contro il nero
   * dentro l'inquadratura; e la regione la annuncia l'anello, che non
   * dipende da nessuno scontorno.
   */
  await sharp(src)
    .extract(box)
    .resize({ width: 1100 })
    .avif({ quality: 64, effort: 6 })
    .toFile(path.join(OUT, "profilo.avif"));

  // Versione in scala di grigi, per gli shader che campionano un canale
  await sharp(CUT)
    .ensureAlpha()
    .extractChannel("alpha")
    .extract(cutBox)
    .resize({ width: 1100 })
    .blur(0.5)
    .toColourspace("b-w")
    .avif({ quality: 72, effort: 6 })
    .toFile(path.join(OUT, "profilo-matte.avif"));

  console.log("✓ profilo + profilo-matte (ritaglio verticale)");
}

// La documentazione clinica (caso-t0 / caso-t90) serviva alla scena
// ESITI, che il cliente ha tolto: i raw restano in `raw/`, e se la
// scena torna torna anche il blocco che li converte. Il ritratto del
// medico stava qui finché era un render come gli altri; ora è una
// fotografia vera che vuole un ritaglio, ed è passato ai JOBS in cima.
