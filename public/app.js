// State
let cachedWords = [];
let currentPage = 1;
let totalPages = 1;
let totalWords = 0;
const LIMIT = 40;

// Filters
function getFilters() {
    return {
        search: document.getElementById('search-input').value.trim(),
        topic: document.getElementById('filter-topic').value,
        tag: document.getElementById('filter-tag').value,
        sort: document.getElementById('filter-sort').value
    };
}

// API
async function fetchWords(page = 1) {
    const f = getFilters();
    const params = new URLSearchParams({ page, limit: LIMIT });
    if (f.search) params.set('search', f.search);
    if (f.topic) params.set('topic', f.topic);
    if (f.tag) params.set('tag', f.tag);
    if (f.sort) params.set('sort', f.sort);
    const res = await fetch('/api/words?' + params);
    return res.json();
}

async function fetchAllWords() {
    const res = await fetch('/api/words?limit=100000');
    const data = await res.json();
    return data.words || [];
}

async function fetchTopics() {
    const res = await fetch('/api/topics');
    return res.json();
}

async function addWordApi(word) {
    const res = await fetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(word)
    });
    return res.json();
}

async function updateWordApi(id, word) {
    await fetch('/api/words/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(word)
    });
}

async function removeWordApi(id) {
    await fetch('/api/words/' + id, { method: 'DELETE' });
}

async function updateScoreApi(id, delta) {
    await fetch('/api/words/' + id + '/score', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta })
    });
}

// Toast
function showToast(msg, isError) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const t = document.createElement('div');
    t.className = 'toast' + (isError ? ' toast-error' : '');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

// Nav
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(page + '-page').classList.add('active');
        if (page === 'words') loadWords(1);
        if (page === 'practice') initPractice();
    });
});

// Load topics for filter & datalist
async function loadTopics() {
    const topics = await fetchTopics();
    const sel = document.getElementById('filter-topic');
    const existing = sel.querySelector('option[value=""]');
    sel.innerHTML = '';
    sel.appendChild(existing || Object.assign(document.createElement('option'), { value: '', textContent: 'Barcha topiclar' }));
    topics.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        sel.appendChild(opt);
    });
    // Datalist for forms
    const dl = document.getElementById('topic-list');
    if (dl) {
        dl.innerHTML = '';
        topics.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            dl.appendChild(opt);
        });
    }
}

// Render words
function renderWordCard(w) {
    const tags = (w.tags || '').split(',').filter(Boolean);
    return `
        <div class="word-card" data-id="${w.id}">
            <div class="word-card-header">
                <span class="word-english">${escapeHtml(w.english)}</span>
                <div class="word-card-actions">
                    <button class="btn-edit" onclick="openEdit(${w.id})">tahrir</button>
                    <button class="btn-delete" onclick="deleteWord(${w.id})">o'chirish</button>
                </div>
            </div>
            <div class="word-uzbek">${escapeHtml(w.uzbek)}</div>
            ${w.synonyms ? `<div class="word-synonyms">${escapeHtml(w.synonyms)}</div>` : ''}
            ${w.example ? `<div class="word-example">"${escapeHtml(w.example)}"</div>` : ''}
            <div class="word-meta">
                ${w.topic ? `<span class="word-topic">${escapeHtml(w.topic)}</span>` : ''}
                ${tags.map(t => `<span class="word-tag ${t}">${t}</span>`).join('')}
                ${w.score > 0 ? `<span class="word-score">${w.score}/5</span>` : ''}
            </div>
        </div>`;
}

function renderPagination() {
    const el = document.getElementById('pagination');
    if (totalPages <= 1) { el.innerHTML = ''; return; }

    let html = '';
    html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="loadWords(${currentPage - 1})">&#8592;</button>`;

    const maxShow = 7;
    let start = Math.max(1, currentPage - 3);
    let end = Math.min(totalPages, start + maxShow - 1);
    if (end - start < maxShow - 1) start = Math.max(1, end - maxShow + 1);

    if (start > 1) {
        html += `<button onclick="loadWords(1)">1</button>`;
        if (start > 2) html += `<span style="color:#64748b;padding:0 4px">...</span>`;
    }
    for (let i = start; i <= end; i++) {
        html += `<button class="${i === currentPage ? 'active' : ''}" onclick="loadWords(${i})">${i}</button>`;
    }
    if (end < totalPages) {
        if (end < totalPages - 1) html += `<span style="color:#64748b;padding:0 4px">...</span>`;
        html += `<button onclick="loadWords(${totalPages})">${totalPages}</button>`;
    }

    html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="loadWords(${currentPage + 1})">&#8594;</button>`;
    el.innerHTML = html;
}

async function loadWords(page = 1) {
    currentPage = page;
    const data = await fetchWords(page);
    cachedWords = data.words;
    totalPages = data.totalPages;
    totalWords = data.total;

    const list = document.getElementById('words-list');
    const empty = document.getElementById('empty-state');
    document.getElementById('word-count').textContent = totalWords + ' ta so\'z';

    if (cachedWords.length === 0) {
        list.innerHTML = '';
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        list.innerHTML = cachedWords.map(renderWordCard).join('');
    }
    renderPagination();
}

// Debounced search
let searchTimer;
document.getElementById('search-input').addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadWords(1), 300);
});

document.getElementById('filter-topic').addEventListener('change', () => loadWords(1));
document.getElementById('filter-tag').addEventListener('change', () => loadWords(1));
document.getElementById('filter-sort').addEventListener('change', () => loadWords(1));

// Get selected tags from checkboxes
function getSelectedTags(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(cb => cb.value).join(',');
}

function setTagCheckboxes(name, tagsStr) {
    const tags = (tagsStr || '').split(',').map(t => t.trim());
    document.querySelectorAll(`input[name="${name}"]`).forEach(cb => {
        cb.checked = tags.includes(cb.value);
    });
}

// English input real-time check
let checkTimer;
document.getElementById('english').addEventListener('input', (e) => {
    clearTimeout(checkTimer);
    const val = e.target.value.trim();
    const hint = document.getElementById('english-check');
    if (!val) { hint.textContent = ''; hint.className = 'input-hint'; return; }
    checkTimer = setTimeout(async () => {
        const res = await fetch('/api/words/check?word=' + encodeURIComponent(val));
        const data = await res.json();
        if (data.exists) {
            hint.textContent = 'Bu so\'z mavjud: "' + data.word.english + '" — ' + data.word.uzbek;
            hint.className = 'input-hint exists';
        } else {
            hint.textContent = 'Yangi so\'z';
            hint.className = 'input-hint ok';
        }
    }, 300);
});

// Add word
document.getElementById('word-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await fetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            english: document.getElementById('english').value.trim(),
            uzbek: document.getElementById('uzbek').value.trim(),
            synonyms: document.getElementById('synonyms').value.trim(),
            example: document.getElementById('example').value.trim(),
            topic: document.getElementById('topic').value.trim(),
            tags: getSelectedTags('tags')
        })
    });
    const data = await res.json();
    if (res.status === 409) {
        showToast(data.error, true);
        return;
    }
    e.target.reset();
    showToast('So\'z qo\'shildi!');
    document.getElementById('english').focus();
    loadTopics();
});

// Delete word
async function deleteWord(id) {
    if (!confirm('Bu so\'zni o\'chirmoqchimisiz?')) return;
    await removeWordApi(id);
    await loadWords(currentPage);
    showToast('So\'z o\'chirildi');
}

// Edit
function openEdit(id) {
    const word = cachedWords.find(w => w.id === id);
    if (!word) return;
    document.getElementById('edit-id').value = word.id;
    document.getElementById('edit-english').value = word.english;
    document.getElementById('edit-uzbek').value = word.uzbek;
    document.getElementById('edit-synonyms').value = word.synonyms || '';
    document.getElementById('edit-example').value = word.example || '';
    document.getElementById('edit-topic').value = word.topic || '';
    setTagCheckboxes('edit-tags', word.tags || '');
    document.getElementById('edit-modal').style.display = 'flex';
}

document.getElementById('btn-cancel-edit').addEventListener('click', () => {
    document.getElementById('edit-modal').style.display = 'none';
});

document.getElementById('edit-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('edit-modal'))
        document.getElementById('edit-modal').style.display = 'none';
});

document.getElementById('edit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    await updateWordApi(id, {
        english: document.getElementById('edit-english').value.trim(),
        uzbek: document.getElementById('edit-uzbek').value.trim(),
        synonyms: document.getElementById('edit-synonyms').value.trim(),
        example: document.getElementById('edit-example').value.trim(),
        topic: document.getElementById('edit-topic').value.trim(),
        tags: getSelectedTags('edit-tags')
    });
    document.getElementById('edit-modal').style.display = 'none';
    await loadWords(currentPage);
    loadTopics();
    showToast('So\'z yangilandi!');
});

// Practice
let practiceWords = [];
let currentCardIndex = 0;
let correctCount = 0;
let practiceMode = 'en-uz';

async function initPractice() {
    const words = await fetchAllWords();
    const emptyEl = document.getElementById('practice-empty');
    const areaEl = document.getElementById('practice-area');
    const doneEl = document.getElementById('practice-done');

    if (words.length === 0) {
        emptyEl.style.display = 'block';
        areaEl.style.display = 'none';
        doneEl.style.display = 'none';
        return;
    }
    emptyEl.style.display = 'none';
    doneEl.style.display = 'none';
    areaEl.style.display = 'block';
    startPractice(words);
}

function startPractice(words) {
    if (words) {
        practiceWords = [...words].sort((a, b) => (a.score || 0) - (b.score || 0)).slice(0, 20);
        for (let i = practiceWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [practiceWords[i], practiceWords[j]] = [practiceWords[j], practiceWords[i]];
        }
    }
    currentCardIndex = 0;
    correctCount = 0;
    showCard();
}

function showCard() {
    if (currentCardIndex >= practiceWords.length) { finishPractice(); return; }
    const word = practiceWords[currentCardIndex];
    document.getElementById('flashcard-inner').classList.remove('flipped');
    const front = document.getElementById('card-front-word');
    const back = document.getElementById('card-back-word');
    if (practiceMode === 'en-uz') { front.textContent = word.english; back.textContent = word.uzbek; }
    else { front.textContent = word.uzbek; back.textContent = word.english; }
    document.getElementById('card-synonyms').textContent = word.synonyms ? 'Sinonimlar: ' + word.synonyms : '';
    document.getElementById('card-example').textContent = word.example ? '"' + word.example + '"' : '';
    document.getElementById('practice-progress').textContent = (currentCardIndex + 1) + ' / ' + practiceWords.length;
}

document.getElementById('flashcard').addEventListener('click', () => {
    document.getElementById('flashcard-inner').classList.toggle('flipped');
});

document.getElementById('btn-know').addEventListener('click', async () => {
    await updateScoreApi(practiceWords[currentCardIndex].id, 1);
    correctCount++;
    currentCardIndex++;
    showCard();
});

document.getElementById('btn-dont-know').addEventListener('click', async () => {
    await updateScoreApi(practiceWords[currentCardIndex].id, -1);
    currentCardIndex++;
    showCard();
});

function finishPractice() {
    document.getElementById('practice-area').style.display = 'none';
    document.getElementById('practice-done').style.display = 'block';
    document.getElementById('practice-result').textContent =
        practiceWords.length + ' ta so\'zdan ' + correctCount + ' tasini bildingiz!';
}

document.getElementById('btn-restart').addEventListener('click', () => startPractice());
document.getElementById('btn-practice-again').addEventListener('click', async () => {
    document.getElementById('practice-done').style.display = 'none';
    document.getElementById('practice-area').style.display = 'block';
    await initPractice();
});

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        practiceMode = btn.dataset.mode;
        await initPractice();
    });
});

// Init
loadTopics();
loadWords(1);
