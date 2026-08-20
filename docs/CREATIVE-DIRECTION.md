# Dr. William Petrini — Direzione Creativa

**Medicina estetica**
Concept centrale: **L'ARCHITETTURA DEL VOLTO**

---

## 1. Il marchio è il medico, il concetto è il canone

Questo progetto è nato col marchio **CANONE**. Il marchio ora è il nome del medico —
**Dr. William Petrini**, nella sua firma — e il concetto è rimasto dov'era. Le due
cose vanno tenute separate, perché è la separazione a far funzionare il resto.

Un'insegna che dicesse CANONE metterebbe la propria tesi nel nome. E una tesi
scritta sull'insegna non si può più dimostrare: si può solo ripetere. Con un nome
proprio in testata la tesi torna a essere qualcosa che il sito deve guadagnarsi scena
per scena — che è esattamente il lavoro che le otto scene fanno. Il cambio di nome, da
questo punto di vista, non è una perdita: toglie al progetto la scorciatoia.

Il *canone* è la regola di proporzione: quella di Policleto, quella vitruviana, quella
che gli anatomisti e gli architetti condividono da duemila anni. È l'unica parola che
tiene insieme le tre cose che questo studio deve dire contemporaneamente:

- **medicina** (misura, anatomia, rigore)
- **classicismo / lusso** (proporzione, canone estetico, Italia)
- **architettura** (struttura, non decorazione)

Non è una parola da spa. Non è una parola da e-commerce. È una parola da studio — e
adesso è una parola che il sito *usa* invece di portarla scritta in fronte.

**Dove il canone sopravvive, e in che veste:**

| dove | cosa resta |
|---|---|
| **Scena 02 — «02 — Canone»** | Invariata, ed è la scena che espone la tesi: il canone è un riferimento, non un bersaglio. Qui *canone* è il canone classico, non il marchio. |
| **`lat. canon — la regola della proporzione`**, in calce alla hero | Resta, e migliora. Prima era la glossa del logotipo — un'insegna che spiega se stessa, il lavoro più debole che un'annotazione possa fare. Ora che sopra c'è un nome proprio la stessa riga smette di glossare e dichiara: è il seme della scena 02, non l'eco della testata. |
| **Nomi interni** — `#canone`, `.canone__*`, `src/scenes/canone.js`, `package.json` | Invariati. La scena si chiama Canone. Rinominare il codice sarebbe churn senza nessun guadagno. |

Nella hero il canvas dipinge **PETRINI** al posto di CANONE. La meccanica non cambia:
le ultime lettere passano dietro il profilo e il nome si completa in testata, dove la
firma lo *riscrive per esteso*.

È stata provata anche su due righe, WILLIAM sopra PETRINI, e il cliente l'ha riportata
al solo cognome. La pila funzionava — righe giustificate alla stessa larghezza, cognome
più grande del nome, profilo che taglia entrambe alla stessa ascissa — ma costava:
un blocco alto il doppio deve stringersi per non farsi mangiare le ultime lettere, e
il cognome da solo può tornare grande. `disegnaNome` regge ancora entrambe le forme:
si rimette un elemento nell'array. Cambiando forma vanno però riguardati `tScale` e
`tCenter` nello shader, tarati sull'ingombro reale del blocco.

Posizionamento in una frase:
> Non trasformiamo i volti. Ne ricerchiamo l'armonia.

La seconda riga è stata **architettura**, poi **misura**, e il cliente l'ha chiusa su
**ricerca**. Vale la pena tenere traccia del perché, perché è la riga su cui il sito
si regge e tornerà in discussione.

Il rischio, passando da architettura ad armonia, non era la parola: era il verbo.
«Rispettare l'armonia» — la prima proposta — è un verbo di astensione, e *non
trasformare* più *rispettare* dicono la stessa cosa due volte; la struttura originale
funzionava perché la seconda riga diceva una cosa nuova invece di correggere la prima.
«Misurare» risolveva il problema e in più agganciava la scena 02, che lo scarto lo
misura per davvero. «Ricercare» sta in mezzo e ha una ragione sua: è un'azione, quindi
la riga non si accartoccia, ma non dichiara un metodo — dice che l'armonia è un
obiettivo che si insegue, non un dato che si constata. È più modesto e più difendibile
di «misuriamo» accanto a un volto che non è quello del paziente.

Il prezzo lo si paga in scena 02: dopo il copy nuovo del cliente quella scena non parla
più di misura, quindi il legame fra dichiarazione e dimostrazione ora lo tiene solo la
costruzione grafica, che i terzi continua a misurarli. Regge, ma è un appoggio in meno.

**Lingua:** italiano per la voce editoriale, **latino anatomico** per il livello tecnico
(*zygoma, mandibula, orbicularis oris, sulcus nasolabialis*). Questo doppio registro
**è** il sistema BELLEZZA × SCIENZA — non un'aggiunta grafica.

---

## 2. Sistema colore

Nessun beige-rosa-oro. Nessun bianco minimale da laboratorio. La palette viene
dal **disegno anatomico rinascimentale**: carta, gesso, sanguigna, inchiostro.

| Token | Hex | Ruolo |
|---|---|---|
| `--ink` | `#0A0C0F` | nero freddo, quasi blu. Fondo delle scene notturne, tipografia su gesso |
| `--gesso` | `#EDE7DC` | polvere di marmo / calco in gesso. Grandi superfici chiare |
| `--sanguigna` | `#A8462C` | la sanguigna di Leonardo. Linee di misura, accenti, **anche superfici intere** |
| `--lume` | `#8A959B` | grigio-azzurro freddo. Annotazioni tecniche, metadati |
| `--velo` | `#D6CCBE` | mezzo tono del gesso, ombre sulla carta |

**Regola di confidenza grafica:** le scene alternano *campiture piene* di INK, GESSO e
SANGUIGNA. La sanguigna non è solo un accento da 4px: c'è almeno una scena in cui
occupa tutto il viewport. È lì che il sito smette di sembrare un sito di cliniche.

---

## 3. Tipografia

Tre voci, tre funzioni. Il contrasto tra loro è il contenuto.

- **Bodoni Moda** (display) — La modulazione estrema asta/grazia **è** la modulazione
  della luce su un volto. Bodoni è italiano, è il canone tipografico neoclassico.
  Usato a scale enormi (18–30vw), con le hairline che quasi spariscono.
- **IBM Plex Mono** (tecnico) — nomenclatura latina, misure, protocolli, tempi di
  recupero. 10–12px, tracking aperto, uppercase. La voce clinica.
- **Archivo** (interfaccia/corpo) — tessuto connettivo neutro. Non deve avere opinioni.

Contrasto di scala volutamente violento: un titolo da 24vw accanto a un'annotazione
da 10px. Nessuna misura intermedia comoda.

**E la firma? Non è la quarta voce.** Le voci sono tre e restano tre. La firma del
dott. Petrini non fa il lavoro di un carattere: un carattere compone testo qualsiasi,
la firma dice un nome solo. Non compone mai una parola diversa dal nome, non prende
mai una misura scelta per essere letta come testo corrente, non sta in nessun posto
dove un carattere farebbe la stessa cosa. È un **segno**, e sta con LA LINEA (§4), non
con Bodoni.

La regola che tiene in piedi la distinzione è una regola di conteggio: **una sola
occorrenza in pagina**, la testata, dove il nome identifica.

Erano due. La seconda stava in calce alla scheda di anamnesi, dove il nome sottoscrive
— che è quello che una firma fa davvero — ed è uscita su richiesta del cliente. In
calce resta il nome come testo: una scheda clinica la sottoscrive chi la leggerà, e
senza nessun nome il modulo si chiuderebbe nel vuoto. Il segno se n'è andato, il gesto
no.

Il tetto vale ancora, e ora è più stretto: mai nel piede della pagina, dove il nome c'è
già come testo in registro amministrativo, e mai in un posto dove un carattere farebbe
la stessa cosa. La regola è scritta anche in `base.css`, sopra `.firma`, perché è lì
che qualcuno andrà a cercarla.

La firma che si scrive nella soglia (§4c) **non** è la terza: la soglia non è una
pagina, e quell'elemento esce dal DOM prima che la testata sia visibile. Le due non
convivono mai.

---

## 4. Il dispositivo di firma: **LA LINEA**

Una sola hairline di sanguigna, spessa 1px, **continua per tutto il sito**.

Non è un motivo decorativo ripetuto: è letteralmente la stessa linea che si trasforma.

0. In testata **sta ferma dentro un anello**, per tutta la visita: è il timbro (§4b).
1. Nella soglia **disegna un profilo** di volto, e sotto quel profilo si scrive
   la firma: il marchio si compone prima che la pagina esista (§4c).
2. Nella hero **diventa il contorno della mandibola** del soggetto.
3. In *Canone* **si apre in costruzione geometrica** — i terzi del volto, le sezioni.
4. In *Strati* **diventa vettore muscolare**.
5. In *Topografia* **circonda la regione** che il puntatore avvicina.
6. In *Metodo* **è il filetto sotto i titoli**.
7. In *Consulto* **è la riga del campo del form**.

Una linea, un sito. È questo che fa sembrare il tutto *un sistema progettato*,
non una sequenza di sezioni riuscite.

### 4b. Il lockup: timbro e firma

Il marchio in testata è **il profilo dentro un anello, accanto alla firma**. Non sono
due elementi accostati, ed entrambe le scelte hanno una ragione precisa.

**Perché l'anello.** Il profilo è stato provato nudo, alle misure fra 25 e 50px, ed è
stato scartato guardandolo: il tracciato è un contorno aperto con rapporto 0,42 — alto
e strettissimo — e il naso, che è l'unica cosa che rende leggibile un profilo, a 32px
vale due pixel. Accanto a una firma a pennello il segno non veniva letto come volto:
veniva letto come una **parentesi graffa** davanti al nome. Non è una lettura
incompleta, è una lettura sbagliata, e le scorciatoie non funzionano — ritagliare il
disegno lo peggiora, perché la sua larghezza sta tutta nella fronte e nella nuca
mentre la fascia dei tratti è ancora più magra.

La risposta è stata il **campo**, non il disegno: il tracciato non è toccato — è quello
della soglia, byte per byte, solo inquadrato. Chiuso in un anello il profilo smette di
essere punteggiatura e diventa un segno dentro un timbro, e nessuno legge l'interno di
un timbro come un segno d'interpunzione.

**Perché proprio un anello.** Non è un ornamento preso a prestito: è già uno stato de
LA LINEA, quello che in TOPOGRAFIA si chiude sul landmark. E la coppia che ne esce dice
il mestiere — un referto si autentica con **timbro e firma**, ed è esattamente ciò che
sta in testata. Il lockup non arreda: nomina il documento che il sito vuole essere.

**Gerarchia dentro il timbro.** L'anello è il campo, non la figura: è una hairline
neutra che segue il fondo della scena. Tenuto sul magenta faceva due segni di pari voce
nello stesso centimetro quadrato, e il cerchio vinceva sul profilo — che è il marchio.
Il magenta resta al profilo, cioè a LA LINEA.

**Misure.** Una sola variabile governa il gruppo (`--lockup`): il timbro detta il
quadrato, la firma ne è un multiplo (5,1×), lo spazio fra i due una frazione (0,42×).
Si cambia la variabile e il rapporto tiene — che è la differenza fra un marchio e due
elementi accostati.

**Nessuna coda.** Il lockup non porta descrittore. `<title>` sì, e non è una
contraddizione: sono due oggetti diversi. Un marchio sta dentro la pagina che lo spiega
e può permettersi di tacere; il titolo vive in una barra di schede e in una pagina di
risultati, dove intorno non c'è niente, e «Dr. William Petrini» da solo non dice il
mestiere né distingue questo medico dagli omonimi.

### 4c. La soglia scrive la firma

La soglia non è un caricamento: è **il marchio che si compone**. La linea disegna il
profilo, poi sotto quel profilo la firma si scrive. Sono le due metà del lockup,
nell'ordine in cui si chiude un referto — prima il timbro, poi la mano. Quando la
soglia si apre, quel marchio è già in testata: non compare, si era appena formato
davanti a chi guarda. È il lavoro che un preloader dovrebbe fare e quasi mai fa.

**Come si scrive una firma raster.** Il profilo si scopre con `stroke-dashoffset`
perché è un tracciato. La firma no: è una fotografia di un segno, e non ha nessun
percorso da svelare. Al suo posto una **seconda maschera** — una lama di gradiente —
che avanza sopra la prima e la lascia passare solo fino a dove è arrivata; le due si
intersecano e resta l'inchiostro già scritto.

Funziona perché una corsiva **si scrive nell'ordine in cui si legge**. La lama non
simula la scrittura: segue la stessa direzione della mano, da sinistra a destra. Due
dettagli fanno la differenza fra un gesto e una tendina — l'inclinazione della lama
(96°, la pendenza delle aste della firma: verticale su una scrittura inclinata si
smaschera subito) e il bordo sfumato all'8%, perché un taglio netto è una maschera
mentre un bordo morbido è inchiostro che arriva.

La strada alternativa era ricalcare la firma come tracciato SVG e animarla davvero.
È stata scartata e vale la pena dire perché: il ricalco di un pennello restituisce il
**contorno**, non l'asse, quindi `stroke-dashoffset` disegnerebbe il perimetro della
firma invece della firma; e un ricalco ad asse singolo perde lo spessore modulato, che
è tutto il carattere di questo segno. Meglio il segno vero rivelato bene che un segno
finto animato meglio.

**Perché non è la terza occorrenza.** La regola di §3 dice due, e regge: la soglia non
è una pagina. Quell'elemento **esce dal DOM** quando la soglia si apre, e non convive
mai con le altre due — quando la testata è visibile, quella firma non c'è più. È la
stessa occorrenza della testata, vista mentre arriva.

**Costo.** La soglia passa da ~3,0 a ~3,2 secondi. La firma parte prima che il profilo
abbia finito, e la sovrapposizione non è un risparmio di tempo: due gesti in fila si
guardano come una lista, due gesti che si accavallano si guardano come una mano sola
che continua a scrivere.

---

## 5. Narrativa — sette scene, nessuna sezione

Le transizioni sono parte della scena precedente, mai uno stacco.

| # | Scena | Cosa succede | Registro |
|---|---|---|---|
| 00 | **SOGLIA** | La linea disegna un profilo mentre scorre nomenclatura latina, poi la firma si scrive sotto. Quando il marchio è composto, si apre. | ink |
| 01 | **LUCE** | La luce arriva sul volto — all'inizio passa solo il bordo illuminato del profilo, poi la faccia emerge dall'ombra mentre la camera arretra. La tipografia esiste in profondità, occlusa dal volto. La sequenza si suona da sola all'atterraggio. | ink |
| 02 | **CANONE** | Dal mento la linea esce e costruisce la proporzione classica sopra il ritratto. Il puntatore muove la sorgente di luce. | gesso |
| 03 | **STRATI** | Un piano attraversa il volto: superficie → topologia di luce → vettori muscolari → osso. Reso come disegno a sanguigna sopra la fotografia, non come HUD. | ink |
| 04 | **TOPOGRAFIA** | Il volto **è** l'interfaccia. La prossimità del puntatore porta avanti una regione; compare il dossier clinico del trattamento. | sanguigna |
| 05 | **METODO** | Respiro editoriale. Tipografia enorme, protocollo numerato, quasi nessun movimento. | gesso |
| 06 | **MEDICO** | La fotografia vera del dott. Petrini e il suo nome, per ora nient'altro: il copy è atteso dal cliente e le credenziali che c'erano erano inventate. Quando tornano, sono il livello di annotazione tecnica, non una bio. | ink |
| 07 | **CONSULTO** | Anamnesi, non "Book Now". Il form come modulo clinico. | ink |

Catena di transizioni: il crop della hero **entra** nello zigomo → lo zigomo genera la
linea di misura → la misura diventa costruzione anatomica → l'anatomia introduce la
filosofia → la fotografia ritorna → il medico emerge da quel mondo.

---

## 6. Le quattro interazioni signature

Meccaniche diverse, non varianti della stessa.

**S1 — OCCLUSIONE (profondità + apertura di luce)** · scena LUCE
Il ritratto è composto in WebGL con la propria matte. Il nome `WILLIAM PETRINI`, su due
righe, vive nello spazio *attorno* al volto: le ultime lettere di entrambe le righe
passano dietro il profilo, tagliate alla stessa ascissa. L'apertura è
un diaframma — a zero passa solo il bordo illuminato, poi il volto emerge dall'ombra
mentre la camera arretra.

> Revisione dopo la prima presentazione al cliente: il macro di pelle in apertura è
> stato rimosso, e la sequenza non è più guidata dallo scroll ma si suona da sola in
> ~3,7 s all'atterraggio, accelerando se il visitatore si muove prima della fine.
> Cadendo il macro cadeva anche la ragione per partire a forte ingrandimento — oltre
> ~1,7× la sorgente si sgrana — quindi l'apertura è passata dall'ottica alla luce,
> che non dipende dalla risoluzione.
>
> Passando da CANONE a PETRINI la geometria dell'occlusione non cambia: la scala è
> dettata dalla larghezza (`size *= (w * 0.94) / measureText(word).width`), quindi la
> parola occupa la stessa frazione di texture e viene tagliata nello stesso punto.
> Cambia solo *quale* lettera ci finisce sotto, e in meglio: PETRINI è più stretta di
> CANONE a parità di corpo — due `I` invece di due `O` — quindi il corpo cresce del
> 4,9% e l'altezza delle maiuscole del 2,8%, e il taglio cade su uno stelo verticale
> invece che su una lettera tonda. Un montante che continua dietro il naso si legge
> come una lettera occlusa; una `O` mozzata si legge come un errore.
>
> Il passaggio successivo — il nome su due righe — è invece l'unico che ha richiesto di
> rimettere le mani sulla posa, e non per gusto. Il blocco è alto il doppio della riga
> sola e alla misura di prima arrivava dentro il claim: due testi in latte sovrapposti
> non sono una composizione in profondità, sono una collisione.
>
> Ma la correzione vera è arrivata dal cliente, guardando: **il profilo non copriva un
> pezzo dell'ultima lettera, se la mangiava.** WILLIAM finiva in «WILLIA» e PETRINI in
> «PETRI», su tutte e due le misure. È il punto in cui l'occlusione smette di essere
> profondità e diventa un errore di composizione — un nome troncato si legge come un
> nome troncato, non come un nome dietro una faccia.
>
> La causa è geometrica e vale la pena scriverla, perché tornerà a ogni cambio di
> nome: **il blocco su due righe è largo quanto la riga sola**, ma la sua ultima
> lettera deve fermarsi dove si ferma quella di *entrambe* le righe, e le due righe
> incontrano il profilo ad altezze diverse — WILLIAM sulla fronte, PETRINI sul naso,
> che sporge molto più a sinistra. La misura la detta il naso, non la fronte. Con le
> `W` in testa il blocco semplicemente non ci stava: è stato stretto e portato a
> sinistra (orizzontale `tScale` 0,84 → 0,656 e `tCenter` 0,470/0,470 → 0,161/0,383;
> verticale 0,62 → 0,697 e 0,360/0,620 → 0,129/0,500).
>
> Le due regole che restano, e che vanno tenute insieme perché tirano in direzioni
> opposte: **il nome deve toccare il volto** — se non lo tocca non è più S1, è una
> scritta sopra una fotografia, ed è esattamente l'errore opposto in cui si cade
> stringendo troppo — e **deve toccarlo per un morso, non per una lettera.** Fra le
> due, si sbaglia dalla parte della leggibilità: un nome intero che sfiora il profilo
> è una composizione riuscita a metà, un nome tagliato è una composizione sbagliata.

**S2 — LA COSTRUZIONE (scroll-controlled motion)** · scena CANONE
La geometria della proporzione si disegna con lo scroll — path SVG con `stroke-dashoffset`
guidato dal progresso, non un fade-in. Il puntatore controlla l'angolo della luce sul
ritratto: i valori di ombra rispondono, e la costruzione geometrica si aggancia ai
landmark reali quando la luce li rivela.

**S3 — TOPOGRAFIA (pointer)** · scena TOPOGRAFIA
Nessuna card. Il volto a tutto schermo; la prossimità del puntatore a una regione
anatomica la fa emergere — crop che spinge dentro, contorno di sanguigna che si chiude,
dossier che si scrive in monospace. La distanza controlla l'intensità in modo continuo,
non on/off.

**S4 — IL PIANO (multi-medium: video + tipografia + mask + grafica + scroll)** · scena STRATI
Un piano orizzontale attraversa il volto. Sopra il piano: fotografia. Sotto: la stessa
immagine come disegno a sanguigna con i vettori muscolari. Il piano è una mask animata,
il video continua a girare sotto, la tipografia latina si aggancia al piano e scorre con lui.

**Interazioni originali inventate per questo progetto:**
- **La Linea** (§4) — continuità narrativa attraverso l'intero documento.
- **Risoluzione a sanguigna** — le immagini entrano in scena come disegno a gesso e
  *risolvono* in fotografia in base alla velocità di scroll. Il medium stesso racconta
  "dal progetto al risultato".
- **Anamnesi progressiva** — nel Consulto ogni campo compilato aggiunge un tratto alla
  linea del profilo: il visitatore disegna letteralmente il proprio volto compilando.

---

## 7. Cancelli di qualità

Ogni scena passa o si rifà. Se una scena, sostituendo il testo, potrebbe appartenere a
un'altra clinica → si ridisegna.

CONCEPT · ORIGINALITÀ · COMPOSIZIONE · TIPOGRAFIA · MOTION · INTERAZIONE ·
ASSET · RESPONSIVE · PERFORMANCE · ACCESSIBILITÀ · RIFINITURA
