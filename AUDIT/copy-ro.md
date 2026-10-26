# Audit de text — versiunea română (ellina-live)

Sursă: `/home/claude/ellina-live/src` (citită, nemodificată). Fișierul `copy-ro.json` din același folder conține aceleași modificări într-un format care poate fi aplicat automat (fiecare `old` apare exact o dată în fișierul lui; verificat, iar JSON-ul rezultat e valid).

## Constatări generale

- **Diacritice:** nicio sedilă (ş ţ) în textul românesc. Toate sunt ș ț cu virgulă. Nu e nimic de corectat aici.
- **Forma de adresare:** site-ul folosește aproape peste tot **„dumneavoastră”** (Verificați, Spuneți-mi, Trimiteți-mi). Excepțiile sunt la etichetele de cursor și la butoanele Închide: `Vezi`, `Redă`, `Mărește`, `Închide`. Le-am trecut toate la forma de politețe.
- **„Previzualizări”** apare de 12 ori și e cea mai vizibilă problemă de calc. În română, „previzualizare” e un termen de software (print preview). Un fotograf din Chișinău spune „primele fotografii (editate)” sau „o primă selecție”. L-am înlocuit peste tot cu **„primele fotografii (editate)”**.
- **„Ședință” fără „foto”** înseamnă „meeting”. Exemple: CTA-ul „Planificați o ședință”, titlul paginii de contact „Planificăm / o ședință?” și „Data dorită pentru ședință” la un calculator pentru conferințe. Proiectul *O zi la birou* folosește chiar „în timpul unei ședințe” cu sensul de meeting. Propunerea: „ședință foto” doar pentru branduri, iar CTA-ul devine „Cereți o ofertă”.
- **„Creez conținut”** (exemplul găsit de proprietară) apare o singură dată, în textul principal de pe Acasă. Propunerea: „pregătesc conținut”. Formulări înrudite: „acopăr programul”, „acoperirea unei conferințe”, „livrabilele”, „poveste de brand”, „notițe adezive”, „joace pentru cameră”, „fotografiată sincer”.
- **Terminologie unificată:** **Reels** (cu majusculă, invariabil; nu „reels” sau „reel-uri”), **aftermovie / aftermovie-uri**, **ședință foto**, **eveniment(e) corporativ(e)**, **momente-cheie** (nu „Highlights”), **brandingul** (fără cratimă, conform DOOM). „Speaker/speakeri” rămâne, fiind uzual în mediul de business din Moldova.
- **SEO:** titlul paginii Acasă nu conținea cuvântul „fotograf”. Pagina Despre avea `seoDescription` identic cu cel al site-ului. Titlul paginii de contact este `booking.title`, deci corecția de acolo contează dublu.

Ordinea tabelelor: Acasă → Despre → Contact/rezervare → Navigație/UI → Proiecte/filme.


### Home

| file:line | current text | proposed text | why |
|---|---|---|---|
| `content/pages/ro/site.json:10` | "seoTitle": "Ellina Yatsenyuk — Evenimente și conținut de brand în Chișinău" | "seoTitle": "Ellina Yatsenyuk — fotograf de evenimente și branduri, Chișinău" | Titlul nu conține „fotograf”, cuvântul pe care îl caută clienții; 63 caractere |
| `content/pages/ro/site.json:11` | "seoDescription": "Fotografie de eveniment, aftermovie, | "seoDescription": "Fotografie de evenimente, aftermovie, | „de evenimente” (plural) e forma naturală și cea căutată |
| `lib/i18n.ts:98` | lede: "Fotografie de eveniment și aftermovie. Fotografii de brand, Reels pentru Instagram și conținut social media. Din Chișinău, pentru companii și afaceri mici." | lede: "Fotografie și aftermovie pentru evenimente. Ședințe foto de brand, Reels pentru Instagram și conținut pentru social media. Din Chișinău, pentru companii și afaceri mici." | „conținut social media” fără prepoziție e calc; „ședințe foto de brand” unifică termenul |
| `content/pages/ro/home.json:5` | livrez previzualizări editate în aceeași seară. Pentru branduri și afaceri mici, planific ședințe foto, filmez Reels pentru Instagram și creez conținut regulat | trimit primele fotografii editate în aceeași seară. Pentru branduri și afaceri mici fac ședințe foto, filmez Reels pentru Instagram și pregătesc conținut regulat | „creez conținut” și „previzualizări” sună tradus; „previzualizare” e termen de software (print preview) |
| `content/pages/ro/home.json:49` | "ctaTitle": "Un eveniment sau o poveste de brand?" | "ctaTitle": "Un eveniment sau un proiect de brand?" | „poveste de brand” e calc din „brand story” |
| `content/pages/ro/home.json:50` | "ctaText": "Spuneți-mi despre evenimentul, afacerea sau conținutul de care aveți nevoie. Confirm disponibilitatea și propun un format potrivit într-o zi lucrătoare." | "ctaText": "Povestiți-mi despre evenimentul sau afacerea dumneavoastră și de ce conținut aveți nevoie. În cel mult o zi lucrătoare vă confirm disponibilitatea și vă propun un format potrivit." | „evenimentul … de care aveți nevoie” leagă greșit relativa de toate trei substantivele |
| `content/pages/ro/home.json:57` | "text": "Sala, scena și fiecare banner al sponsorilor, fotografiate goale și luminate, înainte să intre primul invitat." | "text": "Sala goală, scena luminată și fiecare banner al sponsorilor, fotografiate înainte să intre primul invitat." | „banner … fotografiate goale” — acord forțat, sens ciudat |
| `content/pages/ro/home.json:78` | cadre largi care arată amploarea sălii. | cadre largi care arată amploarea evenimentului. | Repetiție „din sală … sălii” |
| `content/pages/ro/home.json:85` | "text": "Săli pentru secțiuni paralele și lucru în grup: | "text": "Secțiuni paralele și lucru în grup: | „Săli pentru secțiuni” — structură tradusă, nu se fotografiază sălile |
| `content/pages/ro/home.json:98` | "title": "Previzualizări în inbox" | "title": "Primele fotografii, în inbox" | Termen unic în loc de „previzualizări” |
| `content/pages/ro/home.json:99` | "text": "O selecție de previzualizări editate pentru presă | "text": "O primă selecție de fotografii editate pentru presă | Idem |
| `lib/i18n.ts:100` | filmsHead: 'Aftermovie-uri și reel-uri' | filmsHead: 'Aftermovie-uri și Reels' | Terminologie: „Reels” invariabil, ca în restul site-ului |
| `lib/i18n.ts:101` | cover: 'Ce fotografiez' | cover: 'Ce fotografiez și filmez' | Secțiunea include video și Reels |
| `lib/i18n.ts:101` | book: 'Planificați o ședință',⏎       sheetKicker | book: 'Cereți o ofertă',⏎       sheetKicker | „ședință” fără „foto” = meeting; CTA mai clar pentru organizatori |
| `lib/i18n.ts:181` | trust: 'Lucrări bune. Oameni buni.' | trust: 'Companii cu care am lucrat' | Calc din „Good work. Good company.”; „Oameni buni!” sună a interjecție |
| `lib/i18n.ts:104` | calc: { date: 'Data dorită pentru ședință', previews: 'Previzualizări editate' | calc: { date: 'Data evenimentului', previews: 'Primele fotografii editate' | Calculatorul e despre evenimente, nu „ședință”; termen unic |

### About

| file:line | current text | proposed text | why |
|---|---|---|---|
| `content/pages/ro/about.md:24` | seoDescription: "Fotografie de eveniment, aftermovie, ședințe foto de brand, Reels pentru Instagram și conținut lunar pentru companii și afaceri mici din Chișinău, Moldova." | seoDescription: "Ellina Yatsenyuk, fotograf și videograf din Chișinău: evenimente pentru organizatori și companii, ședințe foto și Reels pentru branduri și afaceri mici." | Duplicat exact al descrierii site-ului; pagina Despre are nevoie de propria descriere (≈150 caract.) |
| `lib/i18n.ts:106` | about: { title: 'Despre', | about: { title: 'Despre mine', | <title> „Despre — Ellina…” e trunchiat; pagina însăși se numește „Despre mine” |
| `content/pages/ro/about.md:10` | Speakerii și invitații uită că sunt acolo. | Speakerii și invitații uită de prezența mea. | „uită că sunt acolo” e ambiguu (eu sunt / ei sunt) |
| `content/pages/ro/about.md:12` | text: "Previzualizări în aceeași seară pentru rețelele dumneavoastră sociale, iar galeria completă editată în cinci zile lucrătoare." | text: "Primele fotografii editate, în aceeași seară, pentru rețelele dumneavoastră sociale. Galeria completă, în cinci zile lucrătoare." | Termen unic; frază mai scurtă |
| `content/pages/ro/about.md:14` | fotografii, aftermovie și reels, ca evenimentul | fotografii, aftermovie și Reels, ca evenimentul | Terminologie Reels |
| `content/pages/ro/about.md:17` | sponsori și scopul în care vor fi folosite fotografiile. | sponsori și unde vor fi folosite fotografiile. | „scopul în care” — construcție greoaie |
| `content/pages/ro/about.md:21` | fotografiez locația și branding-ul înainte de sosirea invitaților, apoi acopăr întregul program. | fotografiez locația și brandingul înainte de sosirea invitaților, apoi tot programul. | „acopăr” = calc din „cover”; DOOM: „brandingul” fără cratimă (ca în booking) |
| `content/pages/ro/about.md:23` | text: "Previzualizări în aceeași seară, galeria completă și filmele în decurs de o săptămână, în formate gata pentru presă, web și rețele sociale." | text: "Primele fotografii în aceeași seară, galeria completă în cinci zile lucrătoare, filmele în zece. Totul în formate gata pentru presă, web și rețele sociale." | Contradicție factuală: site.json spune galerie 5 zile, film 10 zile, nu „o săptămână” |
| `content/pages/ro/about.md:27` | și pregătesc previzualizări editate cât impresiile | și trimit primele fotografii editate cât impresiile | Termen unic |
| `lib/i18n.ts:106` | ctaTitle: 'Un eveniment sau o poveste de brand?' | ctaTitle: 'Un eveniment sau un proiect de brand?' | Calc „brand story” (la fel ca pe Acasă) |
| `content/pages/ro/about.md:29` | detaliile unui magazin, un studio în lucru sau | detaliile unui magazin, atmosfera unui studio sau | „un studio în lucru” — calc din „a studio at work” |
| `lib/i18n.ts:107` | ctaText: 'Trimiteți-mi data și câteva detalii. Vă confirm disponibilitatea în cel mult o zi lucrătoare.', book: 'Planificați o ședință' } | ctaText: 'Trimiteți-mi data și câteva detalii. Vă confirm disponibilitatea în cel mult o zi lucrătoare.', book: 'Cereți o ofertă' } | „ședință” singur = meeting |

### Contact

| file:line | current text | proposed text | why |
|---|---|---|---|
| `content/pages/ro/booking.json:2` | "title": "Planificăm o ședință foto sau video?" | "title": "Planificăm o ședință foto sau o filmare?" | „ședință video” nu e idiomatic; e și <title> SEO al paginii |
| `lib/i18n.ts:109` | head: ['Planificăm', 'o ședință?'] | head: ['Să discutăm', 'proiectul'] | „o ședință?” fără „foto” se citește „o întâlnire” |
| `lib/i18n.ts:111` | guestsPh: 'ex. 150', date: 'Data dorită pentru ședință' | guestsPh: 'de ex. 150', date: 'Data dorită' | Abreviere standard „de ex.”; „ședință” nu se potrivește pentru evenimente |
| `lib/i18n.ts:112` | hint: (t: string, d: number) => `Previzualizări în aceeași seară, la ${t}. | hint: (t: string, d: number) => `Primele fotografii în aceeași seară, la ${t}. | Termen unic |
| `lib/i18n.ts:131` | hint: 'Previzualizări {d}, la {t}. Galeria completă până la {g}.' | hint: 'Primele fotografii: {d}, la {t}. Galeria completă: {g}.' | {d} e „sâm., 31 oct.” → „Previzualizări sâm., 31 oct.” e agramatical fără prepoziție |
| `content/pages/ro/booking.json:6` | "name": "Acoperirea unei conferințe" | "name": "Conferință" | „Acoperire” = calc din „coverage”; paralel cu „Seminar sau atelier”, „Eveniment corporativ” |
| `content/pages/ro/booking.json:8` | networking și branding. Previzualizări în aceeași seară pentru rețelele sociale. | networking și branding. Primele fotografii editate, în aceeași seară, pentru rețelele sociale. | Termen unic |
| `content/pages/ro/booking.json:30` | "name": "Aftermovie și reels" | "name": "Aftermovie și Reels" | Terminologie Reels |
| `content/pages/ro/booking.json:32` | "includes": "Un aftermovie de 1–3 minute și reels verticale pentru rețelele sociale." | "includes": "Un aftermovie de 1–3 minute și Reels pentru rețelele sociale." | Reels sunt verticale prin definiție; majusculă unificată |
| `content/pages/ro/booking.json:50` | ședințe foto și video regulate | ședințe foto și filmări regulate | „ședințe video” nu e idiomatic |
| `content/pages/ro/booking.json:62` | "text": "Stabilim acoperirea, livrabilele și condițiile, înainte de rezervare." | "text": "Stabilim volumul de lucru, ce primiți și condițiile, înainte de rezervare." | „acoperirea, livrabilele” — jargon tradus din engleză |

### Nav/UI

| file:line | current text | proposed text | why |
|---|---|---|---|
| `lib/i18n.ts:93` | skip: 'Salt la conținut' | skip: 'Treceți la conținut' | „Salt la” e calc; plus formă de politețe |
| `lib/i18n.ts:92` | close: 'Închide', main: 'Principal' | close: 'Închideți', main: 'Principal' | Consecvență cu „dumneavoastră” (viewer.close = „Închideți”) |
| `lib/i18n.ts:94` | elsewhere: 'Pe rețele' | elsewhere: 'Rețele sociale' | „Pe rețele” — calc din „Elsewhere”, sună incomplet |
| `lib/i18n.ts:96` | cursor: { view: 'Vezi evenimentul', play: 'Redă', expand: 'Mărește', next: 'Următorul' } | cursor: { view: 'Vedeți evenimentul', play: 'Redați', expand: 'Măriți', next: 'Următorul' } | Formă „tu” în site care folosește „dumneavoastră” |
| `lib/i18n.ts:131` | menu: 'Meniu', close: 'Închide' }, | menu: 'Meniu', close: 'Închideți' }, | Consecvență politețe |
| `lib/i18n.ts:130` | from: 'Din {x}' | from: 'Din proiectul „{x}”' | „Din Seara lansării” — fără „proiectul” nu e clar ce e linkul |
| `lib/i18n.ts:181` | pauseLogos: 'Opriți siglele', playLogos: 'Reluați siglele' | pauseLogos: 'Opriți derularea siglelor', playLogos: 'Reluați derularea siglelor' | Nu se opresc siglele, ci animația |
| `lib/i18n.ts:181` | resetZoom: 'Resetați mărirea' | resetZoom: 'Anulați mărirea' | „Resetați” — anglicism inutil |
| `lib/i18n.ts:181` | Escape anulează.' | Tasta Escape anulează.' | Fără „Tasta” subiectul sună tradus |
| `lib/i18n.ts:127` | Corporate: 'Corporate', Portraits: 'Portrete' | Corporate: 'Evenimente corporative', Portraits: 'Portrete' | Filtru în engleză; pe Acasă eticheta e deja „Evenimente corporative” |
| `lib/i18n.ts:128` | Highlights: 'Highlights', Reel: 'Reel', 'Behind the scenes': 'Din culise' | Highlights: 'Momente-cheie', Reel: 'Reel', 'Behind the scenes': 'Din culise' | Titlul filmului și creditele spun deja „momente-cheie” |
| `lib/i18n.ts:117` | intro: 'Aftermovie-uri, highlights și reel-uri pentru rețele sociale, | intro: 'Aftermovie-uri, filme cu momente-cheie și Reels pentru rețelele sociale, | Anglicisme „highlights”, „reel-uri”; articol „rețelele sociale” |
| `lib/i18n.ts:271` | fast: 'A fost puțin prea rapid.' | fast: 'Formularul a fost trimis prea repede. Încercați din nou.' | Calc „That was a little too quick”, fără subiect |
| `lib/i18n.ts:272` | spam: 'Verificarea anti-spam nu a trecut.' | spam: 'Mesajul nu a trecut verificarea anti-spam.' | Mesajul trece verificarea, nu verificarea „trece” |

### Proiecte

| file:line | current text | proposed text | why |
|---|---|---|---|
| `content/projects/ro/future-of-work-summit.md:2` | title: "Summitul Viitorul Muncii" | title: "Summitul „Viitorul Muncii”" | Numele propriu al evenimentului se pune între ghilimele românești |
| `content/projects/ro/future-of-work-summit.md:47` | iar între ele m-am mutat prin sălile secțiunilor paralele, trimițând în fiecare seară, la ora 21:00, o selecție de 60 de previzualizări. | iar între ele am trecut prin sălile secțiunilor paralele. În fiecare seară, la ora 21:00, am trimis o selecție de 60 de fotografii editate. | „m-am mutat prin” — calc; frază prea lungă; termen unic |
| `content/projects/ro/future-of-work-summit.md:8` | cu previzualizări în aceeași seară pentru rețelele sociale ale organizatorilor. | cu primele fotografii editate în aceeași seară, pentru rețelele sociale ale organizatorilor. | Termen unic |
| `content/projects/ro/design-sprint-workshop.md:8` | excerpt: "Notițe adezive, table albe | excerpt: "Post-it-uri, table albe | „notițe adezive” = calc din „sticky notes”; uzual: post-it-uri |
| `content/projects/ro/design-sprint-workshop.md:10` | coverAlt: "Echipă care discută idei în fața unui perete acoperit cu notițe adezive" | coverAlt: "Echipă care discută idei în fața unui perete acoperit cu post-it-uri" | Idem |
| `content/projects/ro/design-sprint-workshop.md:21` | analizează împreună un cod" | analizează împreună codul" | „un cod” — articol nehotărât nefiresc |
| `content/projects/ro/design-sprint-workshop.md:37` | oameni care nu sunt de acord în mod constructiv. | oameni care se contrazic constructiv. | Calc din „disagreeing constructively” |
| `content/projects/ro/faces-of-the-forum.md:32` | role: "Retușare" | role: "Retuș" | Termenul profesional uzual |
| `content/projects/ro/inside-the-office.md:8` | O zi obișnuită de lucru, fotografiată sincer, | O zi obișnuită de lucru, fotografiată spontan, | „sincer” = calc din „candidly” |
| `content/projects/ro/inside-the-office.md:37` | fotografiind discret și fără să cer ca ceva să fie regizat. | fotografiind discret, fără să regizez nimic. | Construcție greoaie, tradusă |
| `content/projects/ro/leadership-seminar.md:39` | Fotografiez în mod silențios, fără bliț, și rămân la marginile sălii, ca nimeni să nu joace pentru cameră. | Fotografiez silențios, fără bliț, și rămân la marginea sălii, ca nimeni să nu pozeze pentru cameră. | „joace pentru cameră” = calc din „play to the camera”; „în mod” pleonastic |

### Filme

| file:line | current text | proposed text | why |
|---|---|---|---|
| `content/films/ro/future-of-work-aftermovie.md:2` | title: "Summitul Viitorul Muncii — aftermovie" | title: "Summitul „Viitorul Muncii” — aftermovie" | Ghilimele la numele propriu, ca în proiect |


## Neincluse în JSON (de verificat de proprietară)

- `pages/ro/home.json` (clients, testimonials, stats): sunt încă placeholdere `TODO`, iar statisticile au valoarea `0`. Trebuie completate înainte de lansare, altfel apar pe site.
- `projects/ro/*.md`, câmpurile `client:` / `credits.name`: placeholdere în engleză („Corporate client placeholder”, „Placeholder agency”), vizibile pe paginile de proiect.
- `pages/ro/booking.json` `intro` are aproximativ 190 de caractere și este folosit ca meta description pentru contact (se taie după aproximativ 155–160). Nu e o greșeală de limbă. Dacă vreți, scurtați-l: „Spuneți-mi despre eveniment sau afacere, dată și conținutul dorit. Confirm disponibilitatea într-o zi lucrătoare și trimit o ofertă.”
- `projects/ro/future-of-work-summit.md` `excerpt` are aproximativ 220 de caractere și servește ca meta description. Este natural, doar lung.
- `nav.book: 'Rezervați'` e acceptabil. Dacă adoptați CTA-ul „Cereți o ofertă”, puteți folosi același text și în meniu, pentru consecvență.
