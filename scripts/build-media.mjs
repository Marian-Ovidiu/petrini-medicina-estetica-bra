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
   * Un tre quarti che sul sito non c'è da nessun'altra parte: occhi
   * aperti, fondo grigio, luce piena. È la quarta lastra che questa
   * scena prova, e le prime tre sono cadute tutte per lo stesso
   * motivo — erano già in pagina altrove. Un ritaglio dell'hero (la
   * scena 02 mostrava la fotografia della 01 ingrandita); il tre
   * quarti di TOPOGRAFIA; un profilo nuovo che però, accanto
   * all'hero, si leggeva come lo stesso scatto. Due schermate con la
   * stessa fotografia non sono un richiamo, sono una ripetizione, e
   * in una pagina che parla di guardare bene è la cosa che si nota
   * per prima.
   *
   * La lastra è specchiata. La sorgente ha il volto girato verso
   * destra, cioè verso il bordo della pagina; specchiata guarda
   * dentro il testo, che è l'impianto della scena da sempre. È una
   * fotografia generata e non un paziente, quindi non c'è nessun
   * documento da falsare — ma sta scritto qui perché un'inversione
   * non dichiarata è il genere di cosa che, in un sito clinico, non
   * si scopre più.
   *
   * Il riquadro non è un'inquadratura a occhio. Il rapporto è quello
   * del telaio (1209 : 1900 = 1100 : 1729): se la lastra e il telaio
   * non hanno lo stesso rapporto, `object-fit: cover` ritaglia i lati
   * e le linee della costruzione si scollano dai landmark. L'altezza
   * è scelta perché il taglio contenga il trichion con un po' d'aria
   * sopra e il gnathion con il collo sotto: sono i due estremi del
   * canone, e ci stanno tutti e due dentro — la costruzione dice i
   * tre terzi interi invece dei due che il primo ritaglio conteneva.
   */
  {
    src: "profilo-ii.png",
    name: "canone",
    set: "lastra",
    mirror: true,
    crop: { left: 240, top: 140, width: 1209, height: 1900 },
  },

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
  const sorgente = () => {
    // `mirror` specchia la lastra prima del ritaglio. Serve a una sola
    // scena e non è un vezzo: CANONE ha il testo a sinistra e la lastra
    // a destra, e un volto che guarda fuori pagina rompe l'impianto.
    // Le coordinate di `crop` sono quindi quelle della sorgente non
    // specchiata — è l'ordine in cui sharp esegue la pipeline, e i
    // numeri qui sotto sono stati rilevati su un provino fatto con
    // questa stessa catena.
    const base = job.mirror ? sharp(src).flop() : sharp(src);
    return job.crop ? base.extract(job.crop) : base;
  };
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
