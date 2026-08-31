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

    // Attenzione: focus non è un punto sul volto, è il punto fisso dello
    // zoom, e può cadere fuori dall'immagine senza che questo voglia
    // dire niente. Quello che conta è la finestra che ne risulta, ed è
    // quella che va letta — qui sotto è scritta in percentuale
    // dell'immagine, con l'origine in alto a sinistra, misurata a
    // 390×844.
    //
    // Sulla misura verticale la posa di riposo era sbagliata, e non di
    // poco: la finestra cadeva su x 53–70% e y 22–85%, cioè su una
    // fetta che conteneva **solo la punta del naso** (al 70% della
    // larghezza, al 45% dell'altezza). Il labbro superiore sfiorava il
    // bordo destro al 94%, il labbro inferiore era già fuori al 101%, il
    // mento al 108% e l'occhio al 129%. Metà profilo stava oltre il
    // margine destro, e il volto non si leggeva come volto: si leggeva
    // come un naso.
    //
    // La richiesta era «più zoom e naso più in su», ma le due cose
    // tirano in direzioni opposte — stringendo ancora, di profilo ne
    // resta meno, non di più. Il difetto non era la scala, era
    // l'**origine**: la finestra stava sul bordo anteriore del profilo
    // invece che sull'asse naso-bocca. Quindi si allarga (1.58 → 1.25) e
    // si sposta sull'asse del volto. Il fondo è appoggiato al piede
    // dell'immagine perché più in basso non c'è più immagine — è quel
    // margine a decidere quanto in alto può salire il naso.
    //
    // Poi il volto in campo è diventato troppo: entravano occhio,
    // sopracciglio e guancia esterna, e la scena diceva «ritratto» dove
    // deve dire «profilo». La correzione è **solo una panoramica**, a
    // zoom fermo — la scala era giusta, era il campo a essere spostato.
    // La finestra scorre a sinistra di 0.0423 (il 20.5% della propria
    // larghezza) e passa da x 58.9–79.5% a **x 54.6–75.3%, y 19–99%**.
    // Il margine destro cade dove comincia l'occhio; il bordo del
    // profilo, che al naso è il punto più a sinistra del soggetto, si
    // posa esattamente a metà del fotogramma. Da lì la lettura: metà
    // nero, metà volto.
    //
    // La panoramica non cambia l'ingrandimento — resta ×1.48 a 390×844
    // (×1.36 a 360×780, ×1.63 a 430×932), sotto la soglia di sgranatura
    // di ~1.7x della sorgente da 2560px. Era il motivo per non
    // rispondere «metà» con uno zoom ×2: avrebbe portato l'ingrandimento
    // a ×2.96 su una sorgente che non ha quei pixel.
    //
    // Il punto di partenza non può restare condiviso. Su orizzontale il
    // campo iniziale contiene già il bordo illuminato del profilo; sul
    // verticale lo stesso punto cadeva sul fondo vuoto a sinistra del
    // volto, e il primo secondo e mezzo della sequenza era nero — la
    // luce arrivava su niente. La variante verticale parte sulla stessa
    // colonna dove finisce (pura carrellata all'indietro, con una
    // panoramica minima) così l'apertura ha davvero un bordo da
    // illuminare.
    vec2 focusIn = mix(vec2(0.660, 0.430), vec2(0.8788, 0.2648), verticale);

    float zoom  = mix(1.62, mix(1.02, 1.2503, verticale), ease);
    vec2  focus = mix(
      focusIn,
      mix(vec2(0.500, 0.470), vec2(1.2470, 0.0500), verticale),
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
    //
    // Sul verticale la misura segue la camera, e la segue due volte.
    // Portando il volto dentro il fotogramma il profilo si era spostato
    // a sinistra e il cognome diventava «PETR»: il blocco era stato
    // stretto a 0.4628 e sceso di due punti e mezzo. Con la panoramica
    // il bordo del profilo torna indietro di venti punti di larghezza, e
    // a quella misura il nome finiva a un quinto di fotogramma dal
    // profilo: leggibile, ma senza più niente dietro cui passare. Il
    // nome che entra nel volto non è un effetto, è la scena — quindi
    // ricresce a 0.6930.
    //
    // Il numero è il limite di una cosa che non si può avere due volte.
    // Nella banda delle maiuscole — y 48.5-54.3% del fotogramma, la
    // stessa su tutte le misure di telefono — il bordo del profilo non
    // è verticale: scende da 71.5% a 68.9% di larghezza. Un morso su
    // quel bordo è quindi sempre obliquo, e su una I larga tre punti un
    // taglio obliquo non lascia una lettera morsa, lascia un moncone.
    // A 0.7148 il nome arrivava al 71.0%: 0.5 punti di morso in cima e
    // 1.9 in fondo, cioè il 61% dell'ultima lettera mangiato alla base.
    // Illeggibile.
    // A 0.6930 il nome finisce al 69.1%, contro un minimo di bordo di
    // 68.9%: la I resta intera e il suo serif destro tocca la linea.
    // Non è più «dietro», è «appoggiata contro» — ed è il massimo che
    // questa sagoma concede senza rendere illeggibile il cognome.
    // Il blocco si ancora al punto di texture tCenter.x, fermo sullo
    // schermo all'8.6%, quindi il fattore è
    // (bersaglio - ancora) / (estremo - ancora).
    //
    // L'altezza invece non si tocca. Resta la mensola sotto il naso: fra
    // il 45% e il 47% del fotogramma il bordo salta da 36% a 49% di
    // larghezza ed è quasi orizzontale, e una parola che la attraversa
    // non viene morsa, viene tagliata di sbieco. Dove sta ora il bordo
    // è fermo per tutta l'altezza delle maiuscole, e l'ultima I si
    // infila dietro il profilo con un morso solo: «dietro», non
    // «troncato».
    float tScale = mix(2.35, mix(0.6564, 0.6930, verticale), ease);
    vec2  tCenter = mix(
      vec2(0.50, 0.52),
      mix(vec2(0.161, 0.383), vec2(0.0859, 0.260), verticale),
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
