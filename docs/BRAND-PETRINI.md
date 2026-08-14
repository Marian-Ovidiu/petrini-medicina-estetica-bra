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
