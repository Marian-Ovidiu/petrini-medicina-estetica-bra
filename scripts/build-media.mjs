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
  // La lastra di CANONE. Le larghezze finiscono a 1336 perché è la
  // larghezza del ritaglio: la costruzione sta sui landmark solo se
  // il rapporto della lastra è esattamente quello del telaio, e per
  // ottenerlo la sorgente si taglia — non si allarga.
  lastra: [720, 1100, 1336],
};

const JOBS = [
  { src: "hero-16x9.png", name: "volto", set: "hero" },
  { src: "macro-skin.png", name: "macro", set: "scene" },
  { src: "zygoma.png", name: "zygoma", set: "crop" },
  { src: "mandibula.png", name: "mandibula", set: "crop" },
  { src: "labium.png", name: "labium", set: "crop" },
  { src: "oculus.png", name: "oculus", set: "crop" },
  { src: "hero-c1.png", name: "volto-tre-quarti", set: "scene" },

  /* ── CANONE · la lastra della costruzione ────────────────────
   *
   * Stessa sorgente della lastra di TOPOGRAFIA, inquadratura
   * diversa. Prima qui c'era un ritaglio dell'hero (`profilo`), ed
   * era il difetto: la scena 02 mostrava la stessa fotografia della
   * scena 01, ingrandita. Due schermate di seguito con lo stesso
   * scatto non sono un richiamo, sono una ripetizione.
   *
   * Il riquadro non è un'inquadratura a occhio. Il rapporto è quello
   * del telaio (1336 : 2100 = 1100 : 1729): se la lastra e il telaio
   * non hanno lo stesso rapporto, `object-fit: cover` ritaglia i
   * lati e le linee della costruzione si scollano dai landmark.
   * L'altezza è scelta perché il taglio contenga il trichion con un
   * po' d'aria sopra e il gnathion con un po' di collo sotto: sono
   * i due estremi del canone, e questa volta ci stanno tutti e due
   * dentro — la costruzione può dire i tre terzi interi invece dei
   * due che il vecchio ritaglio conteneva.
   */
  {
    src: "hero-c1.png",
    name: "canone",
    set: "lastra",
    crop: { left: 350, top: 110, width: 1336, height: 2100 },
  },
  /* La lastra di TRATTAMENTI. Frontale piena, luce simmetrica sui
   * due lati: è la sola inquadratura su cui una zona di trattamento
   * si può segnare dove sta davvero, perché le zone sono pari e su
   * un tre quarti una delle due è sempre girata via. Il collo e le
   * clavicole restano dentro perché la biorivitalizzazione arriva
   * fin lì, e una zona che il ritaglio taglia non è una zona.
   *
   * Sostituisce `volto-ii`, che era il ritratto di un uomo: il
   * volto del sito è uno solo, e sta nelle scene 01, 02 e 04. */
  { src: "frontale.png", name: "frontale", set: "scene" },
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

/*
 * Il ritaglio verticale dell'hero — `profilo.avif` e la sua matte —
 * non si fa più. Serviva a CANONE, che ora ha la sua lastra
 * (`canone`, nei JOBS in cima) presa da un altro scatto: la scena
 * 02 non deve mostrare la fotografia della scena 01 ingrandita.
 * TOPOGRAFIA, che dà il nome a questo blocco, aveva già smesso di
 * usarlo per il tre quarti.
 */


// Nessun `caso-*` viene più convertito. La scena CONTROLLO — il
// prima/dopo — è stata tolta dal cliente, e con lei le quattro
// lastre delle due pazienti: in `img/` non esistono più, e i raw
// (`caso-a-*`, `caso-b-*`, più i vecchi render `caso-t0`/`caso-t90`
// della scena ESITI) restano in `raw/` senza consumatori. Sono
// fotografie di persone vere: se non tornano in pagina, il posto
// giusto per loro non è un repository.
//
// Nessun job chiama `withMetadata()`, ed è voluto: sharp scarta EXIF,
// XMP e IPTC per impostazione predefinita, quindi modello del
// dispositivo, data di scatto e identificativi della sessione non
// arrivano in `img/`. È l'unico punto in cui quella garanzia si
// ottiene, perché è l'unico punto in cui le fotografie vengono
// riscritte.
