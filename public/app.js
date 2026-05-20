// ========== AUTH ==========
let authToken = localStorage.getItem('auth_token') || null;
let currentUser = JSON.parse(localStorage.getItem('auth_user') || 'null');
let userFavorites = new Set();
let userNotes = {};

function H() { const h = {'Content-Type':'application/json'}; if (authToken) h['Authorization'] = 'Bearer ' + authToken; return h; }
function isAdmin() { return currentUser && currentUser.role === 'admin'; }

function showAuthPage() { document.getElementById('auth-page').style.display='flex'; document.getElementById('main-app').style.display='none'; }
function showMainApp() {
    document.getElementById('auth-page').style.display='none';
    document.getElementById('main-app').style.display='block';
    document.getElementById('user-display').textContent = currentUser.username + (isAdmin() ? ' (admin)' : '');
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = isAdmin() ? '' : 'none');
    loadFavorites();
    loadNotes();
    loadTopics();
    loadWords(1);
    loadWordOfDay();
}
function logout() { authToken=null; currentUser=null; localStorage.removeItem('auth_token'); localStorage.removeItem('auth_user'); showAuthPage(); }

document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const isLogin = tab.dataset.tab === 'login';
        document.getElementById('login-form').style.display = isLogin ? 'block' : 'none';
        document.getElementById('register-form').style.display = isLogin ? 'none' : 'block';
        document.getElementById('auth-error').textContent = '';
    });
});

async function doAuth(url, body) {
    const errEl = document.getElementById('auth-error'); errEl.textContent = '';
    try {
        const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
        const data = await res.json();
        if (!res.ok) { errEl.textContent = data.error; return; }
        authToken = data.token; currentUser = data.user;
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('auth_user', JSON.stringify(currentUser));
        showMainApp();
    } catch(e) { errEl.textContent = 'Xatolik yuz berdi'; }
}
document.getElementById('login-form').addEventListener('submit', e => { e.preventDefault(); doAuth('/api/auth/login', { username: document.getElementById('login-username').value.trim(), password: document.getElementById('login-password').value }); });
document.getElementById('register-form').addEventListener('submit', e => { e.preventDefault(); doAuth('/api/auth/register', { username: document.getElementById('reg-username').value.trim(), password: document.getElementById('reg-password').value }); });
document.getElementById('btn-logout').addEventListener('click', logout);

// ========== STATE ==========
let cachedWords=[], currentPage=1, totalPages=1, totalWords=0;
const LIMIT=40;

// ========== HELPERS ==========
function speakWord(w) { if (!w || !window.speechSynthesis) return; window.speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(w); u.lang='en-US'; u.rate=0.85; window.speechSynthesis.speak(u); }
function esc(t) { const d=document.createElement('div'); d.textContent=t||''; return d.innerHTML; }
function showToast(msg, err) { document.querySelectorAll('.toast').forEach(t=>t.remove()); const t=document.createElement('div'); t.className='toast'+(err?' toast-error':''); t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(),2500); }
function getSelectedTags(n) { return Array.from(document.querySelectorAll(`input[name="${n}"]:checked`)).map(c=>c.value).join(','); }
function setTagCheckboxes(n,s) { const tags=(s||'').split(',').map(t=>t.trim()); document.querySelectorAll(`input[name="${n}"]`).forEach(c=>{c.checked=tags.includes(c.value);}); }

// ========== FAVORITES ==========
async function loadFavorites() { try { const r=await fetch('/api/favorites',{headers:H()}); const d=await r.json(); userFavorites=new Set(d); } catch(e){} }
async function toggleFavorite(wid) {
    if (userFavorites.has(wid)) { await fetch('/api/favorites/'+wid,{method:'DELETE',headers:H()}); userFavorites.delete(wid); }
    else { await fetch('/api/favorites/'+wid,{method:'POST',headers:H()}); userFavorites.add(wid); }
    loadWords(currentPage);
}

// ========== NOTES ==========
async function loadNotes() { try { const r=await fetch('/api/notes',{headers:H()}); const d=await r.json(); userNotes={}; d.forEach(n=>userNotes[n.word_id]=n); } catch(e){} }
function openNotes(wid) {
    const n = userNotes[wid] || {};
    document.getElementById('note-word-id').value = wid;
    document.getElementById('note-text').value = n.note || '';
    document.getElementById('note-mnemonic').value = n.mnemonic || '';
    document.getElementById('notes-modal').style.display = 'flex';
}
document.getElementById('notes-form').addEventListener('submit', async e => {
    e.preventDefault();
    const wid = document.getElementById('note-word-id').value;
    await fetch('/api/notes/'+wid, { method:'PUT', headers:H(), body:JSON.stringify({ note: document.getElementById('note-text').value, mnemonic: document.getElementById('note-mnemonic').value }) });
    document.getElementById('notes-modal').style.display = 'none';
    await loadNotes();
    loadWords(currentPage);
    showToast('Eslatma saqlandi!');
});

// ========== WORD OF THE DAY ==========
async function loadWordOfDay() {
    try {
        const r = await fetch('/api/word-of-day');
        const w = await r.json();
        if (!w) return;
        document.getElementById('wotd-banner').style.display = 'flex';
        document.getElementById('wotd-word').textContent = w.english;
        document.getElementById('wotd-uzbek').textContent = w.uzbek;
        document.getElementById('wotd-extra').textContent = [w.synonyms, w.example].filter(Boolean).join(' | ');
        document.getElementById('wotd-speak').onclick = () => speakWord(w.english);
    } catch(e) {}
}

// ========== NAV ==========
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
        document.getElementById(page+'-page').classList.add('active');
        if (page==='words') loadWords(1);
        if (page==='practice') initPractice();
        if (page==='review') initReview();
        if (page==='quiz') initQuizPage();
        if (page==='stats') loadStats();
        if (page==='users') loadUsers();
        if (page==='badges') loadBadges();
        if (page==='challenge') loadChallenge();
        if (page==='reading') loadPassages();
        if (page==='writing') loadWritingPrompt();
        if (page==='mistakes') loadMistakes();
    });
});

// ========== TOPICS ==========
async function loadTopics() {
    const topics = await (await fetch('/api/topics')).json();
    ['filter-topic','quiz-topic'].forEach(id => {
        const sel = document.getElementById(id); if (!sel) return;
        const first = sel.querySelector('option[value=""]');
        sel.innerHTML = ''; sel.appendChild(first || Object.assign(document.createElement('option'),{value:'',textContent:'Barchasi'}));
        topics.forEach(t => { const o=document.createElement('option'); o.value=t; o.textContent=t; sel.appendChild(o); });
    });
    const dl=document.getElementById('topic-list');
    if (dl) { dl.innerHTML=''; topics.forEach(t=>{const o=document.createElement('option');o.value=t;dl.appendChild(o);}); }
}

// ========== WORDS ==========
function getFilters() {
    return { search:document.getElementById('search-input').value.trim(), topic:document.getElementById('filter-topic').value, tag:document.getElementById('filter-tag').value, sort:document.getElementById('filter-sort').value, band:document.getElementById('filter-band').value, favorites:document.getElementById('filter-favorites').checked?'1':'' };
}

function renderWordCard(w) {
    const tags=(w.tags||'').split(',').filter(Boolean);
    const isFav = userFavorites.has(w.id);
    const note = userNotes[w.id];
    return `<div class="word-card" data-id="${w.id}">
        <div class="word-card-header">
            <div class="word-english-wrap">
                <span class="word-english">${esc(w.english)}</span>
                <button class="btn-speak-small" onclick="speakWord('${esc(w.english)}');event.stopPropagation();">&#128266;</button>
            </div>
            <div class="word-card-actions">
                <button class="btn-fav ${isFav?'active':''}" onclick="toggleFavorite(${w.id})" title="Sevimli">${isFav?'&#9733;':'&#9734;'}</button>
                <button class="btn-note" onclick="openNotes(${w.id})" title="Eslatma">&#128221;</button>
                <button class="btn-edit" onclick="openEdit(${w.id})">tahrir</button>
                ${isAdmin()?`<button class="btn-delete" onclick="deleteWord(${w.id})">&#10005;</button>`:''}
            </div>
        </div>
        <div class="word-uzbek">${esc(w.uzbek)}</div>
        ${w.synonyms?`<div class="word-synonyms">${esc(w.synonyms)}</div>`:''}
        ${w.example?`<div class="word-example">"${esc(w.example)}"</div>`:''}
        ${w.word_forms?`<div class="word-forms-line">Forms: ${esc(w.word_forms)}</div>`:''}
        ${w.collocations?`<div class="word-collocations-line">Coll: ${esc(w.collocations)}</div>`:''}
        ${note&&note.mnemonic?`<div class="word-mnemonic">&#128161; ${esc(note.mnemonic)}</div>`:''}
        <div class="word-meta">
            ${w.band?`<span class="band-badge band-${w.band.replace('+','')}">B${esc(w.band)}</span>`:''}
            ${w.topic?`<span class="word-topic">${esc(w.topic)}</span>`:''}
            ${tags.map(t=>`<span class="word-tag ${t}">${t}</span>`).join('')}
            ${w.score>0?`<span class="word-score">${w.score}/5</span>`:''}
        </div>
    </div>`;
}

function renderPagination() {
    const el=document.getElementById('pagination');
    if (totalPages<=1){el.innerHTML='';return;}
    let h=`<button ${currentPage===1?'disabled':''} onclick="loadWords(${currentPage-1})">&#8592;</button>`;
    let start=Math.max(1,currentPage-3), end=Math.min(totalPages,start+6);
    if(end-start<6)start=Math.max(1,end-6);
    if(start>1){h+=`<button onclick="loadWords(1)">1</button>`;if(start>2)h+='<span class="pg-dots">...</span>';}
    for(let i=start;i<=end;i++)h+=`<button class="${i===currentPage?'active':''}" onclick="loadWords(${i})">${i}</button>`;
    if(end<totalPages){if(end<totalPages-1)h+='<span class="pg-dots">...</span>';h+=`<button onclick="loadWords(${totalPages})">${totalPages}</button>`;}
    h+=`<button ${currentPage===totalPages?'disabled':''} onclick="loadWords(${currentPage+1})">&#8594;</button>`;
    el.innerHTML=h;
}

async function loadWords(page=1) {
    currentPage=page;
    const f=getFilters();
    const p=new URLSearchParams({page,limit:LIMIT});
    if(f.search)p.set('search',f.search);if(f.topic)p.set('topic',f.topic);if(f.tag)p.set('tag',f.tag);if(f.sort)p.set('sort',f.sort);if(f.band)p.set('band',f.band);if(f.favorites)p.set('favorites','1');
    const data=await(await fetch('/api/words?'+p,{headers:H()})).json();
    cachedWords=data.words; totalPages=data.totalPages; totalWords=data.total;
    document.getElementById('word-count').textContent=totalWords+' ta so\'z';
    const list=document.getElementById('words-list'),empty=document.getElementById('empty-state');
    if(cachedWords.length===0){list.innerHTML='';empty.style.display='block';}
    else{empty.style.display='none';list.innerHTML=cachedWords.map(renderWordCard).join('');}
    renderPagination();
}

let searchTimer;
document.getElementById('search-input').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>loadWords(1),300);});
document.getElementById('filter-topic').addEventListener('change',()=>loadWords(1));
document.getElementById('filter-tag').addEventListener('change',()=>loadWords(1));
document.getElementById('filter-sort').addEventListener('change',()=>loadWords(1));
document.getElementById('filter-band').addEventListener('change',()=>loadWords(1));
document.getElementById('filter-favorites').addEventListener('change',()=>loadWords(1));

// ========== ADD WORD ==========
let checkTimer;
document.getElementById('english').addEventListener('input', e => {
    clearTimeout(checkTimer);const v=e.target.value.trim();const hint=document.getElementById('english-check');
    if(!v){hint.textContent='';hint.className='input-hint';return;}
    checkTimer=setTimeout(async()=>{const r=await(await fetch('/api/words/check?word='+encodeURIComponent(v))).json();
    if(r.exists){hint.textContent='Mavjud: '+r.word.english+' — '+r.word.uzbek;hint.className='input-hint exists';}
    else{hint.textContent='Yangi so\'z';hint.className='input-hint ok';}},300);
});

document.getElementById('word-form').addEventListener('submit', async e => {
    e.preventDefault();
    const res=await fetch('/api/words',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        english:document.getElementById('english').value.trim(),uzbek:document.getElementById('uzbek').value.trim(),
        synonyms:document.getElementById('synonyms').value.trim(),example:document.getElementById('example').value.trim(),
        topic:document.getElementById('topic').value.trim(),tags:getSelectedTags('tags'),
        word_forms:document.getElementById('word_forms').value.trim(),collocations:document.getElementById('collocations').value.trim(),
        band:document.getElementById('band').value
    })});
    const data=await res.json();
    if(res.status===409){showToast(data.error,true);return;}
    e.target.reset();showToast('So\'z qo\'shildi!');document.getElementById('english').focus();loadTopics();
});

// ========== DELETE / EDIT ==========
async function deleteWord(id){if(!confirm('O\'chirmoqchimisiz?'))return;await fetch('/api/words/'+id,{method:'DELETE',headers:H()});await loadWords(currentPage);showToast('O\'chirildi');}

function openEdit(id) {
    const w=cachedWords.find(x=>x.id===id);if(!w)return;
    document.getElementById('edit-id').value=w.id;
    document.getElementById('edit-english').value=w.english;document.getElementById('edit-uzbek').value=w.uzbek;
    document.getElementById('edit-synonyms').value=w.synonyms||'';document.getElementById('edit-example').value=w.example||'';
    document.getElementById('edit-topic').value=w.topic||'';document.getElementById('edit-band').value=w.band||'';
    document.getElementById('edit-word_forms').value=w.word_forms||'';document.getElementById('edit-collocations').value=w.collocations||'';
    setTagCheckboxes('edit-tags',w.tags||'');
    document.getElementById('edit-modal').style.display='flex';
}
document.getElementById('btn-cancel-edit').addEventListener('click',()=>document.getElementById('edit-modal').style.display='none');
document.getElementById('edit-modal').addEventListener('click',e=>{if(e.target===document.getElementById('edit-modal'))document.getElementById('edit-modal').style.display='none';});

document.getElementById('edit-form').addEventListener('submit', async e => {
    e.preventDefault();const id=document.getElementById('edit-id').value;
    await fetch('/api/words/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        english:document.getElementById('edit-english').value.trim(),uzbek:document.getElementById('edit-uzbek').value.trim(),
        synonyms:document.getElementById('edit-synonyms').value.trim(),example:document.getElementById('edit-example').value.trim(),
        topic:document.getElementById('edit-topic').value.trim(),tags:getSelectedTags('edit-tags'),
        word_forms:document.getElementById('edit-word_forms').value.trim(),collocations:document.getElementById('edit-collocations').value.trim(),
        band:document.getElementById('edit-band').value
    })});
    document.getElementById('edit-modal').style.display='none';await loadWords(currentPage);loadTopics();showToast('Yangilandi!');
});

// ========== REVIEW (SPACED REPETITION) ==========
let reviewWords=[],reviewIndex=0,reviewCorrect=0;
async function initReview(){
    reviewWords=await(await fetch('/api/words/review')).json();reviewIndex=0;reviewCorrect=0;
    const empty=document.getElementById('review-empty'),area=document.getElementById('review-area'),done=document.getElementById('review-done');
    if(reviewWords.length===0){empty.style.display='block';area.style.display='none';done.style.display='none';return;}
    empty.style.display='none';done.style.display='none';area.style.display='block';
    document.getElementById('review-due-count').textContent=reviewWords.length+' ta';
    showReviewCard();
}
function showReviewCard(){
    if(reviewIndex>=reviewWords.length){document.getElementById('review-area').style.display='none';document.getElementById('review-done').style.display='block';document.getElementById('review-result').textContent=reviewWords.length+' dan '+reviewCorrect+' ta to\'g\'ri!';return;}
    const w=reviewWords[reviewIndex];
    document.getElementById('review-flashcard-inner').classList.remove('flipped');
    document.getElementById('review-front-word').textContent=w.english;document.getElementById('review-back-word').textContent=w.uzbek;
    document.getElementById('review-synonyms').textContent=w.synonyms?'Sin: '+w.synonyms:'';
    document.getElementById('review-example').textContent=w.example?'"'+w.example+'"':'';
    document.getElementById('review-collocations').textContent=w.collocations?'Coll: '+w.collocations:'';
    document.getElementById('review-word-forms').textContent=w.word_forms?'Forms: '+w.word_forms:'';
    document.getElementById('review-speak-btn').dataset.word=w.english;
    document.getElementById('review-progress').textContent=(reviewIndex+1)+'/'+reviewWords.length;
}
document.getElementById('review-flashcard').addEventListener('click',()=>document.getElementById('review-flashcard-inner').classList.toggle('flipped'));
async function submitReview(q){
    await fetch('/api/words/'+reviewWords[reviewIndex].id+'/review',{method:'PATCH',headers:H(),body:JSON.stringify({quality:q})});
    if(q>=3)reviewCorrect++;reviewIndex++;showReviewCard();
}

// ========== QUIZ ==========
let quizQ=[],quizI=0,quizC=0,quizA=[];
function initQuizPage(){loadTopics();}
function showQuizSetup(){document.getElementById('quiz-setup').style.display='block';document.getElementById('quiz-area').style.display='none';document.getElementById('quiz-result').style.display='none';}

document.getElementById('btn-start-quiz').addEventListener('click', async()=>{
    const mode=document.getElementById('quiz-mode').value,count=document.getElementById('quiz-count').value;
    const band=document.getElementById('quiz-band').value,topic=document.getElementById('quiz-topic').value;
    const p=new URLSearchParams({mode,count});if(band)p.set('band',band);if(topic)p.set('topic',topic);
    const res=await fetch('/api/quiz/generate?'+p);const data=await res.json();
    if(!res.ok){showToast(data.error,true);return;}
    if(data.questions.length===0){showToast('Savol topilmadi',true);return;}
    quizQ=data.questions;quizI=0;quizC=0;quizA=[];
    document.getElementById('quiz-setup').style.display='none';document.getElementById('quiz-area').style.display='block';document.getElementById('quiz-result').style.display='none';
    showQuizQ();
});

function showQuizQ(){
    if(quizI>=quizQ.length){showQuizResult();return;}
    const q=quizQ[quizI],mode=document.getElementById('quiz-mode').value;
    document.getElementById('quiz-progress').textContent=(quizI+1)+'/'+quizQ.length;
    document.getElementById('quiz-score-display').textContent=quizC+' to\'g\'ri';
    document.getElementById('quiz-feedback').style.display='none';document.getElementById('quiz-next-btn').style.display='none';
    const area=document.getElementById('quiz-question-area');
    if(mode==='multiple_choice'||mode==='reverse'||mode==='collocation'){
        area.innerHTML=`<div class="quiz-question"><p class="quiz-word">${esc(q.question)}</p>
        ${q.hint?'<p class="quiz-hint">'+esc(q.hint)+'</p>':''}
        <button class="btn-speak-small" onclick="speakWord('${esc(q.question)}')" style="margin-bottom:16px;">&#128266;</button>
        <div class="quiz-options">${q.options.map(o=>`<button class="quiz-option" onclick="answerQuiz('${esc(o).replace(/'/g,"\\'")}')">${esc(o)}</button>`).join('')}</div></div>`;
    } else {
        area.innerHTML=`<div class="quiz-question"><p class="quiz-label">${mode==='spelling'?'O\'zbekchasi:':'Bo\'sh joyni to\'ldiring:'}</p>
        <p class="quiz-word ${mode==='fill_blank'?'quiz-fill':''}">${esc(q.question)}</p>
        ${q.hint?'<p class="quiz-hint">'+esc(q.hint)+'</p>':''}
        <input type="text" id="quiz-answer-input" class="quiz-input" placeholder="Javobni yozing..." autocomplete="off">
        <button class="btn-primary" style="max-width:300px;margin:12px auto 0;" onclick="answerQuizText()">Tekshirish</button></div>`;
        setTimeout(()=>{const inp=document.getElementById('quiz-answer-input');if(inp){inp.focus();inp.onkeydown=e=>{if(e.key==='Enter')answerQuizText();};}},100);
    }
}
function answerQuiz(a){processQA(a===quizQ[quizI].correct,a,quizQ[quizI].correct);}
function answerQuizText(){const inp=document.getElementById('quiz-answer-input');if(!inp)return;const a=inp.value.trim();if(!a)return;processQA(a.toLowerCase()===quizQ[quizI].correct.toLowerCase(),a,quizQ[quizI].correct);}
function processQA(correct,ua,ca){
    if(correct)quizC++;quizA.push({correct,ua,ca,q:quizQ[quizI].question});
    const fb=document.getElementById('quiz-feedback');fb.style.display='block';
    fb.className='quiz-feedback '+(correct?'quiz-correct':'quiz-incorrect');
    fb.innerHTML=correct?'To\'g\'ri!':'Noto\'g\'ri! Javob: <strong>'+esc(ca)+'</strong>';
    document.querySelectorAll('.quiz-option').forEach(b=>b.disabled=true);
    const inp=document.getElementById('quiz-answer-input');if(inp)inp.disabled=true;
    document.getElementById('quiz-score-display').textContent=quizC+' to\'g\'ri';
    document.getElementById('quiz-next-btn').style.display='block';
    fetch('/api/study-log',{method:'POST',headers:H(),body:JSON.stringify({action:'quiz',word_id:quizQ[quizI].id,result:correct?'correct':'incorrect',quiz_type:document.getElementById('quiz-mode').value})});
}
document.getElementById('quiz-next-btn').addEventListener('click',()=>{quizI++;showQuizQ();});
function showQuizResult(){
    document.getElementById('quiz-area').style.display='none';document.getElementById('quiz-result').style.display='block';
    const pct=Math.round(quizC/quizQ.length*100);
    document.getElementById('quiz-result-text').textContent=quizQ.length+' dan '+quizC+' ta to\'g\'ri ('+pct+'%)';
    document.getElementById('quiz-result-details').innerHTML=quizA.map((a,i)=>`<div class="quiz-result-row ${a.correct?'correct':'incorrect'}"><span>${i+1}. ${esc(a.q)}</span><span>${a.correct?'&#10003;':esc(a.ua)+' → '+esc(a.ca)}</span></div>`).join('');
}

// ========== PRACTICE ==========
let practiceWords=[],cardIdx=0,correctCnt=0,practiceMode='en-uz';
async function initPractice(){
    const words=await(await fetch('/api/words?limit=100000')).json();const ws=words.words||[];
    const empty=document.getElementById('practice-empty'),area=document.getElementById('practice-area'),done=document.getElementById('practice-done');
    if(ws.length===0){empty.style.display='block';area.style.display='none';done.style.display='none';return;}
    empty.style.display='none';done.style.display='none';area.style.display='block';startPractice(ws);
}
function startPractice(ws){
    if(ws){practiceWords=[...ws].sort((a,b)=>(a.score||0)-(b.score||0)).slice(0,20);for(let i=practiceWords.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[practiceWords[i],practiceWords[j]]=[practiceWords[j],practiceWords[i]];}}
    cardIdx=0;correctCnt=0;showCard();
}
function showCard(){
    if(cardIdx>=practiceWords.length){document.getElementById('practice-area').style.display='none';document.getElementById('practice-done').style.display='block';document.getElementById('practice-result').textContent=practiceWords.length+' dan '+correctCnt+' ta bildingiz!';return;}
    const w=practiceWords[cardIdx];document.getElementById('flashcard-inner').classList.remove('flipped');
    const f=document.getElementById('card-front-word'),b=document.getElementById('card-back-word');
    if(practiceMode==='en-uz'){f.textContent=w.english;b.textContent=w.uzbek;}else{f.textContent=w.uzbek;b.textContent=w.english;}
    document.getElementById('card-synonyms').textContent=w.synonyms?'Sin: '+w.synonyms:'';
    document.getElementById('card-example').textContent=w.example?'"'+w.example+'"':'';
    document.getElementById('practice-speak-btn').dataset.word=practiceMode==='en-uz'?w.english:'';
    document.getElementById('practice-progress').textContent=(cardIdx+1)+'/'+practiceWords.length;
}
document.getElementById('flashcard').addEventListener('click',()=>document.getElementById('flashcard-inner').classList.toggle('flipped'));
document.getElementById('btn-know').addEventListener('click',async()=>{const w=practiceWords[cardIdx];await fetch('/api/words/'+w.id+'/score',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({delta:1})});fetch('/api/study-log',{method:'POST',headers:H(),body:JSON.stringify({action:'practice',word_id:w.id,result:'correct'})});correctCnt++;cardIdx++;showCard();});
document.getElementById('btn-dont-know').addEventListener('click',async()=>{const w=practiceWords[cardIdx];await fetch('/api/words/'+w.id+'/score',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({delta:-1})});fetch('/api/study-log',{method:'POST',headers:H(),body:JSON.stringify({action:'practice',word_id:w.id,result:'incorrect'})});cardIdx++;showCard();});
document.getElementById('btn-restart').addEventListener('click',()=>startPractice());
document.getElementById('btn-practice-again').addEventListener('click',async()=>{document.getElementById('practice-done').style.display='none';document.getElementById('practice-area').style.display='block';await initPractice();});
document.querySelectorAll('.mode-btn').forEach(btn=>{btn.addEventListener('click',async()=>{document.querySelectorAll('.mode-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');practiceMode=btn.dataset.mode;await initPractice();});});

// ========== CHALLENGE ==========
async function loadChallenge() {
    const r = await fetch('/api/challenges/current');
    const ch = await r.json();
    const container = document.getElementById('challenge-content');
    if (!ch) {
        container.innerHTML = `<div class="empty-state"><p>Hozirda aktiv challenge yo'q</p>${isAdmin()?'<button class="btn-primary" style="max-width:300px;margin:16px auto;" onclick="createChallenge()">Challenge yaratish</button>':''}</div>`;
        return;
    }
    const words = ch.words || [];
    const lb = ch.leaderboard || [];
    container.innerHTML = `
        <h2 style="color:#f59e0b;margin-bottom:8px;">${esc(ch.title)}</h2>
        <p style="color:#64748b;margin-bottom:16px;">${ch.start_date} — ${ch.end_date} | ${words.length} ta so'z</p>
        ${isAdmin()?'<button class="btn-small" onclick="createChallenge()" style="margin-bottom:16px;">Yangi challenge</button>':''}
        <div class="challenge-words">${words.map(w=>`<span class="challenge-word-chip">${esc(w.english)} - ${esc(w.uzbek)}</span>`).join('')}</div>
        <button class="btn-primary" style="max-width:300px;margin:16px auto;" onclick="startChallengeQuiz(${ch.id})">Challenge quizni boshlash</button>
        <h3 style="color:#94a3b8;margin:24px 0 12px;">Leaderboard</h3>
        ${lb.length>0?`<table class="users-table"><thead><tr><th>#</th><th>User</th><th>Ball</th><th>Vaqt</th></tr></thead><tbody>${lb.map((l,i)=>`<tr><td>${i+1}</td><td>${esc(l.username)}</td><td>${l.score}/${l.total}</td><td>${l.time_seconds}s</td></tr>`).join('')}</tbody></table>`:'<p style="color:#475569;">Hali hech kim ishtirok etmagan</p>'}
    `;
}

async function createChallenge() {
    const title = prompt('Challenge nomi:', 'Haftalik challenge');
    if (!title) return;
    await fetch('/api/challenges', { method: 'POST', headers: H(), body: JSON.stringify({ title, word_count: 20 }) });
    loadChallenge();
    showToast('Challenge yaratildi!');
}

let challengeId = null;
async function startChallengeQuiz(chId) {
    challengeId = chId;
    const r = await fetch('/api/challenges/current');
    const ch = await r.json();
    if (!ch || !ch.words || ch.words.length < 4) { showToast('Yetarli so\'z yo\'q', true); return; }
    const words = ch.words;
    quizQ = words.map(w => {
        const wrong = words.filter(x => x.id !== w.id).sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.uzbek);
        return { id: w.id, question: w.english, options: [...wrong, w.uzbek].sort(() => Math.random() - 0.5), correct: w.uzbek };
    });
    quizI = 0; quizC = 0; quizA = [];
    // Switch to quiz page
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('quiz-page').classList.add('active');
    document.getElementById('quiz-setup').style.display = 'none';
    document.getElementById('quiz-area').style.display = 'block';
    document.getElementById('quiz-result').style.display = 'none';
    window._challengeStart = Date.now();
    showQuizQ();
}

// Override quiz result to submit challenge score
const _origShowQuizResult = showQuizResult;
showQuizResult = function() {
    _origShowQuizResult();
    if (challengeId) {
        const timeSec = Math.round((Date.now() - (window._challengeStart || Date.now())) / 1000);
        fetch('/api/challenges/' + challengeId + '/submit', { method: 'POST', headers: H(), body: JSON.stringify({ score: quizC, total: quizQ.length, time_seconds: timeSec }) });
        challengeId = null;
    }
};

// ========== READING ==========
async function loadPassages() {
    const passages = await (await fetch('/api/passages')).json();
    const list = document.getElementById('reading-list');
    const detail = document.getElementById('reading-detail');
    detail.style.display = 'none'; list.style.display = 'block';
    if (passages.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>Hali passage qo\'shilmagan</p></div>';
        return;
    }
    list.innerHTML = passages.map(p => `
        <div class="passage-card" onclick="openPassage(${p.id})">
            <h3>${esc(p.title)}</h3>
            <div class="passage-meta">
                ${p.topic ? '<span class="word-topic">' + esc(p.topic) + '</span>' : ''}
                <span class="difficulty-badge diff-${p.difficulty}">${p.difficulty}</span>
            </div>
        </div>
    `).join('');
}

async function openPassage(id) {
    const p = await (await fetch('/api/passages/' + id)).json();
    document.getElementById('reading-list').style.display = 'none';
    const detail = document.getElementById('reading-detail');
    detail.style.display = 'block';
    let questions = [];
    try { questions = JSON.parse(p.questions || '[]'); } catch(e) {}
    detail.innerHTML = `
        <button class="btn-small" onclick="loadPassages()" style="margin-bottom:16px;">&#8592; Orqaga</button>
        <h2 style="color:#60a5fa;margin-bottom:12px;">${esc(p.title)}</h2>
        <div class="passage-content">${esc(p.content).replace(/\n/g, '<br>')}</div>
        ${questions.length > 0 ? `
            <h3 style="color:#94a3b8;margin:24px 0 12px;">Savollar</h3>
            <div id="passage-questions">${questions.map((q, i) => `
                <div class="passage-question">
                    <p><strong>${i + 1}.</strong> ${esc(q.question)}</p>
                    ${q.options ? q.options.map(o => `<button class="quiz-option passage-opt" onclick="checkPassageAnswer(this,'${esc(o).replace(/'/g, "\\'")}','${esc(q.correct).replace(/'/g, "\\'")}')">${esc(o)}</button>`).join('') : ''}
                </div>
            `).join('')}</div>
        ` : ''}
    `;
}

function checkPassageAnswer(btn, answer, correct) {
    const parent = btn.parentElement;
    parent.querySelectorAll('.passage-opt').forEach(b => { b.disabled = true; b.classList.add(b.textContent === correct ? 'opt-correct' : 'opt-wrong'); });
}

document.getElementById('passage-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    let questions = [];
    try { questions = JSON.parse(document.getElementById('p-questions').value || '[]'); } catch(e) {}
    await fetch('/api/passages', { method: 'POST', headers: H(), body: JSON.stringify({
        title: document.getElementById('p-title').value, content: document.getElementById('p-content').value,
        topic: document.getElementById('p-topic').value, difficulty: document.getElementById('p-difficulty').value, questions
    })});
    e.target.reset(); loadPassages(); showToast('Passage qo\'shildi!');
});

// ========== WRITING PRACTICE ==========
let writingWords = [];
async function loadWritingPrompt() {
    const r = await fetch('/api/writing-prompt');
    const data = await r.json();
    if (!data) { document.getElementById('writing-prompt').innerHTML = '<p style="color:#64748b;">Kamida 3 ta so\'z kerak</p>'; return; }
    writingWords = data.words.map(w => w.english.toLowerCase());
    document.getElementById('writing-prompt').innerHTML = `
        <p class="writing-task">${esc(data.prompt)}:</p>
        <div class="writing-word-chips">${data.words.map(w => `<span class="challenge-word-chip">${esc(w.english)} (${esc(w.uzbek)})</span>`).join('')}</div>
    `;
    document.getElementById('writing-input').value = '';
    updateWritingStats();
}

document.getElementById('writing-input').addEventListener('input', updateWritingStats);
function updateWritingStats() {
    const text = document.getElementById('writing-input').value;
    const words = text.split(/\s+/).filter(Boolean);
    const matches = writingWords.filter(w => text.toLowerCase().includes(w));
    document.getElementById('writing-word-count').textContent = words.length + ' so\'z';
    document.getElementById('writing-match-count').textContent = matches.length + '/' + writingWords.length + ' mos';
}
document.getElementById('btn-new-prompt').addEventListener('click', loadWritingPrompt);

// ========== MISTAKES ==========
async function loadMistakes() {
    const mistakes = await (await fetch('/api/mistakes', { headers: H() })).json();
    const container = document.getElementById('mistakes-list');
    if (mistakes.length === 0) { container.innerHTML = '<div class="empty-state"><p>Xatolar hali yo\'q — mashq qiling!</p></div>'; return; }
    container.innerHTML = `<div class="words-grid">${mistakes.map(w => `
        <div class="word-card mistake-card">
            <div class="word-english-wrap"><span class="word-english">${esc(w.english)}</span><button class="btn-speak-small" onclick="speakWord('${esc(w.english)}')">&#128266;</button></div>
            <div class="word-uzbek">${esc(w.uzbek)}</div>
            ${w.attempts ? `<div class="mistake-stats">Urinishlar: ${w.attempts} | Xato: ${w.wrong} (${w.error_rate}%)</div>` : `<div class="mistake-stats">Score: ${w.score}/5</div>`}
        </div>
    `).join('')}</div>`;
}

// ========== STATS ==========
async function loadStats() {
    const s = await (await fetch('/api/stats', { headers: H() })).json();
    document.getElementById('stat-total').textContent = s.total;
    document.getElementById('stat-learned').textContent = s.learned;
    document.getElementById('stat-learning').textContent = s.learning;
    document.getElementById('stat-new').textContent = s.newWords;
    document.getElementById('stat-due').textContent = s.dueForReview;
    document.getElementById('stat-streak').textContent = s.streak + ' kun';
    renderBar('chart-activity', buildWeek(s.dailyActivity), '#3b82f6');
    renderBar('chart-scores', (s.scoreDistribution||[]).map(d=>({label:d.score+'/5',value:d.cnt})), '#8b5cf6');
    renderBar('chart-bands', (s.bandDistribution||[]).map(d=>({label:'B'+d.band,value:d.cnt})), '#f59e0b');
    renderBar('chart-tags', Object.entries(s.tagStats||{}).map(([k,v])=>({label:k,value:v})), '#34d399');
    // Band estimate
    loadBandEstimate();
}

function buildWeek(act) {
    const days=[]; for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const ds=d.toISOString().split('T')[0];
    const dn=['Ya','Du','Se','Ch','Pa','Ju','Sh'];const f=(act||[]).find(a=>a.day===ds);days.push({label:dn[d.getDay()],value:f?f.cnt:0});}return days;
}
function renderBar(id, data, color) {
    const c=document.getElementById(id);if(!c)return;
    if(!data||data.length===0){c.innerHTML='<p style="color:#475569;text-align:center;padding:20px;">—</p>';return;}
    const mx=Math.max(...data.map(d=>d.value),1);
    c.innerHTML=data.map(d=>{const h=Math.max(4,(d.value/mx)*100);return`<div class="bar-item"><div class="bar-value">${d.value}</div><div class="bar" style="height:${h}%;background:${color}"></div><div class="bar-label">${d.label}</div></div>`;}).join('');
}

// ========== BAND ESTIMATE ==========
async function loadBandEstimate() {
    const r = await fetch('/api/band-estimate');
    const d = await r.json();
    const card = document.getElementById('band-estimate-card');
    if (!card || d.band === 0) { if(card) card.innerHTML=''; return; }
    card.innerHTML = `<div class="band-est-inner"><div class="band-est-score">${d.band}</div><div class="band-est-label">Taxminiy Vocabulary Band</div>
    <div class="band-est-bars">${Object.entries(d.details).map(([k,v])=>`<div class="band-est-row"><span>Band ${k.replace('band','')}</span><div class="band-est-bar-bg"><div class="band-est-bar-fill" style="width:${v.pct}%"></div></div><span>${v.pct}%</span></div>`).join('')}</div></div>`;
}

document.getElementById('btn-band-estimate').addEventListener('click', async () => {
    const r = await fetch('/api/band-estimate');
    const d = await r.json();
    const mc = document.getElementById('band-modal-content');
    mc.innerHTML = `<div style="text-align:center;"><div style="font-size:3rem;font-weight:800;color:#f59e0b;">${d.band}</div><p style="color:#94a3b8;margin-bottom:20px;">Taxminiy Vocabulary Band Score</p></div>
    <div>${Object.entries(d.details).map(([k,v])=>`<div class="band-est-row"><span>Band ${k.replace('band','')}</span><div class="band-est-bar-bg"><div class="band-est-bar-fill" style="width:${v.pct}%"></div></div><span>${v.learned}/${v.total} (${v.pct}%)</span></div>`).join('')}</div>
    <p style="color:#475569;font-size:0.8rem;margin-top:16px;text-align:center;">Jami: ${d.total} so'z, O'rgangan: ${d.learned}</p>`;
    document.getElementById('band-modal').style.display = 'flex';
});

// ========== BADGES ==========
async function loadBadges() {
    const badges = await (await fetch('/api/badges', { headers: H() })).json();
    document.getElementById('badges-grid').innerHTML = badges.map(b => `
        <div class="badge-card ${b.earned ? 'earned' : 'locked'}">
            <div class="badge-icon">${String.fromCodePoint(parseInt(b.icon, 16))}</div>
            <div class="badge-name">${esc(b.name)}</div>
            <div class="badge-desc">${esc(b.description)}</div>
            ${b.earned ? '<div class="badge-earned">Olingan!</div>' : ''}
        </div>
    `).join('');
}

// ========== USERS (ADMIN) ==========
async function loadUsers(){if(!isAdmin())return;const users=await(await fetch('/api/users',{headers:H()})).json();
document.getElementById('users-list').innerHTML=`<table class="users-table"><thead><tr><th>ID</th><th>User</th><th>Role</th><th>Sana</th><th>Amal</th></tr></thead><tbody>${users.map(u=>`<tr><td>${u.id}</td><td>${esc(u.username)}</td><td><span class="role-badge role-${u.role}">${u.role}</span></td><td>${u.created_at||''}</td><td>${u.id!==currentUser.id?`<select onchange="changeRole(${u.id},this.value)" class="role-select"><option value="user" ${u.role==='user'?'selected':''}>user</option><option value="admin" ${u.role==='admin'?'selected':''}>admin</option></select>`:'<span style="color:#475569">siz</span>'}</td></tr>`).join('')}</tbody></table>`;}
async function changeRole(uid,role){const r=await fetch('/api/users/'+uid+'/role',{method:'PATCH',headers:H(),body:JSON.stringify({role})});if(!r.ok){showToast((await r.json()).error,true);loadUsers();return;}showToast('O\'zgartirildi!');loadUsers();}

// ========== CSV ==========
document.getElementById('btn-export').addEventListener('click',()=>window.location.href='/api/words/export');
document.getElementById('csv-import').addEventListener('change', async e => {
    const file=e.target.files[0];if(!file)return;const text=await file.text();const lines=text.split('\n').filter(l=>l.trim());
    if(lines.length<2){showToast('Bo\'sh fayl',true);return;}
    const headers=parseCSV(lines[0]);const words=[];
    for(let i=1;i<lines.length;i++){const vals=parseCSV(lines[i]);const w={};headers.forEach((h,idx)=>w[h.trim()]=(vals[idx]||'').trim());if(w.english&&w.uzbek)words.push(w);}
    if(words.length===0){showToast('So\'z topilmadi',true);return;}
    const r=await(await fetch('/api/words/import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({words})})).json();
    showToast(`${r.imported} import, ${r.skipped} o'tkazildi`);loadWords(1);loadTopics();e.target.value='';
});
function parseCSV(line){const r=[];let c='',q=false;for(let i=0;i<line.length;i++){const ch=line[i];if(q){if(ch==='"'&&line[i+1]==='"'){c+='"';i++;}else if(ch==='"')q=false;else c+=ch;}else{if(ch==='"')q=true;else if(ch===','){r.push(c);c='';}else c+=ch;}}r.push(c);return r;}

// ========== INIT ==========
if (authToken && currentUser) {
    fetch('/api/auth/me', { headers: H() }).then(r => { if (r.ok) showMainApp(); else logout(); }).catch(() => logout());
} else { showAuthPage(); }
