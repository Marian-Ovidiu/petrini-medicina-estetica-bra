export const frag = /* glsl */ `#version 300 es
  precision highp float;

  in vec2 vUv;
  out vec4 fragColor;

  uniform sampler2D uPortrait;
  uniform sampler2D uMatte;
  uniform sampler2D uType;

  uniform vec2  uRes;
  uniform float uImgAspect;
  uniform float uTypeAspect;

  uniform float uProgress;   // 0 = dentro la pelle, 1 = profilo intero
  uniform float uTime;
  uniform vec2  uPointer;    // -1..1 smorzato
  uniform float uLinea;      // intensità del marker sul contorno
  uniform float uApertura;   // il diaframma: 0 = solo le luci alte
  uniform float uTypeAlpha;

  uniform vec3 uGround;
  uniform vec3 uSanguigna;
  uniform vec3 uFigure;

  // Inquadratura "cover" — l'immagine riempie sempre il viewport
  vec2 cover(vec2 uv, float screenA, float imgA) {
    vec2 r = screenA > imgA ? vec2(1.0, imgA / screenA) : vec2(screenA / imgA, 1.0);
    return (uv - 0.5) * r + 0.5;
  }

  // La tipografia non si comporta come una fotografia: la parola deve
  // stare nella larghezza, mai essere tagliata dall'inquadratura.
  // È la larghezza dello schermo a dettare la misura del carattere.
  vec2 fitWidth(vec2 uv, float screenA, float imgA) {
    return vec2(uv.x, (uv.y - 0.5) * (imgA / screenA) + 0.5);
  }

  // La matte è il canale alfa del ritaglio reale: bianco = soggetto
  float subject(vec2 uv) {
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
    return smoothstep(0.30, 0.70, texture(uMatte, uv).r);
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // Duotone del brand: la luminanza della fotografia rimappata fra i
  // due estremi della palette. È la stessa operazione che il filtro
  // SVG fa sulle altre immagini del sito — qui costa un prodotto
  // scalare invece di un passaggio di filtro su tutto il canvas.
  vec3 duotone(vec3 c, float apertura) {
    float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
    // L'apertura è il diaframma della scena. A zero passa solo il
    // bordo illuminato del profilo — fronte, naso, labbra — e tutto
    // il resto sta nel nero; mentre sale, il volto emerge dall'ombra.
    // È il modo in cui una luce arriva davvero su una faccia, e
    // funziona a qualsiasi risoluzione: sostituisce il macro senza
    // chiedere pixel che non abbiamo.
    lum = smoothstep(mix(0.80, 0.0, apertura), 1.0, lum);
    return mix(uGround, uFigure, lum);
  }

  void main() {
    float screenA = uRes.x / uRes.y;

    // ── camera ────────────────────────────────────────────────
    // Una carrellata all'indietro, contenuta. Il macro d'apertura è
    // stato tolto, e con lui la ragione per partire a forte
    // ingrandimento: oltre ~1.7x la sorgente da 2560px si sgrana, e
    // senza il macro a coprirla la sgranatura si vedrebbe. L'apertura
    // la fa la luce, sotto, che non dipende dalla risoluzione.
    float p = uProgress;
    float ease = p * p * (3.0 - 2.0 * p);

    // Su schermo verticale l'inquadratura larga non si può usare com'è:
    // il "cover" ritaglia il centro, che qui è campo vuoto, e il volto
    // esce dal fotogramma. Non è una questione di dimensioni ma di
    // inquadratura — quindi su portrait la camera si sposta sul
    // profilo e resta più stretta. Stessa scena, altra fotografia.
    float verticale = 1.0 - smoothstep(0.86, 1.30, screenA);

    float zoom  = mix(1.62, mix(1.02, 1.58, verticale), ease);
    vec2  focus = mix(
      vec2(0.660, 0.430),
      mix(vec2(0.500, 0.470), vec2(0.815, 0.400), verticale),
      ease
    );

    // Il soggetto ha massa: reagisce al puntatore meno della tipografia.
    vec2 drift = uPointer * vec2(0.010, 0.007) * mix(0.25, 1.0, ease);

    vec2 pUv = cover(vUv, screenA, uImgAspect);
    pUv = (pUv - focus) / zoom + focus + drift;

    // ── piano tipografico ─────────────────────────────────────
    // Scala e deriva diverse dal ritratto: da qui nasce la profondità.
    // Il nome arriva da dietro il volto e si posa nella larghezza.
    // Il centro deriva verso sinistra: le ultime lettere restano
    // dietro il profilo, e il nome si completa nella testata, non qui.
    // In verticale si ritira a sinistra e si rimpicciolisce: deve
    // lasciare il profilo in campo, non scavalcarlo.
    //
    // Il nome sta su due righe, quindi il blocco è alto il doppio di
    // quanto fosse la riga sola e la posa non è più la stessa: sale
    // sopra il centro ottico e stringe. Non è rifinitura — a parità di
    // misura arrivava dentro il claim, e due testi in latte sovrapposti
    // non sono una composizione in profondità, sono una collisione.
    //
    // La misura la detta il naso, non la fronte. Le due righe incontrano
    // il profilo ad altezze diverse, e il naso sporge molto più a
    // sinistra: se il blocco si posa sulla fronte, sotto il naso si
    // mangia l'ultima lettera del cognome. Questi numeri sono tarati
    // sul punto in cui *entrambe* le righe perdono un morso e nessuna
    // perde una lettera — l'occlusione deve dire «dietro», non
    // «troncato». Cambiando il nome vanno rifatti guardando, perché
    // dipendono da quanto sono larghe le sue ultime lettere.
    float tScale = mix(2.35, mix(0.6564, 0.697, verticale), ease);
    vec2  tCenter = mix(
      vec2(0.50, 0.52),
      mix(vec2(0.161, 0.383), vec2(0.129, 0.500), verticale),
      ease
    );
    vec2  tDrift = uPointer * vec2(0.030, 0.020);
    vec2  tUv = fitWidth(vUv, screenA, uTypeAspect);
    tUv = (tUv - tCenter) / tScale + tCenter + tDrift;

    vec4 tcol = vec4(0.0);
    if (tUv.x >= 0.0 && tUv.x <= 1.0 && tUv.y >= 0.0 && tUv.y <= 1.0) {
      tcol = texture(uType, tUv);
    }

    // ── composizione ──────────────────────────────────────────
    vec3 col = uGround;
    col = mix(col, uFigure, tcol.a * uTypeAlpha);

    vec4 photo = texture(uPortrait, clamp(pUv, 0.0, 1.0));
    float m = subject(pUv);

    col = mix(col, duotone(photo.rgb, uApertura), m);

    // ── LA LINEA ──────────────────────────────────────────────
    // Il contorno reale del profilo, ripreso a sanguigna.
    // Lo spessore è in pixel di schermo, non in pixel d'immagine:
    // dividendo per lo zoom la linea resta una hairline a qualunque
    // distanza di camera, invece di gonfiarsi in un alone.
    float px = 1.15 / (uRes.y * zoom);
    float e = 0.0;
    e += abs(m - subject(pUv + vec2(px, 0.0)));
    e += abs(m - subject(pUv - vec2(px, 0.0)));
    e += abs(m - subject(pUv + vec2(0.0, px)));
    e += abs(m - subject(pUv - vec2(0.0, px)));
    float line = smoothstep(0.10, 0.55, e) * uLinea;
    col = mix(col, uSanguigna, line);

    // ── grana ─────────────────────────────────────────────────
    // Unifica fotografia e grafica sotto una sola superficie e
    // toglie alle immagini generate quella pulizia troppo digitale.
    float g = hash(gl_FragCoord.xy + floor(uTime * 12.0));
    col += (g - 0.5) * 0.028;

    fragColor = vec4(col, 1.0);
  }
`;
