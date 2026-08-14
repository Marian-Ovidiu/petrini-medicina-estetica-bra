# CANONE

Esperienza digitale per uno studio di medicina estetica.
Concept: **l'architettura del volto**.

La direzione creativa completa — naming, palette, tipografia, narrativa
a scene, interazioni signature — sta in
[docs/CREATIVE-DIRECTION.md](docs/CREATIVE-DIRECTION.md). Questo file
copre solo come si fa girare e come si rigenera.

---

## Comandi

```bash
npm run dev      # sviluppo, porta 5180
npm run build    # build di produzione
npm run media    # ricostruisce gli AVIF da public/media/raw
```

QA visiva (richiede il dev server acceso):

```bash
node scripts/qa.mjs           # fotogrammi chiave desktop in qa/
node scripts/qa.mjs --mobile  # art direction verticale
node scripts/qa.mjs --fps     # aggiunge una misura di frame rate
```

I fotogrammi non sono presi a intervalli regolari ma sui momenti della
coreografia: apertura astratta, cambio d'ottica, parola che si posa,
linea al culmine, riposo.

> Il numero di FPS stampato da `--fps` viene da Chromium headless, che
> rasterizza via software. Serve a scoprire regressioni relative, non a
> stimare le prestazioni reali su GPU.

---

## Struttura

```
src/
  core/
    scroll.js     Lenis + ScrollTrigger. Unica sorgente di progresso.
    pointer.js    Un solo lettore di puntatore, smorzato, per tutte le scene.
    gl.js         Quad a schermo intero in WebGL2. Tutta la parte 3D è qui.
  shaders/
    luce.glsl.js  Il compositore dell'hero.
  scenes/         Una per scena della narrativa.
  styles/         tokens → base → una foglia per gruppo di scene.
scripts/
  build-media.mjs Da PNG di Higgsfield ad AVIF multi-larghezza + matte.
  qa.mjs          Screenshot dei fotogrammi chiave, desktop e mobile.
```

### Perché non c'è Three.js

L'unico uso di WebGL è un quad a schermo intero con uno shader.
Three.js pesava 668 kB di bundle (187 kB gzip) per disegnare due
triangoli; `core/gl.js` fa la stessa cosa in un centinaio di righe. Il
bundle è passato a **155 kB (58 kB gzip)**.

---

## Asset

I PNG grezzi di Higgsfield stanno in `public/media/raw/` e non
finiscono in pagina: `npm run media` li converte in AVIF a più
larghezze dentro `public/media/img/`.

Due file meritano una nota:

- `volto-matte.avif` — il canale alfa del ritaglio del soggetto, in
  scala di grigi. Lo shader ci campiona sopra per far passare le
  lettere *dietro* il profilo e per ricavare LA LINEA dal contorno
  reale, invece di disegnarla a mano.
- `profilo-mask.png` — la stessa sagoma ma con l'alfa intatto, per
  `mask-image` in CSS. **Deve restare PNG con alfa**: una maschera in
  scala di grigi ha alfa piena ovunque e in modalità predefinita non
  maschera niente.

### Rigenerare con Higgsfield

Tutte le immagini vengono dallo stesso brief fotografico: una sola
sorgente radente da sinistra, nessuna luce di riempimento, monocromo
freddo, pelle non ritoccata. Quel paragrafo va ripetuto in ogni prompt
— è ciò che tiene insieme la campagna.

Vincoli del piano `starter` incontrati durante la produzione:

- risoluzione massima **2k** (`4k` risponde *Pro or Ultimate plan required*)
- **4 job in parallelo**; oltre, la CLI risponde `rate_limit_reached`

Per il ritaglio del soggetto conviene `image_background_remover`
invece di chiedere una silhouette a un modello di immagini: torna
allineato al pixel e con l'alfa già corretto.

---

## Accessibilità

`npx @accesslint/mcp` o la skill `accesslint:scan` — l'ultimo passaggio
riporta **0 violazioni**.

Due decisioni portano il peso:

- **Due accenti.** `--accent` per linee, campiture e display (bastano
  3:1); `--accent-testo` per le annotazioni sotto i 18px (servono
  4.5:1). Senza la separazione, un'etichetta da 10px costringerebbe a
  schiarire il colore del marchio.
- **Le regioni sono `<button>`.** TOPOGRAFIA si attraversa da tastiera
  con la stessa informazione che riceve chi usa il mouse; la prossimità
  del puntatore è un'aggiunta, non il solo modo di entrare.

Con `prefers-reduced-motion` la soglia sparisce, l'hero diventa una
composizione statica, le costruzioni sono già disegnate e il piano di
STRATI si ferma a metà — le due condizioni restano leggibili, senza
che nulla si muova.

---

## Note di produzione

**Il modulo di consulto non è collegato a nulla.** L'invio mostra
esplicitamente che la scheda non è stata inviata. Prima di andare in
produzione serve un endpoint e un trattamento dati conforme.

**Le fotografie sono simulazioni visive.** Nessuna è documentazione di
pazienti reali; la pagina e il piede lo dichiarano. Va mantenuto: in
medicina estetica il confronto prima/dopo è materia regolata.

I nomi, le credenziali e i numeri della dottoressa sono di
presentazione. Vanno sostituiti con quelli reali prima di pubblicare.
