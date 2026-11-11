/* ============================================================
   ЕГИПЕТСКИЙ КВЕСТ — общая логика
   Данные всех вопросов хранятся здесь, а страницы q1..q6
   подставляют нужный вопрос по номеру из data-атрибута.
   ============================================================ */

'use strict';

/* ---------- Безопасный доступ к DOM ---------- */

/**
 * Хелпер для поиска элемента по id.
 * Возвращает null вместо исключения, если DOM недоступен
 * (например, при запуске скрипта вне браузера или до загрузки разметки).
 */
function byId(id) {
    try {
        if (typeof document === 'undefined' || !document.getElementById) {
            return null;
        }
        return document.getElementById(id);
    } catch (e) {
        return null;
    }
}

/** Безопасный поиск одного элемента по CSS-селектору. */
function query(selector) {
    try {
        if (typeof document === 'undefined' || !document.querySelector) {
            return null;
        }
        return document.querySelector(selector);
    } catch (e) {
        return null;
    }
}

/** Безопасный поиск всех элементов по CSS-селектору (всегда массив). */
function queryAll(selector) {
    try {
        if (typeof document === 'undefined' || !document.querySelectorAll) {
            return [];
        }
        return Array.prototype.slice.call(document.querySelectorAll(selector));
    } catch (e) {
        return [];
    }
}

/* ---------- Константы ---------- */

// Секретное слово: буквы по порядку вопросов 1..6
const SECRET_WORD = ['Ф', 'А', 'Р', 'А', 'О', 'Н'];
const WORD_LENGTH = SECRET_WORD.length;

// Ключ хранения прогресса в localStorage
const STORAGE_KEY = 'egypt_quest_progress_v1';

// Иероглифы для фонового декора
const GLYPHS = ['𓂀', '𓃭', '𓆣', '𓊹', '𓋹', '𓌀',
                '𓍯', '𓎛', '𓏏', '𓐍', '𓅓', '𓆄'];

// Цвета конфетти
const CONFETTI_COLORS = ['#f5c842', '#c0392b', '#2980b9',
                          '#27ae60', '#8e44ad', '#e67e22', '#16a085'];

/* ---------- Данные вопросов ---------- */

const QUESTIONS = {
    1: {
        badge: 'QR-код №1',
        icon: '🏺',
        title: 'Древний Египет',
        question: 'На берегах какой великой реки возникла цивилизация Древнего Египта?',
        answers: [
            { letter: 'А', text: 'Тигр', correct: false },
            { letter: 'Б', text: 'Нил', correct: true },
            { letter: 'В', text: 'Евфрат', correct: false },
            { letter: 'Г', text: 'Инд', correct: false }
        ],
        hint: 'Тигр и Евфрат — реки Месопотамии, а Инд течёт в Индии. Египет вырос на берегах великой реки с плодородными разливами.',
        fact: 'Нил — самая длинная река в мире (около 6650 км). Каждый год она разливалась и оставляла на полях плодородный ил, поэтому Египет называли «житницей» древнего мира.'
    },
    2: {
        badge: 'QR-код №2',
        icon: '👑',
        title: 'Власть фараона',
        question: 'Как назывался правитель Древнего Египта, которого считали живым богом и верховным жрецом всех богов?',
        answers: [
            { letter: 'А', text: 'Фараон', correct: true },
            { letter: 'Б', text: 'Сенатор', correct: false },
            { letter: 'В', text: 'Легионер', correct: false },
            { letter: 'Г', text: 'Сиамский король', correct: false }
        ],
        hint: 'Сенатор — должность в Древнем Риме, легионер — римский солдат, а сиамские короли правили совсем в другой стране.',
        fact: 'Фараон был не только правителем, но и верховным жрецом. Его называли «сыном Ра» — солнечного бога. Имя фараона записывали иероглифами в так называемом «кольце имени» — овале с именем.'
    },
    3: {
        badge: 'QR-код №3',
        icon: '📜',
        title: 'Письмо египтян',
        question: 'Какие знаки египтяне использовали для письма?',
        answers: [
            { letter: 'А', text: 'Рун', correct: false },
            { letter: 'Б', text: 'Иероглифы', correct: true },
            { letter: 'В', text: 'Клинопись', correct: false },
            { letter: 'Г', text: 'Алфавит', correct: false }
        ],
        hint: 'Клинопись — письмо шумеров и вавилонян, а древние руны придумали германцы. Египетские знаки называются иероглифами.',
        fact: 'Иероглифы — знаки из картинок: глаз, птица, змея, кувшин. Со временем их стало больше 700, а расшифровал их в 1822 году Жан-Франсуа Шампольон.'
    },
    4: {
        badge: 'QR-код №4',
        icon: '🔺',
        title: 'Изобретения египтян',
        question: 'С помощью какого египетского изобретения можно было определять время, сезоны и размеры полей по длине тени?',
        answers: [
            { letter: 'А', text: 'Пирамида с наклонной гранью (гномон)', correct: true },
            { letter: 'Б', text: 'Колесо', correct: false },
            { letter: 'В', text: 'Стеклянные сосуды', correct: false },
            { letter: 'Г', text: 'Арка', correct: false }
        ],
        hint: 'Колесо египтяне не знали, арка пришла из Месопотамии, а стеклянные сосуды для хранения — не про тени. А вот треугольная пирамида работает как солнечные часы!',
        fact: 'Если в полдень поставить вертикальную палку или треугольную пирамиду, её тень в течение дня меняет длину. Египтяне измеряли тень и по ней знали время и высоту солнца.'
    },
    5: {
        badge: 'QR-код №5',
        icon: '⚱️',
        title: 'Сокровища Египта',
        question: 'Как называлась огромная каменная постройка треугольной формы, которую строили как гробницу для умершего царя?',
        answers: [
            { letter: 'А', text: 'Пирамида', correct: true },
            { letter: 'Б', text: 'Замок', correct: false },
            { letter: 'В', text: 'Храм Афины', correct: false },
            { letter: 'Г', text: 'Колизей', correct: false }
        ],
        hint: 'Замок — средневековая крепость, Афина — греческая богиня, Колизей — огромный римский амфитеатр. А огромная каменная гора-треугольник в Египте называется иначе.',
        fact: 'Пирамида Хеопса в Гизе — единственное из семи чудес света, сохранившееся до наших дней. Её строили около 20 лет, а рядом с ней лежит почти такой же по размеру «свинья» — пирамида Хемиунис, названная так по форме.'
    },
    6: {
        badge: 'QR-код №6',
        icon: '🛡️',
        title: 'Конец независимости',
        question: 'Какое могущественное царство завоевало Египет в VI веке до н. э. и положило конец его независимости?',
        answers: [
            { letter: 'А', text: 'Древняя Греция', correct: false },
            { letter: 'Б', text: 'Древний Рим', correct: false },
            { letter: 'В', text: 'Персия (Ахемениды)', correct: true },
            { letter: 'Г', text: 'Карфаген', correct: false }
        ],
        hint: 'Рим пришёл к Египту позже, в I веке до н. э., а Карфаген — это финикийский город в Северной Африке. А в VI веке до н. э. Египет завоевали персы.',
        fact: 'Персидский царь Камбиз II завоевал Египет в 525 году до н. э. В дальнейшем Египет ещё не раз становился частью больших империй — Римской, Византийской, арабских халифатов.'
    }
};

/* ---------- Хранилище прогресса ---------- */

function getProgress() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const data = raw ? JSON.parse(raw) : {};
        return (data && typeof data === 'object') ? data : {};
    } catch (e) {
        return {};
    }
}

function saveProgress(step, letter) {
    const progress = getProgress();
    progress[step] = letter;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
        /* приватный режим браузера — просто не сохраняем */
    }
}

function resetProgress() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* игнорируем */ }
}

/* ---------- Фоновые эффекты ---------- */

function buildStars(count) {
    const field = query('.star-field');
    if (!field) return;
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = (Math.random() * 3 + 1).toFixed(1);
        star.style.cssText =
            'width:' + size + 'px;height:' + size + 'px;' +
            'left:' + (Math.random() * 100).toFixed(2) + '%;' +
            'top:' + (Math.random() * 100).toFixed(2) + '%;' +
            '--d:' + (Math.random() * 4 + 2).toFixed(1) + 's;' +
            'animation-delay:' + (Math.random() * 5).toFixed(1) + 's;';
        field.appendChild(star);
    }
}

function buildGlyphs(count) {
    const layer = query('.bg-layer');
    if (!layer) return;
    for (let i = 0; i < count; i++) {
        const glyph = document.createElement('div');
        glyph.className = 'hieroglyph';
        glyph.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        glyph.style.cssText =
            'left:' + (Math.random() * 92).toFixed(2) + '%;' +
            'top:' + (Math.random() * 100).toFixed(2) + '%;' +
            'font-size:' + (Math.random() * 2 + 1.6).toFixed(1) + 'em;' +
            '--dur:' + (Math.random() * 18 + 18).toFixed(1) + 's;' +
            'animation-delay:' + (Math.random() * 18).toFixed(1) + 's;';
        layer.appendChild(glyph);
    }
}

function launchConfetti(count) {
    const pieces = count || 60;
    for (let i = 0; i < pieces; i++) {
        setTimeout(function () {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            const size = (Math.random() * 10 + 6).toFixed(0);
            piece.style.cssText =
                'left:' + (Math.random() * 100).toFixed(2) + 'vw;' +
                'width:' + size + 'px;height:' + size + 'px;' +
                'background:' + CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)] + ';' +
                'border-radius:' + (Math.random() > 0.5 ? '50%' : '2px') + ';' +
                'animation-duration:' + (Math.random() * 2 + 1.5).toFixed(1) + 's;';
            document.body.appendChild(piece);
            setTimeout(function () { piece.remove(); }, 4200);
        }, i * 40);
    }
}

/* ---------- Звук (Web Audio API, без файлов) ---------- */

let audioCtx = null;

function playTone(freq, start, duration, type, volume) {
    try {
        if (!audioCtx) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            audioCtx = new Ctx();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type || 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, audioCtx.currentTime + start);
        gain.gain.linearRampToValueAtTime(volume || 0.18, audioCtx.currentTime + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + start);
        osc.stop(audioCtx.currentTime + start + duration + 0.05);
    } catch (e) {
        /* звук не критичен — просто пропускаем */
    }
}

/** Победный аккорд */
function playSuccessSound() {
    playTone(523.25, 0.00, 0.35, 'triangle', 0.18);
    playTone(659.25, 0.12, 0.35, 'triangle', 0.17);
    playTone(783.99, 0.24, 0.45, 'triangle', 0.16);
    playTone(1046.5, 0.38, 0.60, 'sine', 0.14);
}

/** Мягкий «увы» */
function playWrongSound() {
    playTone(320, 0.00, 0.22, 'sine', 0.12);
    playTone(240, 0.16, 0.34, 'sine', 0.11);
}

/* ---------- Отображение прогресса слова ---------- */

function renderWordProgress(container, upToStep) {
    if (!container) return;
    const progress = getProgress();
    container.innerHTML = '';
    for (let i = 1; i <= WORD_LENGTH; i++) {
        const cell = document.createElement('div');
        const letter = progress[i];
        cell.className = 'word-cell' + (letter ? ' filled' : '');
        cell.textContent = letter || '';
        container.appendChild(cell);
    }
}

/* ---------- Рендеринг страницы вопроса ---------- */

function renderQuestionPage() {
    const step = parseInt(document.body.dataset.step, 10);
    const data = QUESTIONS[step];
    if (!data) return;

    // Заголовок
    const badge = byId('qr-badge');
    if (badge) badge.textContent = data.badge;
    const icon = byId('card-icon');
    if (icon) icon.textContent = data.icon;
    const title = byId('card-title');
    if (title) title.textContent = data.title;
    const question = byId('question-text');
    if (question) question.textContent = data.question;

    // Факт
    const fact = byId('fact-text');
    if (fact) fact.textContent = data.fact;

    // Ответы
    const answersBox = byId('answers');
    if (answersBox) {
        answersBox.innerHTML = '';
        data.answers.forEach(function (answer) {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.type = 'button';
            btn.innerHTML =
                '<span class="answer-letter">' + answer.letter + '</span>' +
                '<span>' + answer.text + '</span>';
            btn.addEventListener('click', function () {
                handleAnswer(step, data, answer, btn);
            });
            answersBox.appendChild(btn);
        });
    }

    // Оверлеи
    const hintEl = byId('hint-text');
    if (hintEl) hintEl.textContent = data.hint;

    const letterEl = byId('reward-letter');
    if (letterEl) letterEl.textContent = SECRET_WORD[step - 1];
}

function handleAnswer(step, data, answer, button) {
    if (answer.correct) {
        // Блокируем все кнопки
        const buttons = queryAll('.answer-btn');
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].disabled = true;
        }
        button.style.background = 'linear-gradient(135deg, #f5c842, #ffe87a)';
        button.style.borderColor = '#5c3d11';

        saveProgress(step, SECRET_WORD[step - 1]);
        playSuccessSound();
        launchConfetti(70);

        const overlay = byId('overlay-correct');
        if (!overlay) return;
        renderWordProgress(query('.word-progress') || overlay.querySelector('.word-progress'));
        overlay.classList.add('show');

        // Если слово собрано полностью — переход на финал
        const progress = getProgress();
        const solved = Object.keys(progress).length >= WORD_LENGTH;
        if (solved) {
            setTimeout(function () {
                window.location.href = 'final.html';
            }, 2600);
        }
    } else {
        playWrongSound();
        const overlay = byId('overlay-wrong');
        if (overlay) overlay.classList.add('show');
    }
}

/* ---------- Финальная страница ---------- */

function renderFinalPage() {
    const wordBox = byId('final-word');
    if (wordBox) {
        for (let i = 0; i < WORD_LENGTH; i++) {
            const cell = document.createElement('div');
            cell.className = 'final-cell';
            cell.textContent = SECRET_WORD[i];
            cell.style.animationDelay = (i * 0.18).toFixed(2) + 's';
            wordBox.appendChild(cell);
            setTimeout(function () { cell.classList.add('show'); }, 400 + i * 180);
        }
    }

    const progress = getProgress();
    const solvedCount = Object.keys(progress).length;
    const counter = byId('solved-counter');
    if (counter) {
        counter.textContent = solvedCount >= WORD_LENGTH
            ? 'Все 6 букв найдены!'
            : 'Найдено букв: ' + solvedCount + ' из ' + WORD_LENGTH + '. Отсканируй остальные QR-коды на стенде!';
    }

    setTimeout(function () {
        launchConfetti(120);
        playSuccessSound();
    }, 400);
}

/* ---------- Страница QR-кодов ---------- */

function renderQrPage() {
    const grid = byId('qr-grid');
    if (!grid) return;

    // Базовый адрес: путь к папке с index.html
    const base = window.location.href.replace(/qr\.html.*$/, '');

    for (let i = 1; i <= WORD_LENGTH; i++) {
        const target = base + 'q' + i + '.html';
        const url = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=' + encodeURIComponent(target);

        const item = document.createElement('div');
        item.className = 'qr-item';
        item.innerHTML =
            '<img src="' + url + '" alt="QR-код №' + i + '" loading="lazy">' +
            '<div class="qr-item-title">QR-код №' + i + '</div>';
        grid.appendChild(item);
    }
}

/* ---------- Инициализация ---------- */

/** Скрывает внедряемую хостингом плашку (например, «Hosted on …»). */
function hideHostBadge() {
    const kill = function () {
        const nodes = queryAll('a[href*="vibedrop"], [class*="vibedrop"], [id*="vibedrop"]');
        nodes.forEach(function (n) {
            // Не трогаем собственный контент сайта — только внедрённые бейджи
            if (!n.closest('.card') && !n.closest('.welcome-card') &&
                !n.closest('.final-card') && !n.closest('.qr-card')) {
                n.style.display = 'none';
            }
        });
    };
    kill();
    // Плашка может добавляться после загрузки — следим за DOM
    try {
        const observer = new MutationObserver(kill);
        observer.observe(document.body, { childList: true, subtree: true });
    } catch (e) { /* MutationObserver недоступен — уже скрыли статически */ }
}

document.addEventListener('DOMContentLoaded', function () {
    buildStars(90);
    buildGlyphs(12);
    hideHostBadge();

    const page = document.body ? document.body.dataset.page : '';
    if (page === 'question') {
        renderQuestionPage();
    } else if (page === 'final') {
        renderFinalPage();
    } else if (page === 'qr') {
        renderQrPage();
    }

    // Кнопка «Играть снова» на финальной странице
    const restart = byId('btn-restart');
    if (restart) {
        restart.addEventListener('click', function () {
            resetProgress();
            window.location.href = 'index.html';
        });
    }

    // Закрытие оверлеев
    const closeButtons = queryAll('[data-close-overlay]');
    for (let i = 0; i < closeButtons.length; i++) {
        closeButtons[i].addEventListener('click', function () {
            const overlay = this.closest('.result-overlay');
            if (overlay) overlay.classList.remove('show');
        });
    }
});
