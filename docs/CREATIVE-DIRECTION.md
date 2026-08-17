# CANONE — Direzione Creativa

**Studio di Medicina Estetica**
Concept centrale: **L'ARCHITETTURA DEL VOLTO**

---

## 1. Perché "CANONE"

Il *canone* è la regola di proporzione: quella di Policleto, quella vitruviana, quella
che gli anatomisti e gli architetti condividono da duemila anni. È l'unica parola che
tiene insieme le tre cose che questo brand deve dire contemporaneamente:

- **medicina** (misura, anatomia, rigore)
- **classicismo / lusso** (proporzione, canone estetico, Italia)
- **architettura** (struttura, non decorazione)

Non è una parola da spa. Non è una parola da e-commerce. È una parola da studio.

Posizionamento in una frase:
> Non trasformiamo i volti. Ne comprendiamo l'architettura.

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

---

## 4. Il dispositivo di firma: **LA LINEA**

Una sola hairline di sanguigna, spessa 1px, **continua per tutto il sito**.

Non è un motivo decorativo ripetuto: è letteralmente la stessa linea che si trasforma.

1. Nel preloader **disegna un profilo** di volto.
2. Nella hero **diventa il contorno della mandibola** del soggetto.
3. In *Canone* **si apre in costruzione geometrica** — i terzi del volto, le sezioni.
4. In *Strati* **diventa vettore muscolare**.
5. In *Topografia* **circonda la regione** che il puntatore avvicina.
6. In *Metodo* **è il filetto sotto i titoli**.
7. In *Consulto* **è la riga del campo del form**.

Una linea, un sito. È questo che fa sembrare il tutto *un sistema progettato*,
non una sequenza di sezioni riuscite.

---

## 5. Narrativa — otto scene, nessuna sezione

Le transizioni sono parte della scena precedente, mai uno stacco.

| # | Scena | Cosa succede | Registro |
|---|---|---|---|
| 00 | **SOGLIA** | La linea disegna un profilo mentre scorre nomenclatura latina. Poi si apre. | ink |
| 01 | **LUCE** | La luce arriva sul volto — all'inizio passa solo il bordo illuminato del profilo, poi la faccia emerge dall'ombra mentre la camera arretra. La tipografia esiste in profondità, occlusa dal volto. La sequenza si suona da sola all'atterraggio. | ink |
| 02 | **CANONE** | Dal mento la linea esce e costruisce la proporzione classica sopra il ritratto. Il puntatore muove la sorgente di luce. | gesso |
| 03 | **STRATI** | Un piano attraversa il volto: superficie → topologia di luce → vettori muscolari → osso. Reso come disegno a sanguigna sopra la fotografia, non come HUD. | ink |
| 04 | **TOPOGRAFIA** | Il volto **è** l'interfaccia. La prossimità del puntatore porta avanti una regione; compare il dossier clinico del trattamento. | sanguigna |
| 05 | **METODO** | Respiro editoriale. Tipografia enorme, protocollo numerato, quasi nessun movimento. | gesso |
| 06 | **MEDICO** | Ritratto editoriale. Le credenziali sono il livello di annotazione tecnica, non una bio. | ink |
| 07 | **ESITI** | Casi clinici, non gallerie. Il ritratto resta fisso; lo scroll attraversa T0 → T+14gg → T+90gg mentre il ragionamento medico si annota a lato. | gesso |
| 08 | **CONSULTO** | Anamnesi, non "Book Now". Il form come modulo clinico. | ink |

Catena di transizioni: il crop della hero **entra** nello zigomo → lo zigomo genera la
linea di misura → la misura diventa costruzione anatomica → l'anatomia introduce la
filosofia → la fotografia ritorna → il medico emerge da quel mondo.

---

## 6. Le quattro interazioni signature

Meccaniche diverse, non varianti della stessa.

**S1 — OCCLUSIONE (profondità + apertura di luce)** · scena LUCE
Il ritratto è composto in WebGL con la propria matte. La parola `CANONE` vive nello
spazio *attorno* al volto: le ultime lettere passano dietro il profilo. L'apertura è
un diaframma — a zero passa solo il bordo illuminato, poi il volto emerge dall'ombra
mentre la camera arretra.

> Revisione dopo la prima presentazione al cliente: il macro di pelle in apertura è
> stato rimosso, e la sequenza non è più guidata dallo scroll ma si suona da sola in
> ~3,7 s all'atterraggio, accelerando se il visitatore si muove prima della fine.
> Cadendo il macro cadeva anche la ragione per partire a forte ingrandimento — oltre
> ~1,7× la sorgente si sgrana — quindi l'apertura è passata dall'ottica alla luce,
> che non dipende dalla risoluzione.

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
