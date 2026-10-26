/**
 * Languages: Romanian is the default (served at /), Russian at /ru/, English at /en/.
 * Content (projects, films, pages) lives in src/content/<collection>/<lang>/ and is edited in /admin.
 * Interface text (buttons, labels, form messages) lives here.
 */
export const LOCALES = ['ro', 'ru', 'en'] as const;
export type Lang = (typeof LOCALES)[number];
export const DEFAULT_LANG: Lang = 'ro';
export const LANG_NAMES: Record<Lang, string> = { ro: 'Română', ru: 'Русский', en: 'English' };
export const LANG_SHORT: Record<Lang, string> = { ro: 'RO', ru: 'RU', en: 'EN' };
export const HTML_LANG: Record<Lang, string> = { ro: 'ro', ru: 'ru', en: 'en' };
export const OG_LOCALE: Record<Lang, string> = { ro: 'ro_MD', ru: 'ru_MD', en: 'en_US' };
export const DATE_LOCALE: Record<Lang, string> = { ro: 'ro-RO', ru: 'ru-RU', en: 'en-GB' };

export const isLang = (s: unknown): s is Lang => LOCALES.includes(s as Lang);

/** Path for a page in a language: localePath('ru', '/portfolio/') → '/ru/portfolio/' */
export function localePath(lang: Lang, p = '/') {
  const clean = p.startsWith('/') ? p : `/${p}`;
  return lang === DEFAULT_LANG ? clean : `/${lang}${clean}`;
}
/** Language and language-free path from a URL pathname */
export function splitPath(pathname: string): { lang: Lang; rest: string } {
  const m = pathname.match(/^\/(ru|en)(\/.*|$)/);
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
    footer: { pages: 'Pages', elsewhere: 'Elsewhere', rights: 'All photographs and films are protected by copyright.', toTop: 'Back to top' },
    viewer: { photo: 'Photo viewer', close: 'Close viewer', prev: 'Previous photo', next: 'Next photo', project: 'See the project', film: 'Film player', closeFilm: 'Close film' },
    cursor: { view: 'View event', play: 'Play', expand: 'Expand', next: 'Next event' },
    home: {
      lede: "Event photography & aftermovies. Brand photography, Instagram Reels & social media content. Based in Chișinău, working with companies and small businesses.",
      checkDate: 'Check your date', seeWork: 'See the work', howBooking: 'How a booking works',
      selected: 'Selected work', fullPortfolio: 'Full portfolio', filmsHead: 'Aftermovies & reels', allFilms: 'All films', everyFilm: 'See every film',
      cover: 'What I cover', choose: 'Choose one to see the work', book: 'Plan your shoot',
      sheetKicker: (r: number, f: string) => `Roll ${r}. Frame ${f}.`, sheetA: 'Hundreds of frames.', sheetB: 'Only the ones worth sending.',
    },
    calc: { date: 'Your event date', previews: 'Edited previews', gallery: 'Full gallery', film: 'Aftermovie', check: 'Check this date',
      sameEvening: (t: string) => `The same evening, ${t}`, within: (n: number) => `Within ${en(n, 'working day', 'working days')}` },
    about: { title: 'About', expect: 'What you can expect', howBooking: 'How a booking works', ctaTitle: 'An event or a brand story?',
      ctaText: 'Send me the date and a few details. I confirm availability within one working day.', book: 'Plan your shoot' },
    contact: {
      head: ['Plan your', 'shoot'], services: 'Services', direct: 'Prefer to write directly?', name: 'Your name', email: 'Email',
      kind: 'What would you like to shoot?', other: 'Something else', org: 'Business or event name (optional)', guests: 'Expected guests (optional)',
      guestsPh: 'e.g. 150', date: 'Preferred shoot date', location: 'Location (optional)', locationPh: 'Venue or city',
      hint: (t: string, d: number) => `Previews the same evening at ${t}. Full gallery within ${en(d, 'working day', 'working days')}.`,
      message: 'Tell me about it', messagePh: 'Your event or business, the photos or videos you need, and where you plan to share them.',
      submit: 'Check availability',
    },
    films: { title: 'Films', seoTitle: 'Films & video', desc: 'Event aftermovies and Instagram Reels for brands and small businesses by Ellina Yatsenyuk.',
      intro: 'Aftermovies, highlight films and social reels from conferences, seminars and corporate events. Every film opens full screen.',
      filter: 'Filter films', all: 'All', featured: 'Featured film', list: 'All films', photos: 'Photographs from this event' },
    portfolio: { title: 'Portfolio', desc: 'Conference, seminar, corporate event and speaker portrait photography by Ellina Yatsenyuk.',
      intro: (p: number, e: number) => `${en(p, 'photograph', 'photographs')} from ${en(e, 'event', 'events')}. Choose a category, or open any frame to see it full screen.`,
      filter: 'Filter by category', all: 'All', projects: 'Projects', photos: 'Photographs' },
    work: { category: 'Category', client: 'Client', location: 'Location', year: 'Year', photos: (t: string) => `${t} photographs`,
      filmAria: 'Film from this event', film: 'The film', credits: 'Credits', next: 'Next event', view: (t: string) => `${t}, view the project` },
    notFound: { title: 'Page not found', h: 'Out of frame', text: "This page doesn't exist, or it has moved. The work is still here.", portfolio: 'Open the portfolio', home: 'Go to the home page' },
    a11y: { play: (t: string) => `Play ${t}`, open: (a: string) => `Open full screen: ${a}` },
    count: { photos: (n: number) => en(n, 'photograph', 'photographs') },
    categories: { Brands: "Brands & social media", Conferences: 'Conferences', Seminars: 'Seminars', Corporate: 'Corporate', Portraits: 'Portraits', Celebrations: 'Celebrations' },
    kinds: { Reels: 'Reels', Aftermovie: 'Aftermovie', Highlights: 'Highlights', Reel: 'Reel', 'Behind the scenes': 'Behind the scenes' },
    client: { sending: 'Sending your message…', errorTail: 'Please email me directly instead.', required: 'This field is needed so I can reply.',
      emailBad: 'Check the email address, it looks incomplete.', from: 'From {x}',
      hint: 'Previews {d} at {t}. Full gallery by {g}.', menu: 'Menu', close: 'Close' },
  },

  ro: {
    nav: { portfolio: 'Portofoliu', films: 'Filme', about: 'Despre', book: 'Rezervați', home: 'Acasă', menu: 'Meniu', close: 'Închide', main: 'Principal', language: 'Limba' },
    skip: 'Salt la conținut',
    footer: { pages: 'Pagini', elsewhere: 'Pe rețele', rights: 'Toate fotografiile și filmele sunt protejate de dreptul de autor.', toTop: 'Înapoi sus' },
    viewer: { photo: 'Vizualizator foto', close: 'Închideți', prev: 'Fotografia anterioară', next: 'Fotografia următoare', project: 'Vedeți proiectul', film: 'Player video', closeFilm: 'Închideți filmul' },
    cursor: { view: 'Vezi evenimentul', play: 'Redă', expand: 'Mărește', next: 'Următorul' },
    home: {
      lede: "Fotografie de eveniment și aftermovie. Fotografii de brand, Reels pentru Instagram și conținut social media. Din Chișinău, pentru companii și afaceri mici.",
      checkDate: 'Verificați data', seeWork: 'Vedeți lucrările', howBooking: 'Cum decurge o rezervare',
      selected: 'Lucrări selectate', fullPortfolio: 'Tot portofoliul', filmsHead: 'Aftermovie-uri și reel-uri', allFilms: 'Toate filmele', everyFilm: 'Vedeți toate filmele',
      cover: 'Ce fotografiez', choose: 'Alegeți o categorie pentru a vedea lucrările', book: 'Planificați o ședință',
      sheetKicker: (r: number, f: string) => `Rola ${r}. Cadrul ${f}.`, sheetA: 'Sute de cadre.', sheetB: 'Trimit doar ce merită.',
    },
    calc: { date: 'Data dorită pentru ședință', previews: 'Previzualizări editate', gallery: 'Galeria completă', film: 'Aftermovie', check: 'Verificați această dată',
      sameEvening: (t: string) => `În aceeași seară, la ${t}`, within: (n: number) => `În ${ro(n, 'zi lucrătoare', 'zile lucrătoare')}` },
    about: { title: 'Despre', expect: 'La ce vă puteți aștepta', howBooking: 'Cum decurge o rezervare', ctaTitle: 'Un eveniment sau o poveste de brand?',
      ctaText: 'Trimiteți-mi data și câteva detalii. Vă confirm disponibilitatea în cel mult o zi lucrătoare.', book: 'Planificați o ședință' },
    contact: {
      head: ['Planificăm', 'o ședință?'], services: 'Servicii', direct: 'Preferați să scrieți direct?', name: 'Numele dumneavoastră', email: 'Email',
      kind: 'Ce doriți să fotografiem sau să filmăm?', other: 'Altceva', org: 'Compania sau numele evenimentului (opțional)', guests: 'Număr estimat de invitați (opțional)',
      guestsPh: 'ex. 150', date: 'Data dorită pentru ședință', location: 'Locația (opțional)', locationPh: 'Sala sau orașul',
      hint: (t: string, d: number) => `Previzualizări în aceeași seară, la ${t}. Galeria completă în ${ro(d, 'zi lucrătoare', 'zile lucrătoare')}.`,
      message: 'Povestiți-mi despre proiect', messagePh: 'Evenimentul sau afacerea dumneavoastră, fotografiile ori videoclipurile dorite și unde vor fi publicate.',
      submit: 'Verificați disponibilitatea',
    },
    films: { title: 'Filme', seoTitle: 'Filme și video', desc: 'Aftermovie-uri de eveniment și Reels pentru branduri și afaceri mici, de Ellina Yatsenyuk.',
      intro: 'Aftermovie-uri, highlights și reel-uri pentru rețele sociale, de la conferințe, seminare și evenimente corporative. Fiecare film se deschide pe tot ecranul.',
      filter: 'Filtrați filmele', all: 'Toate', featured: 'Film recomandat', list: 'Toate filmele', photos: 'Fotografii de la acest eveniment' },
    portfolio: { title: 'Portofoliu', desc: 'Fotografie de conferințe, seminare, evenimente corporative și portrete de speakeri, de Ellina Yatsenyuk.',
      intro: (p: number, e: number) => `${ro(p, 'fotografie', 'fotografii')} de la ${ro(e, 'eveniment', 'evenimente')}. Alegeți o categorie sau deschideți orice cadru pe tot ecranul.`,
      filter: 'Filtrați după categorie', all: 'Toate', projects: 'Proiecte', photos: 'Fotografii' },
    work: { category: 'Categorie', client: 'Client', location: 'Locație', year: 'An', photos: (t: string) => `Fotografii: ${t}`,
      filmAria: 'Filmul de la acest eveniment', film: 'Filmul', credits: 'Echipa', next: 'Următorul eveniment', view: (t: string) => `${t}, vedeți proiectul` },
    notFound: { title: 'Pagina nu a fost găsită', h: 'În afara cadrului', text: 'Această pagină nu există sau a fost mutată. Lucrările sunt în continuare aici.', portfolio: 'Deschideți portofoliul', home: 'Pagina principală' },
    a11y: { play: (t: string) => `Redați ${t}`, open: (a: string) => `Deschideți pe tot ecranul: ${a}` },
    count: { photos: (n: number) => ro(n, 'fotografie', 'fotografii') },
    categories: { Brands: "Branduri și social media", Conferences: 'Conferințe', Seminars: 'Seminare', Corporate: 'Corporate', Portraits: 'Portrete', Celebrations: 'Gale și sărbători' },
    kinds: { Reels: 'Reels', Aftermovie: 'Aftermovie', Highlights: 'Highlights', Reel: 'Reel', 'Behind the scenes': 'Din culise' },
    client: { sending: 'Se trimite mesajul…', errorTail: 'Vă rog să-mi scrieți direct pe email.', required: 'Acest câmp este necesar ca să vă pot răspunde.',
      emailBad: 'Verificați adresa de email, pare incompletă.', from: 'Din {x}',
      hint: 'Previzualizări {d}, la {t}. Galeria completă până la {g}.', menu: 'Meniu', close: 'Închide' },
  },

  ru: {
    nav: { portfolio: 'Портфолио', films: 'Фильмы', about: 'Обо мне', book: 'Забронировать', home: 'Главная', menu: 'Меню', close: 'Закрыть', main: 'Основное', language: 'Язык' },
    skip: 'Перейти к содержимому',
    footer: { pages: 'Страницы', elsewhere: 'Соцсети', rights: 'Все фотографии и фильмы защищены авторским правом.', toTop: 'Наверх' },
    viewer: { photo: 'Просмотр фото', close: 'Закрыть', prev: 'Предыдущее фото', next: 'Следующее фото', project: 'Открыть проект', film: 'Видеоплеер', closeFilm: 'Закрыть фильм' },
    cursor: { view: 'Смотреть', play: 'Включить', expand: 'Открыть', next: 'Дальше' },
    home: {
      lede: "Фотосъёмка мероприятий и афтемуви. Фотографии для брендов, Reels для Instagram и контент для соцсетей. В Кишинёве, для компаний и малого бизнеса.",
      checkDate: 'Проверить дату', seeWork: 'Смотреть работы', howBooking: 'Как проходит бронирование',
      selected: 'Избранные работы', fullPortfolio: 'Всё портфолио', filmsHead: 'Афтемуви и рилсы', allFilms: 'Все фильмы', everyFilm: 'Смотреть все фильмы',
      cover: 'Что я снимаю', choose: 'Выберите категорию, чтобы посмотреть работы', book: 'Забронировать дату',
      sheetKicker: (r: number, f: string) => `Плёнка ${r}. Кадр ${f}.`, sheetA: 'Сотни кадров.', sheetB: 'Отправляю только лучшие.',
    },
    calc: { date: 'Желаемая дата съёмки', previews: 'Превью с обработкой', gallery: 'Полная галерея', film: 'Афтемуви', check: 'Проверить эту дату',
      sameEvening: (t: string) => `В тот же вечер, ${t}`, within: (n: number) => `В течение ${ru(n, 'рабочего дня', 'рабочих дней', 'рабочих дней')}` },
    about: { title: 'Обо мне', expect: 'Чего ожидать', howBooking: 'Как проходит бронирование', ctaTitle: 'Событие или история вашего бренда?',
      ctaText: 'Пришлите дату и пару деталей. Я подтвержу, свободна ли, в течение одного рабочего дня.', book: 'Забронировать дату' },
    contact: {
      head: ['Запланируем', 'съёмку?'], services: 'Услуги', direct: 'Удобнее написать напрямую?', name: 'Ваше имя', email: 'Email',
      kind: 'Что будем снимать?', other: 'Другое', org: 'Компания или название мероприятия (необязательно)', guests: 'Ожидаемое число гостей (необязательно)',
      guestsPh: 'например, 150', date: 'Желаемая дата съёмки', location: 'Место (необязательно)', locationPh: 'Площадка или город',
      hint: (t: string, d: number) => `Превью — в тот же вечер, в ${t}. Полная галерея — в течение ${ru(d, 'рабочего дня', 'рабочих дней', 'рабочих дней')}.`,
      message: 'Расскажите о проекте', messagePh: 'Ваше мероприятие или бизнес, нужные фотографии и видео, а также площадки для публикации.',
      submit: 'Проверить дату',
    },
    films: { title: 'Фильмы', seoTitle: 'Фильмы и видео', desc: 'Афтемуви мероприятий и Reels для брендов и малого бизнеса — Эллина Яценюк.',
      intro: 'Афтемуви, хайлайты и рилсы для соцсетей с конференций, семинаров и корпоративных событий. Каждый фильм открывается на весь экран.',
      filter: 'Фильтр фильмов', all: 'Все', featured: 'Главный фильм', list: 'Все фильмы', photos: 'Фотографии с этого мероприятия' },
    portfolio: { title: 'Портфолио', desc: 'Съёмка конференций, семинаров, корпоративных мероприятий и портретов спикеров — Эллина Яценюк.',
      intro: (p: number, e: number) => `${ru(p, 'фотография', 'фотографии', 'фотографий')} с ${ru(e, 'мероприятия', 'мероприятий', 'мероприятий')}. Выберите категорию или откройте любой кадр на весь экран.`,
      filter: 'Фильтр по категориям', all: 'Все', projects: 'Проекты', photos: 'Фотографии' },
    work: { category: 'Категория', client: 'Клиент', location: 'Место', year: 'Год', photos: (t: string) => `Фотографии: ${t}`,
      filmAria: 'Фильм с этого мероприятия', film: 'Фильм', credits: 'Команда', next: 'Следующее мероприятие', view: (t: string) => `${t} — открыть проект` },
    notFound: { title: 'Страница не найдена', h: 'Вне кадра', text: 'Такой страницы нет или она переехала. А работы — на месте.', portfolio: 'Открыть портфолио', home: 'На главную' },
    a11y: { play: (t: string) => `Смотреть: ${t}`, open: (a: string) => `Открыть на весь экран: ${a}` },
    count: { photos: (n: number) => ru(n, 'фотография', 'фотографии', 'фотографий') },
    categories: { Brands: "Бренды и соцсети", Conferences: 'Конференции', Seminars: 'Семинары', Corporate: 'Корпоративы', Portraits: 'Портреты', Celebrations: 'Гала и праздники' },
    kinds: { Reels: 'Reels', Aftermovie: 'Афтемуви', Highlights: 'Хайлайты', Reel: 'Рилс', 'Behind the scenes': 'За кадром' },
    client: { sending: 'Отправляю сообщение…', errorTail: 'Пожалуйста, напишите мне на почту напрямую.', required: 'Это поле нужно, чтобы я могла ответить.',
      emailBad: 'Проверьте email — кажется, адрес неполный.', from: 'Из проекта «{x}»',
      hint: 'Превью — {d} в {t}. Полная галерея — к {g}.', menu: 'Меню', close: 'Закрыть' },
  },
} satisfies Record<Lang, unknown>;

/* Workstreams 2–4: localized interaction labels. */
const studio = {
  en: { trust: 'Good work. Good company.', numbers: 'The studio, in numbers', pauseLogos: 'Pause logos', playLogos: 'Resume logos', frames: 'Explore the frames', frame: 'Frame', zoom: 'Zoom photo', resetZoom: 'Reset zoom', loading: 'Loading photograph…', imageError: 'This photograph could not load. Try another frame.', advance: 'Scroll to the next event', advanceHint: 'Enable, then scroll through this image to continue. Escape cancels.', cancel: 'Cancel', bookStory: 'A story like this for your event?', book: 'Check your date' },
  ro: { trust: 'Lucrări bune. Oameni buni.', numbers: 'Studioul, în cifre', pauseLogos: 'Opriți siglele', playLogos: 'Reluați siglele', frames: 'Explorați cadrele', frame: 'Cadrul', zoom: 'Măriți fotografia', resetZoom: 'Resetați mărirea', loading: 'Se încarcă fotografia…', imageError: 'Fotografia nu s-a încărcat. Încercați alt cadru.', advance: 'Derulați spre următorul eveniment', advanceHint: 'Activați, apoi derulați prin imagine pentru a continua. Escape anulează.', cancel: 'Anulați', bookStory: 'O poveste ca aceasta pentru evenimentul dumneavoastră?', book: 'Verificați data' },
  ru: { trust: 'Хорошая работа. Хорошая компания.', numbers: 'Студия в цифрах', pauseLogos: 'Остановить логотипы', playLogos: 'Продолжить логотипы', frames: 'Посмотреть кадры', frame: 'Кадр', zoom: 'Увеличить фото', resetZoom: 'Сбросить масштаб', loading: 'Загружаю фотографию…', imageError: 'Не удалось загрузить фотографию. Попробуйте другой кадр.', advance: 'Прокрутить к следующему событию', advanceHint: 'Включите, затем прокрутите изображение, чтобы продолжить. Escape отменяет переход.', cancel: 'Отмена', bookStory: 'Такая история для вашего мероприятия?', book: 'Проверить дату' },
};

const bookingUi = {
  "en": {
    "onRequest": "On request",
    "reachTitle": "Write to me",
    "reachText": "Send the date, place and type of event or project. I reply within one working day.",
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
    "email": "Email"
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
    "email": "Email"
  },
  "ru": {
    "onRequest": "По запросу",
    "reachTitle": "Напишите мне",
    "reachText": "Пришлите дату, место и тип мероприятия или проекта. Отвечу в течение рабочего дня.",
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
    "call": "Позвонить мне",
    "directChannels": "Напишите мне напрямую",
    "formError": "Не удалось отправить сообщение. Пожалуйста, попробуйте ещё раз.",
    "dateBad": "Выберите сегодняшнюю или будущую дату.",
    "stepOf": "Шаг {x} из 4",
    "telegram": "Telegram",
    "whatsapp": "WhatsApp",
    "viber": "Viber",
    "email": "Email"
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
  ro: { read: 'Datele formularului nu au putut fi citite.', fast: 'A fost puțin prea rapid.', many: 'Prea multe mesaje într-un timp scurt.',
    spam: 'Verificarea anti-spam nu a trecut.', fields: 'Sunt necesare numele, un email valid și un mesaj.', links: 'Vă rog să includeți mai puține linkuri.',
    inbox: 'Formularul nu este încă conectat la o căsuță de email.', deliver: 'Mesajul nu a putut fi livrat.' },
  ru: { read: 'Не удалось прочитать данные формы.', fast: 'Слишком быстро.', many: 'Слишком много сообщений за короткое время.',
    spam: 'Проверка на спам не пройдена.', fields: 'Нужны имя, корректный email и сообщение.', links: 'Пожалуйста, добавьте меньше ссылок.',
    inbox: 'Форма ещё не подключена к почте.', deliver: 'Не удалось доставить сообщение.' },
};
