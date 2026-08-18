# Edizione brand Petrini

Ramo `petrini`. Il ramo `main` conserva la palette originale
(inchiostro / gesso / sanguigna) descritta in
[CREATIVE-DIRECTION.md](CREATIVE-DIRECTION.md).

Palette sorgente, estratta da `petrinistudiodentistico.it` pesando i
colori sull'area realmente occupata — il tema è fatto con Bricks
Builder e dichiara ~45 variabili, quasi tutte default Material da
ignorare:

| | |
|---|---|
| lime | `#93E336` |
| verde pallido | `#DBFFC2` |
| verde lavato | `#F8FFF2` |
| magenta | `#EF3984` |
| grigio testo | `#484848` |

---

## I due problemi da risolvere prima di poterla usare

**1. Il brand non ha un scuro.** `#484848` è un medio. Usato come
fondo avrebbe reso slavata ogni scena, e tutta la costruzione — il
volto scontornato, la tipografia occlusa, la linea — vive sul
contrasto fra un fondo profondo e una superficie chiara.

Invece di importare un nero estraneo, il lime è stato portato in fondo
alla propria scala di valore: `--pece #0E1207`. Contro il lime si
legge come profondità dello stesso colore, non come un secondo colore.

**2. Il magenta non porta il significato della sanguigna.** Nella
versione originale la linea era sanguigna perché quella è la matita
del disegno anatomico rinascimentale: il concetto la giustificava.

Il magenta ha una giustificazione sua, più diretta: è **la matita
dermografica con cui si segna un volto prima di intervenire**. LA
LINEA resta LA LINEA e cambia solo genealogia — dal disegno
d'accademia al segno pre-operatorio. Su questo brand funziona meglio
di quanto funzionasse la sanguigna.

---

## Traduzione dei ruoli

| ruolo | prima | ora |
|---|---|---|
| fondo profondo | `--ink #0A0C0F` | `--pece #0E1207` |
| carta | `--gesso #EDE7DC` | `--latte #F8FFF2` |
| mezzo tono | `--velo` | `--tenero #DBFFC2` |
| **la linea** | `--sanguigna #A8462C` | `--marker #EF3984` |
| campitura satura | sanguigna a tutto viewport | **lime a tutto viewport** |
| annotazioni | `--lume` grigio-azzurro | `--fumo #7C8A72` verde-grigio |

Nella sorgente il lime è timido: una barra e qualche velatura. Qui fa
il contrario — TOPOGRAFIA è lime pieno. È il momento in cui il brand
smette di decorare e dichiara. Le velature restano, ma come carta.

Sul lime la figura si inverte: essendo un colore chiaro, testo e segni
diventano scuri. Il magenta lì resta solo per la grafica, perché su
lime non arriva a 4,5:1.

---

## Duotone

La fotografia era monocroma **fredda**, con le ombre virate al blu.
Appoggiata su un lime caldo e saturo litigava: due temperature che non
si sono mai incontrate.

Un filtro SVG rimappa la luminanza fra i due estremi del brand — pece
nelle ombre, latte nelle luci. Non è una velatura colorata sopra
l'immagine: è la fotografia ricostruita dentro la scala del marchio, e
infatti continua a leggersi come fotografia e non come filtro.
L'hero fa la stessa operazione nel proprio shader, dove costa un
prodotto scalare invece di un passaggio di filtro sul canvas.

---

## Cosa è cambiato nella scena TOPOGRAFIA

Nella versione originale la fotografia esisteva **solo dentro la
sagoma del profilo**, ritagliata su campitura piena.

Su lime non regge, e non per una questione di rifinitura: i capelli
sono scuri su fondo scuro e **non c'è informazione da cui separarli**.
Ogni scontorno lascia una frangia di alfa parziale. Su inchiostro non
si vedeva; su lime la testa si tingeva di verde. Provati e scartati:
irrigidimento dell'alfa, soglia binaria, riempimento per righe dal
bordo del profilo (che introduceva striature).

La scena usa una **lastra rettangolare** — la stessa lingua di CANONE
e STRATI, fotografie appoggiate sul foglio e mai incollate. Il profilo
si legge lo stesso, perché è illuminato contro il nero dentro
l'inquadratura.

È caduto anche il push-in sulla regione: scalava la fotografia ma non
la maschera, e la sagoma finiva per ritagliare un volto ingrandito
lungo il contorno di uno non ingrandito. Al suo posto **l'anello**, un
cerchio di marker che si chiude sul landmark — che non dipende da
nessuno scontorno ed è un altro stato de LA LINEA.

---

## Il marchio: firma e lockup

La landing non si chiama più CANONE. Il marchio è il nome del medico, e il
logotipo è la sua **firma manoscritta**. Il perché — e cosa succede al
concetto «canone», che sopravvive — sta in
[CREATIVE-DIRECTION.md §1](CREATIVE-DIRECTION.md).

### Gli asset

| file | cosa è |
|---|---|
| `public/media/raw/firma-petrini.jpeg` | sorgente del cliente, 874×874, inchiostro verde su bianco. Versionato per eccezione in `.gitignore`: è un asset di marchio, non un render rigenerabile. |
| `public/media/img/firma-petrini.png` | 590×96, 27 KB. **Maschera alfa**: pixel bianchi, alfa = copertura dell'inchiostro. |

### Perché una maschera e non un'immagine

Il verde del JPEG del cliente **non è nessuno dei verdi della palette**, e
la testata attraversa tre fondi diversi. Una `<img>` porterebbe con sé quel
verde su tutti e tre.

Come maschera alfa il colore lo mette il fondo — `background-color:
var(--figure)` — e la firma segue la scena da sola:

| fondo | firma | verificato |
|---|---|---|
| `--pece` | `--latte` `#f8fff2` | 18,6:1 |
| `--latte` | `--pece` `#0e1207` | 18,6:1 |
| `--lime` | `--pece` `#0e1207` | 12,0:1 |

Una sola dichiarazione copre i tre casi. È il motivo per cui la maschera
batte sia l'`<img>` colorata sia l'SVG tracciato — che oltretutto qui non
era praticabile: non ci sono potrace né autotrace installati, e la sorgente
è raster a bassa risoluzione.

**Il tetto di 360px** è dichiarato su `.firma` in `base.css`. Oltre quella
larghezza a schermo la sorgente si ammorbidisce. Nessuna delle due
occorrenze la chiede più larga — la testata arriva a 168px, la firma in
calce a 186px — e alle densità reali (2×, 3×) resta sotto i 590px nativi,
cioè sempre in riduzione e mai in ingrandimento.

### Il problema del text-shadow

La testata scorre sopra fotografie ad altissimo contrasto, e per questo il
marchio testuale aveva un `text-shadow` oltre al velo. **Una maschera alfa
non ha text-shadow.**

Lo fa un `filter: drop-shadow()`, che segue l'alfa del disegnato invece del
rettangolo dell'elemento. Sta sul **gruppo** (`.testata__marchio`) e non
sulla firma, perché il filtro si applica *prima* del mascheramento: messo
sull'elemento mascherato ombreggerebbe il suo box, e poi l'ombra verrebbe
ritagliata via insieme al resto. Sul genitore il filtro vede il gruppo già
disegnato, e con un'ombra sola difende anche il timbro.

### Il lockup: timbro e firma

Il ragionamento completo sta in [CREATIVE-DIRECTION.md §4b](CREATIVE-DIRECTION.md).
In sintesi: il profilo **nudo, a misura di testata, non legge come volto —
legge come una parentesi graffa**. È stato provato fra 25 e 50px e scartato
guardandolo. Chiuso in un anello smette di essere punteggiatura e diventa un
segno dentro un timbro; il tracciato non è toccato, è quello della soglia
byte per byte, solo inquadrato.

L'anello è una hairline neutra che segue il fondo
(`color-mix(--figure 45%, transparent)`), non magenta: sul magenta il
cerchio vinceva sul profilo, che è il marchio.

**Il profilo resta magenta su ogni fondo, lime compreso** — dove scende a
2,4:1. È voluto ed è la stessa deroga che il brand si dà già per l'anello di
TOPOGRAFIA: sul lime il magenta vale per la grafica e non per il testo. Un
logotipo è inoltre fuori dal perimetro di 1.4.3 e 1.4.11. La firma accanto,
che è la parte che si legge, sta a 12,0:1.

### Nome accessibile

Con `mask-image` non esiste `alt`. Il link `.testata__marchio` prende il nome
da uno `<span class="visually-hidden">Dr. William Petrini</span>`, e sia il
timbro sia la firma sono `aria-hidden`. Testo vero e non `aria-label`: così
il nome sopravvive anche senza CSS, resta traducibile e resta indicizzabile.

### Due forme del nome, e quando usarle

| forma | dove | perché |
|---|---|---|
| **Dr. William Petrini** | marchio e amministrazione: `<title>`, nome accessibile del lockup, piede di pagina, riga sotto la firma in calce al modulo | è la forma che il cliente ha firmato — «Dr.» sta dentro il logotipo |
| **William Petrini** | scena 06, dove il nome è composto in Bodoni a 84px | a quella scala l'abbreviazione è un ingombro, e il titolo lo porta già il logotipo tre schermate più su. Il nome nudo, grande, accanto al ritratto |

Quello che non compare più da nessuna parte è una **qualifica**: né
«direttore sanitario», né la città. Vedi *Segnaposto*, punto 2.

---

## Accessibilità

0 violazioni, come su `main`, ma le correzioni sono diverse: la
palette nuova ne ha introdotte 11 e ognuna aveva una causa propria.

- `--accent-testo` su fondo chiaro è `#A81850`, non il magenta pieno
  (che su latte si ferma a 3,2:1).
- Sul verde-nero il magenta pieno passa a 5,5:1: è l'unico fondo su
  cui il colore del brand non va corretto.
- Lo skip-link ha fondo scuro e il magenta come filetto: magenta pieno
  con testo chiaro sopra si ferma a 3,7:1.
- Le targhette dei punti sono `visibility: hidden` quando spente. A
  sola opacità zero restano nell'albero di accessibilità e vengono
  misurate contro il fondo, dove non passano mai.

Il lockup non ha aggiunto violazioni: il nome accessibile è testo vero, e
timbro e firma sono `aria-hidden` — nessun doppione nell'albero. La firma
in calce al modulo è decorativa e il nome accanto è testo.

---

## Segnaposto — da chiudere prima di pubblicare

**1. ~~Il ritratto della scena 06 è un volto femminile.~~ Chiuso.**
Il cliente ha mandato la sua fotografia e la scena 06 ora ritrae lui. Arriva
come scatto da tessera — fondo bianco, casacca ciano, sorriso — e vale la
pena dire perché non è stata ritoccata: il duotone del brand porta il bianco
esattamente sul latte della palette e il ciano su un mezzo tono, quindi la
fotografia entra nel sito come ci entrano le altre, e la lastra chiara si
appoggia sulla scena scura invece di litigarci. Il taglio la porta al 4:5
delle altre lastre e si ferma appena sopra il ricamo «Dr. Petrini W.» sulla
casacca, che a metà si leggerebbe come una sbavatura — e che il sito dice
già meglio, con la firma.

Resta un limite vero: la sorgente utile è **968px**, e il ritratto occupa
40vw. Su schermi a densità doppia è servito appena sotto il suo optimum.
Non si risolve in pipeline, si risolve con uno scatto più grande.

**2. Il copy della scena 06 non c'è, ed è voluto.**
La scena porta il ritratto e il nome, e nient'altro. Erano fuori una frase
virgolettata e cinque righe di credenziali — formazione, ateneo, anni,
numero di procedure — scritte per la presentazione e non prese da nessun
documento: accanto al nome di una persona reale non sono un lorem ipsum ma
affermazioni verificabili, e la frase era peggio, perché metteva parole
inventate in bocca a lui. Per lo stesso motivo è caduta la qualifica
«direttore sanitario» dal piede e dal modulo.

La città ha avuto una storia sua. «Torino» era l'ambientazione dello studio
inventato e non un indirizzo, quindi era uscita insieme al resto — ma quella
vera esiste, il cliente l'ha confermata ed è **Bra**. Sta nel piede accanto
al nome. Non è nel `<title>`, dove però entrerebbe volentieri: una ricerca
locale è il modo in cui questo studio si trova.

Il cliente aspetta il copy vero. Quando arriva: la frase torna in
`.medico__frase`, le credenziali in una `<dl class="medico__credenziali">`
— **lo stile di entrambe è già in `editoriali.css` e aspetta lì**, non è
stato rimosso apposta. Sulle credenziali la forma conta quanto il
contenuto: la pubblicità sanitaria richiede provincia dell'Ordine e numero
di iscrizione.

**3. Il segno a misura piccola.**
Il timbro risolve la lettura, ma il profilo a 26–33px resta al limite della
propria leggibilità: il naso vale due pixel. Se il cliente vuole spingere
oltre, l'unico asset che servirebbe è una **variante del logo disegnata per
le misure piccole** — stesso volto, incavo del naso più profondo e contorno
più corto. Non è stata fatta qui perché ridisegnare il logo non era nel
mandato.
