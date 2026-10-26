/**
 * Languages: Russian is the default (served at /), Romanian at /ro/, English at /en/.
 * Content (projects, films, pages) lives in src/content/<collection>/<lang>/ and is edited in /admin.
 * Interface text (buttons, labels, form messages) lives here.
 */
export const LOCALES = ['ru', 'ro', 'en'] as const;
export type Lang = (typeof LOCALES)[number];
export const DEFAULT_LANG: Lang = 'ru';
export const LANG_NAMES: Record<Lang, string> = { ro: 'Română', ru: 'Русский', en: 'English' };
export const LANG_SHORT: Record<Lang, string> = { ro: 'RO', ru: 'RU', en: 'EN' };
export const HTML_LANG: Record<Lang, string> = { ro: 'ro', ru: 'ru', en: 'en' };
export const OG_LOCALE: Record<Lang, string> = { ro: 'ro_RO', ru: 'ru_RU', en: 'en_US' };
export const DATE_LOCALE: Record<Lang, string> = { ro: 'ro-RO', ru: 'ru-RU', en: 'en-GB' };

export const isLang = (s: unknown): s is Lang => LOCALES.includes(s as Lang);

/** Path for a page in a language: localePath('ro', '/portfolio/') → '/ro/portfolio/' */
export function localePath(lang: Lang, p = '/') {
  const clean = p.startsWith('/') ? p : `/${p}`;
  return lang === DEFAULT_LANG ? clean : `/${lang}${clean}`;
}
/** Language and language-free path from a URL pathname */
export function splitPath(pathname: string): { lang: Lang; rest: string } {
  const m = pathname.match(/^\/(ro|en)(\/.*|$)/);
  if (m) return { lang: m[1] as Lang, rest: m[2] || '/' };
  return { lang: DEFAULT_LANG, rest: pathname || '/' };
}
/** getStaticPaths params for the [...lang] folder */
export const langParams = () => LOCALES.map((l) => ({ params: { lang: l === DEFAULT_LANG ? undefined : l }, props: { lang: l } }));

/* ───────── Counting words ───────── */
const ruRules = new Intl.PluralRules('ru');
function ru(n: number, one: string, few: string, many: string) {
  const r = ruRules.select(n);
  return `${n} ${r === 'one' ? one : r === 'few' ? few : many}`;
}
function ro(n: number, one: string, other: string) {
  if (n === 1) return `${n} ${one}`;
  const t = n % 100;
  return t >= 20 || (n > 0 && t === 0) ? `${n} de ${other}` : `${n} ${other}`;
}
function en(n: number, one: string, other: string) {
  return `${n} ${n === 1 ? one : other}`;
}

/* ───────── Dictionary ───────── */
const dict = {
  en: {
    nav: { portfolio: 'Portfolio', films: 'Films', about: 'About', book: 'Book a shoot', home: 'Home', menu: 'Menu', close: 'Close', main: 'Main', language: 'Language' },
    skip: 'Skip to content',
    footer: { pages: 'Pages', elsewhere: 'Elsewhere', rights: 'All photographs and films are protected by copyright. Inspiration is free.', toTop: 'Back to top' },
    viewer: { photo: 'Photo viewer', close: 'Close viewer', prev: 'Previous photo', next: 'Next photo', project: 'See the project', film: 'Film player', closeFilm: 'Close film' },
    cursor: { view: 'View event', play: 'Play', expand: 'Expand', next: 'Next event' },
    home: {
      lede: "Photo and video for events and brands in Chișinău. I shoot it so the people who didn’t come will wish they had.",
      checkDate: 'Check your date', seeWork: 'See the work', howBooking: 'How it works',
      selected: 'Selected work', fullPortfolio: 'Full portfolio', filmsHead: 'Aftermovies and Reels', allFilms: 'All films', everyFilm: 'See every film',
      cover: 'What I shoot', choose: 'Pick one to see the work', book: 'Book your date',
      sheetKicker: (r: number, f: string) => `Roll ${r}. Frame ${f}.`, sheetA: 'Hundreds of frames.', sheetB: 'Only the ones worth sending.',
    },
    calc: { date: 'Your event date', previews: 'First edited photos', gallery: 'Full gallery', film: 'Aftermovie', check: 'Check this date',
      sameEvening: (t: string) => `The same evening, by ${t}`, within: (n: number) => `Within ${en(n, 'working day', 'working days')}` },
    about: { title: 'About', expect: 'What you get', howBooking: 'How it works', ctaTitle: 'Your best frame is still ahead.',
      ctaText: 'Send the date and a few details. Within one working day I’ll tell you if it’s free.', book: 'Book your date' },
    contact: {
      head: ['Your date.', 'My frames.'], services: 'Services', direct: 'Prefer to write directly?', name: 'Your name', email: 'Email',
      kind: 'What would you like to shoot?', other: 'Something else', org: 'Business or event name (optional)', guests: 'Expected guests (optional)',
      guestsPh: 'e.g. 150', date: 'Preferred shoot date', location: 'Location (optional)', locationPh: 'Venue or city',
      hint: (t: string, d: number) => `First photos the same evening, by ${t}. Full gallery within ${en(d, 'working day', 'working days')}.`,
      message: 'Tell me about it', messagePh: 'Your event or business, the photos or video you need, and where they’ll be published.',
      submit: 'Send request',
    },
    films: { title: 'Films', seoTitle: 'Films and video', desc: 'Event aftermovies and Instagram Reels for brands and small businesses by Ellina Yatsenyuk.',
      intro: 'Aftermovies, highlights and Reels from conferences, seminars and corporate events. For those who came, a memory. For those who didn’t, a reason to come next time.',
      filter: 'Filter films', all: 'All', featured: 'Featured film', list: 'All films', photos: 'Photographs from this event' },
    portfolio: { title: 'Portfolio', desc: 'Conference, seminar, corporate event and speaker portrait photography by Ellina Yatsenyuk.',
      intro: (p: number, e: number) => `Conferences, seminars, corporate events and brands. Only the frames that made the cut — nobody else sees the rest. Open any one full screen.`,
      introOne: 'Open any frame to see it full screen.',
      filter: 'Filter by category', all: 'All', projects: 'Projects', photos: 'Photographs' },
    work: { category: 'Category', client: 'Client', location: 'Location', year: 'Year', photos: (t: string) => `${t} photographs`,
      filmAria: 'Film from this event', film: 'The film', credits: 'Credits', next: 'Next event', view: (t: string) => `${t}, view the project` },
    notFound: { title: 'Page not found', h: 'Out of frame', text: "This frame doesn’t exist. The rest are right where you left them.", portfolio: 'Open the portfolio', home: 'Go to the home page' },
    a11y: { play: (t: string) => `Play ${t}`, open: (a: string) => `Open full screen: ${a}` },
    count: { photos: (n: number) => en(n, 'photograph', 'photographs') },
    categories: { Brands: "Brands and social media", Conferences: 'Conferences', Seminars: 'Seminars', Corporate: 'Corporate', Portraits: 'Portraits', Celebrations: 'Celebrations' },
    kinds: { Reels: 'Reels', Aftermovie: 'Aftermovie', Highlights: 'Highlights', Reel: 'Reel', 'Behind the scenes': 'Behind the scenes' },
    client: { sending: 'Sending your message…', errorTail: 'Please email me directly instead.', required: 'This field is needed so I can reply.',
      emailBad: 'Check the email address, it looks incomplete.', from: 'From {x}',
      hint: 'First photos on {d} by {t}. Full gallery by {g}.', menu: 'Menu', close: 'Close' },
  },

  ro: {
    nav: { portfolio: 'Portofoliu', films: 'Filme', about: 'Despre', book: 'Rezervați', home: 'Acasă', menu: 'Meniu', close: 'Închideți', main: 'Principal', language: 'Limba' },
    skip: 'Treceți la conținut',
    footer: { pages: 'Pagini', elsewhere: 'Rețele sociale', rights: 'Toate fotografiile și filmele sunt protejate de dreptul de autor. Inspirația e gratuită.', toTop: 'Înapoi sus' },
    viewer: { photo: 'Vizualizator foto', close: 'Închideți', prev: 'Fotografia anterioară', next: 'Fotografia următoare', project: 'Vedeți proiectul', film: 'Player video', closeFilm: 'Închideți filmul' },
    cursor: { view: 'Vedeți evenimentul', play: 'Redați', expand: 'Măriți', next: 'Următorul' },
    home: {
      lede: "Foto și video pentru evenimente și branduri, în Chișinău. Fotografiez așa încât cei care n-au venit să regrete.",
      checkDate: 'Verificați data', seeWork: 'Vedeți lucrările', howBooking: 'Cum lucrăm',
      selected: 'Lucrări selectate', fullPortfolio: 'Tot portofoliul', filmsHead: 'Aftermovie-uri și Reels', allFilms: 'Toate filmele', everyFilm: 'Vedeți toate filmele',
      cover: 'Ce fotografiez și filmez', choose: 'Alegeți o categorie', book: 'Rezervați data',
      sheetKicker: (r: number, f: string) => `Rola ${r}. Cadrul ${f}.`, sheetA: 'Sute de cadre.', sheetB: 'Trimit doar ce merită.',
    },
    calc: { date: 'Data dorită', previews: 'Primele fotografii editate', gallery: 'Galeria completă', film: 'Aftermovie', check: 'Verificați această dată',
      sameEvening: (t: string) => `În aceeași seară, până la ${t}`, within: (n: number) => `În ${ro(n, 'zi lucrătoare', 'zile lucrătoare')}` },
    about: { title: 'Despre mine', expect: 'Ce primiți', howBooking: 'Cum lucrăm', ctaTitle: 'Cel mai bun cadru încă nu e făcut.',
      ctaText: 'Trimiteți-mi data și câteva detalii. În cel mult o zi lucrătoare vă spun dacă e liberă.', book: 'Rezervați data' },
    contact: {
      head: ['Spuneți data.', 'Eu fac restul.'], services: 'Servicii', direct: 'Preferați să scrieți direct?', name: 'Numele dumneavoastră', email: 'Email',
      kind: 'Ce doriți să fotografiem sau să filmăm?', other: 'Altceva', org: 'Compania sau numele evenimentului (opțional)', guests: 'Număr estimat de invitați (opțional)',
      guestsPh: 'de ex. 150', date: 'Data dorită', location: 'Locația (opțional)', locationPh: 'Sala sau orașul',
      hint: (t: string, d: number) => `Primele fotografii în aceeași seară, până la ${t}. Galeria completă în ${ro(d, 'zi lucrătoare', 'zile lucrătoare')}.`,
      message: 'Povestiți-mi despre proiect', messagePh: 'Evenimentul sau afacerea dumneavoastră, fotografiile ori videoclipurile dorite și unde vor fi publicate.',
      submit: 'Trimiteți cererea',
    },
    films: { title: 'Filme', seoTitle: 'Filme și video', desc: 'Aftermovie-uri de eveniment și Reels pentru branduri și afaceri mici, de Ellina Yatsenyuk.',
      intro: 'Aftermovie-uri, momente-cheie și Reels de la conferințe, seminare și evenimente corporative. Pentru cei care au fost — o amintire. Pentru ceilalți — un motiv să vină data viitoare.',
      filter: 'Filtrați filmele', all: 'Toate', featured: 'Film recomandat', list: 'Toate filmele', photos: 'Fotografii de la acest eveniment' },
    portfolio: { title: 'Portofoliu', desc: 'Fotografie de conferințe, seminare, evenimente corporative și portrete de speakeri, de Ellina Yatsenyuk.',
      intro: (p: number, e: number) => `Conferințe, seminare, evenimente corporative și branduri. Aici sunt doar cadrele care au trecut selecția; pe celelalte le-am văzut doar eu. Deschideți oricare pe tot ecranul.`,
      introOne: 'Deschideți orice cadru pe tot ecranul.',
      filter: 'Filtrați după categorie', all: 'Toate', projects: 'Proiecte', photos: 'Fotografii' },
    work: { category: 'Categorie', client: 'Client', location: 'Locație', year: 'An', photos: (t: string) => `Fotografii: ${t}`,
      filmAria: 'Filmul de la acest eveniment', film: 'Filmul', credits: 'Echipa', next: 'Următorul eveniment', view: (t: string) => `${t}, vedeți proiectul` },
    notFound: { title: 'Pagina nu a fost găsită', h: 'În afara cadrului', text: 'Acest cadru nu există. Celelalte sunt la locul lor.', portfolio: 'Deschideți portofoliul', home: 'Pagina principală' },
    a11y: { play: (t: string) => `Redați ${t}`, open: (a: string) => `Deschideți pe tot ecranul: ${a}` },
    count: { photos: (n: number) => ro(n, 'fotografie', 'fotografii') },
    categories: { Brands: "Branduri și social media", Conferences: 'Conferințe', Seminars: 'Seminare', Corporate: 'Evenimente corporative', Portraits: 'Portrete', Celebrations: 'Gale și sărbători' },
    kinds: { Reels: 'Reels', Aftermovie: 'Aftermovie', Highlights: 'Momente-cheie', Reel: 'Reel', 'Behind the scenes': 'Din culise' },
    client: { sending: 'Se trimite mesajul…', errorTail: 'Vă rog să-mi scrieți direct pe email.', required: 'Acest câmp este necesar ca să vă pot răspunde.',
      emailBad: 'Verificați adresa de email, pare incompletă.', from: 'Din proiectul „{x}”',
      hint: 'Primele fotografii: {d}, până la {t}. Galeria completă: {g}.', menu: 'Meniu', close: 'Închideți' },
  },

  ru: {
    nav: { portfolio: 'Портфолио', films: 'Фильмы', about: 'Обо мне', book: 'Забронировать', home: 'Главная', menu: 'Меню', close: 'Закрыть', main: 'Основная навигация', language: 'Язык' },
    skip: 'Перейти к содержимому',
    footer: { pages: 'Страницы', elsewhere: 'Соцсети', rights: 'Все фотографии и фильмы защищены авторским правом. Вдохновляться — можно.', toTop: 'Наверх' },
    viewer: { photo: 'Просмотр фото', close: 'Закрыть', prev: 'Предыдущее фото', next: 'Следующее фото', project: 'Открыть проект', film: 'Видеоплеер', closeFilm: 'Закрыть фильм' },
    cursor: { view: 'Смотреть', play: 'Включить', expand: 'Открыть', next: 'Дальше' },
    home: {
      lede: "Фото и видео для мероприятий и брендов в Кишинёве. Снимаю так, что те, кто не пришёл, пожалеют.",
      checkDate: 'Проверить дату', seeWork: 'Смотреть работы', howBooking: 'Как мы работаем',
      selected: 'Избранные работы', fullPortfolio: 'Всё портфолио', filmsHead: 'Афтемуви и Reels', allFilms: 'Все фильмы', everyFilm: 'Смотреть все фильмы',
      cover: 'Что я снимаю', choose: 'Выберите категорию', book: 'Забронировать дату',
      sheetKicker: (r: number, f: string) => `Плёнка ${r}. Кадр ${f}.`, sheetA: 'Сотни кадров.', sheetB: 'Отправляю только лучшие.',
    },
    calc: { date: 'Дата съёмки', previews: 'Первые обработанные кадры', gallery: 'Полная галерея', film: 'Афтемуви', check: 'Проверить эту дату',
      sameEvening: (t: string) => `В тот же вечер, к ${t}`, within: (n: number) => `В течение ${ru(n, 'рабочего дня', 'рабочих дней', 'рабочих дней')}` },
    about: { title: 'Обо мне', expect: 'Что вы получаете', howBooking: 'Как мы работаем', ctaTitle: 'Лучший кадр вашего события ещё не снят.',
      ctaText: 'Пришлите дату и пару деталей. В течение рабочего дня отвечу, свободна ли она.', book: 'Забронировать дату' },
    contact: {
      head: ['Ваша дата.', 'Мои кадры.'], services: 'Услуги', direct: 'Удобнее написать напрямую?', name: 'Ваше имя', email: 'Email',
      kind: 'Что будем снимать?', other: 'Другое', org: 'Компания или название мероприятия (необязательно)', guests: 'Ожидаемое число гостей (необязательно)',
      guestsPh: 'например, 150', date: 'Дата съёмки', location: 'Место (необязательно)', locationPh: 'Площадка или город',
      hint: (t: string, d: number) => `Первые кадры — в тот же вечер, к ${t}. Полная галерея — в течение ${ru(d, 'рабочего дня', 'рабочих дней', 'рабочих дней')}.`,
      message: 'Расскажите о проекте', messagePh: 'О мероприятии или бизнесе, какие нужны фото и видео и где вы будете их публиковать.',
      submit: 'Отправить заявку',
    },
    films: { title: 'Фильмы', seoTitle: 'Фильмы и видео', desc: 'Афтемуви мероприятий и Reels для брендов и малого бизнеса — Эллина Яценюк.',
      intro: 'Афтемуви, хайлайты и Reels с конференций, семинаров и корпоративных мероприятий. Тем, кто был, — память. Тем, кто не был, — повод прийти в следующий раз.',
      filter: 'Фильтр фильмов', all: 'Все', featured: 'Главный фильм', list: 'Все фильмы', photos: 'Фотографии с этого мероприятия' },
    portfolio: { title: 'Портфолио', desc: 'Съёмка конференций, семинаров, корпоративных мероприятий и портретов спикеров — Эллина Яценюк.',
      intro: (p: number, e: number) => `Конференции, семинары, корпоративные мероприятия и бренды. Здесь только кадры, прошедшие отбор; остальные видела только я. Откройте любой на весь экран.`,
      introOne: 'Откройте любой кадр на весь экран.',
      filter: 'Фильтр по категориям', all: 'Все', projects: 'Проекты', photos: 'Фотографии' },
    work: { category: 'Категория', client: 'Клиент', location: 'Место', year: 'Год', photos: (t: string) => `Фотографии: ${t}`,
      filmAria: 'Фильм с этого мероприятия', film: 'Фильм', credits: 'Команда', next: 'Следующее мероприятие', view: (t: string) => `${t} — открыть проект` },
    notFound: { title: 'Страница не найдена', h: 'Вне кадра', text: 'Этого кадра нет. Остальные — на месте.', portfolio: 'Открыть портфолио', home: 'На главную' },
    a11y: { play: (t: string) => `Смотреть: ${t}`, open: (a: string) => `Открыть на весь экран: ${a}` },
    count: { photos: (n: number) => ru(n, 'фотография', 'фотографии', 'фотографий') },
    categories: { Brands: "Бренды и соцсети", Conferences: 'Конференции', Seminars: 'Семинары', Corporate: 'Корпоративные мероприятия', Portraits: 'Портреты', Celebrations: 'Гала-вечера и праздники' },
    kinds: { Reels: 'Reels', Aftermovie: 'Афтемуви', Highlights: 'Хайлайты', Reel: 'Reels', 'Behind the scenes': 'За кадром' },
    client: { sending: 'Отправляю сообщение…', errorTail: 'Напишите мне, пожалуйста, на почту напрямую.', required: 'Заполните это поле, чтобы я могла ответить.',
      emailBad: 'Проверьте email — адрес выглядит неполным.', from: 'Из проекта «{x}»',
      hint: 'Первые кадры — {d}, к {t}. Полная галерея — к {g}.', menu: 'Меню', close: 'Закрыть' },
  },
} satisfies Record<Lang, unknown>;

/* Workstreams 2–4: localized interaction labels. */
const studio = {
  en: { trust: 'Worked with', numbers: 'In numbers', pauseLogos: 'Pause logos', playLogos: 'Resume logos', frames: 'Explore the frames', frame: 'Frame', zoom: 'Zoom photo', resetZoom: 'Reset zoom', loading: 'Loading photograph…', imageError: 'This photograph could not load. Try another frame.', advance: 'Scroll to the next event', advanceHint: 'Turn on, then keep scrolling to move on. Press Escape to cancel.', cancel: 'Cancel', bookStory: 'Your event, next?', book: 'Check your date' },
  ro: { trust: 'Am lucrat cu', numbers: 'În cifre', pauseLogos: 'Opriți derularea siglelor', playLogos: 'Reluați derularea siglelor', frames: 'Explorați cadrele', frame: 'Cadrul', zoom: 'Măriți fotografia', resetZoom: 'Anulați mărirea', loading: 'Se încarcă fotografia…', imageError: 'Fotografia nu s-a încărcat. Încercați alt cadru.', advance: 'Derulați spre următorul eveniment', advanceHint: 'Activați, apoi derulați mai departe pentru a continua. Tasta Escape anulează.', cancel: 'Anulați', bookStory: 'Următorul — evenimentul dumneavoastră?', book: 'Verificați data' },
  ru: { trust: 'Работала с', numbers: 'В цифрах', pauseLogos: 'Остановить прокрутку логотипов', playLogos: 'Возобновить прокрутку логотипов', frames: 'Посмотреть кадры', frame: 'Кадр', zoom: 'Увеличить фото', resetZoom: 'Сбросить масштаб', loading: 'Загружаю фотографию…', imageError: 'Не удалось загрузить фотографию. Попробуйте другой кадр.', advance: 'Перейти к следующему мероприятию', advanceHint: 'Включите и прокрутите изображение, чтобы перейти дальше. Esc — отмена.', cancel: 'Отмена', bookStory: 'Следующим будет ваше мероприятие?', book: 'Проверить дату' },
};

const bookingUi = {
  "en": {
    "onRequest": "On request",
    "reachTitle": "Write to me",
    "reachText": "Send the date, the place and what kind of event or project. I reply within one working day.",
    "steps": [
      "Service",
      "Date",
      "Details",
      "Contact"
    ],
    "back": "Back",
    "continue": "Continue",
    "dateOptional": "Date not confirmed yet? You can continue without it.",
    "nextSteps": "What happens next",
    "call": "Call me",
    "directChannels": "Write directly",
    "formError": "The message could not be sent. Please try again.",
    "dateBad": "Choose today or a future date.",
    "stepOf": "Step {x} of 4",
    "telegram": "Telegram",
    "whatsapp": "WhatsApp",
    "viber": "Viber",
    "email": "Email",
    "waCta": "Message on WhatsApp",
    "waCheck": "Check this date on WhatsApp",
    "waText": "Hello Ellina! I would like to book a shoot.\nDate: {d}\nPlace: …\nType: event / brand / Reels",
    "waNoDate": "…"
  },
  "ro": {
    "onRequest": "La cerere",
    "reachTitle": "Scrieți-mi",
    "reachText": "Trimiteți data, locul și tipul evenimentului sau al proiectului. Vă răspund în cel mult o zi lucrătoare.",
    "steps": [
      "Serviciu",
      "Dată",
      "Detalii",
      "Contact"
    ],
    "back": "Înapoi",
    "continue": "Continuați",
    "dateOptional": "Data nu este stabilită? Puteți continua fără ea.",
    "nextSteps": "Ce urmează",
    "call": "Sunați-mă",
    "directChannels": "Scrieți-mi direct",
    "formError": "Mesajul nu a putut fi trimis. Vă rog să încercați din nou.",
    "dateBad": "Alegeți data de astăzi sau o dată viitoare.",
    "stepOf": "Pasul {x} din 4",
    "telegram": "Telegram",
    "whatsapp": "WhatsApp",
    "viber": "Viber",
    "email": "Email",
    "waCta": "Scrieți pe WhatsApp",
    "waCheck": "Verificați data pe WhatsApp",
    "waText": "Bună ziua, Ellina! Aș dori să rezerv o filmare sau o ședință foto.\nData: {d}\nLocul: …\nTipul: eveniment / brand / Reels",
    "waNoDate": "…"
  },
  "ru": {
    "onRequest": "По запросу",
    "reachTitle": "Напишите мне",
    "reachText": "Дата, место, тип мероприятия или проекта — этого достаточно. Отвечу в течение рабочего дня.",
    "steps": [
      "Услуга",
      "Дата",
      "Детали",
      "Контакт"
    ],
    "back": "Назад",
    "continue": "Продолжить",
    "dateOptional": "Дата ещё не определена? Можно продолжить без неё.",
    "nextSteps": "Что дальше",
    "call": "Позвонить",
    "directChannels": "Написать напрямую",
    "formError": "Не удалось отправить сообщение. Пожалуйста, попробуйте ещё раз.",
    "dateBad": "Выберите сегодняшнюю или более позднюю дату.",
    "stepOf": "Шаг {x} из 4",
    "telegram": "Telegram",
    "whatsapp": "WhatsApp",
    "viber": "Viber",
    "email": "Email",
    "waCta": "Написать в WhatsApp",
    "waCheck": "Проверить дату в WhatsApp",
    "waText": "Здравствуйте, Эллина! Хочу заказать съёмку.\nДата: {d}\nМесто: …\nТип: мероприятие / бренд / Reels",
    "waNoDate": "…"
  }
};

export type Dict = (typeof dict)['en'] & { studio: (typeof studio)['en']; bookingUi: (typeof bookingUi)['en'] };
export const t = (lang: Lang): Dict => ({ ...dict[lang], studio: studio[lang], bookingUi: bookingUi[lang] }) as Dict;

/** Strings the browser script needs, embedded as JSON on each page */
export const clientStrings = (lang: Lang) => ({ ...dict[lang].client, ...studio[lang], ...bookingUi[lang], dateLocale: DATE_LOCALE[lang] });

/** Error messages returned by the contact API */
export const apiErrors: Record<Lang, Record<string, string>> = {
  en: { read: 'The form data could not be read.', fast: 'That was a little too quick.', many: 'Too many messages in a short time.',
    spam: 'The spam check did not pass.', fields: 'Name, a valid email and a message are needed.', links: 'Please include fewer links.',
    inbox: 'The form is not connected to an inbox yet.', deliver: 'The message could not be delivered.' },
  ro: { read: 'Datele formularului nu au putut fi citite.', fast: 'Formularul a fost trimis prea repede. Încercați din nou.', many: 'Prea multe mesaje într-un timp scurt.',
    spam: 'Mesajul nu a trecut verificarea anti-spam.', fields: 'Sunt necesare numele, un email valid și un mesaj.', links: 'Vă rog să includeți mai puține linkuri.',
    inbox: 'Formularul nu este încă conectat la o căsuță de email.', deliver: 'Mesajul nu a putut fi livrat.' },
  ru: { read: 'Не удалось прочитать данные формы.', fast: 'Форма отправлена слишком быстро. Попробуйте ещё раз.', many: 'Слишком много сообщений за короткое время. Попробуйте позже.',
    spam: 'Проверка на спам не пройдена.', fields: 'Укажите имя, корректный email и сообщение.', links: 'Уберите часть ссылок из сообщения.',
    inbox: 'Форма ещё не подключена к почте.', deliver: 'Не удалось доставить сообщение.' },
};
