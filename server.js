const express = require('express');
const path = require('path');
const initSqlJs = require('sql.js');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = parseInt(process.env.PORT) || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'words.db');
const JWT_SECRET = process.env.JWT_SECRET || 'ielts-app-secret-key-2024';

app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

let db;

async function initDb() {
    const SQL = await initSqlJs();
    if (fs.existsSync(DB_PATH)) {
        const buffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
    } else {
        db = new SQL.Database();
    }

    db.run(`CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        english TEXT NOT NULL, uzbek TEXT NOT NULL,
        synonyms TEXT DEFAULT '', example TEXT DEFAULT '',
        topic TEXT DEFAULT '', tags TEXT DEFAULT '',
        word_forms TEXT DEFAULT '', collocations TEXT DEFAULT '',
        band TEXT DEFAULT '', score INTEGER DEFAULT 0,
        next_review TEXT DEFAULT '', review_interval INTEGER DEFAULT 0,
        ease_factor REAL DEFAULT 2.5,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Migrate columns
    const addCol = (col, def) => { try { db.run(`ALTER TABLE words ADD COLUMN ${col} ${def}`); } catch(e) {} };
    addCol('topic', 'TEXT DEFAULT ""');
    addCol('tags', 'TEXT DEFAULT ""');
    addCol('word_forms', 'TEXT DEFAULT ""');
    addCol('collocations', 'TEXT DEFAULT ""');
    addCol('band', 'TEXT DEFAULT ""');
    addCol('next_review', 'TEXT DEFAULT ""');
    addCol('review_interval', 'INTEGER DEFAULT 0');
    addCol('ease_factor', 'REAL DEFAULT 2.5');

    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE, password TEXT NOT NULL,
        role TEXT DEFAULT 'user', created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS study_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER, action TEXT NOT NULL, word_id INTEGER,
        result TEXT, quiz_type TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    try { db.run('ALTER TABLE study_logs ADD COLUMN quiz_type TEXT DEFAULT ""'); } catch(e) {}

    db.run(`CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL, word_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, word_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS user_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL, word_id INTEGER NOT NULL,
        note TEXT DEFAULT '', mnemonic TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, word_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS reading_passages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL, content TEXT NOT NULL,
        topic TEXT DEFAULT '', difficulty TEXT DEFAULT 'medium',
        questions TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS weekly_challenges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL, word_ids TEXT NOT NULL,
        start_date TEXT NOT NULL, end_date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS challenge_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL, challenge_id INTEGER NOT NULL,
        score INTEGER DEFAULT 0, total INTEGER DEFAULT 0,
        time_seconds INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, challenge_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL, description TEXT DEFAULT '',
        icon TEXT DEFAULT '', condition_type TEXT NOT NULL,
        condition_value INTEGER DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS user_badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL, badge_id INTEGER NOT NULL,
        earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, badge_id)
    )`);

    // Seed badges
    const badgeCount = db.exec('SELECT COUNT(*) FROM badges');
    if (badgeCount[0].values[0][0] === 0) {
        const badges = [
            ['Birinchi qadam', 'Birinchi so\'zni qo\'shing', '1f4d6', 'words_added', 1],
            ['So\'z yig\'uvchi', '10 ta so\'z qo\'shing', '1f4da', 'words_added', 10],
            ['Lug\'at ustasi', '50 ta so\'z qo\'shing', '1f4d6', 'words_added', 50],
            ['So\'z imperatori', '200 ta so\'z qo\'shing', '1f451', 'words_added', 200],
            ['Mashqchi', '10 ta mashq bajaring', '1f3cb', 'practices', 10],
            ['Quiz yulduzi', '10 ta quiz bajaring', '2b50', 'quizzes', 10],
            ['Streak boshlovchi', '3 kunlik streak', '1f525', 'streak', 3],
            ['Streak ustasi', '7 kunlik streak', '1f525', 'streak', 7],
            ['Streak legenda', '30 kunlik streak', '1f525', 'streak', 30],
            ['O\'rgangan 10', '10 ta so\'zni o\'rganing (score 4+)', '2705', 'learned', 10],
            ['O\'rgangan 50', '50 ta so\'zni o\'rganing', '1f393', 'learned', 50],
            ['Takrorlovchi', '50 ta takrorlash bajaring', '1f504', 'reviews', 50],
            ['Band 7 yo\'lida', '20 ta Band 7 so\'z o\'rganing', '1f4aa', 'band7_learned', 20],
            ['Challenge g\'olib', 'Haftalik challengeda ishtirok eting', '1f3c6', 'challenges', 1],
        ];
        badges.forEach(b => {
            db.run('INSERT INTO badges (name, description, icon, condition_type, condition_value) VALUES (?,?,?,?,?)', b);
        });
    }

    saveDb();
}

function saveDb() {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function queryRows(sql, params) {
    const rows = db.exec(sql, params);
    if (rows.length === 0) return [];
    const columns = rows[0].columns;
    return rows[0].values.map(row => {
        const obj = {};
        columns.forEach((col, i) => obj[col] = row[i]);
        return obj;
    });
}

function todayStr() { return new Date().toISOString().split('T')[0]; }

function getCount(sql, params) {
    const r = db.exec(sql, params || []);
    return r.length > 0 ? r[0].values[0][0] : 0;
}

// ========== AUTH ==========
function authMiddleware(req, res, next) {
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ error: 'Token talab qilinadi' });
    try { req.user = jwt.verify(h.split(' ')[1], JWT_SECRET); next(); }
    catch(e) { return res.status(401).json({ error: 'Yaroqsiz token' }); }
}

function optionalAuth(req, res, next) {
    const h = req.headers.authorization;
    if (h && h.startsWith('Bearer ')) {
        try { req.user = jwt.verify(h.split(' ')[1], JWT_SECRET); } catch(e) {}
    }
    next();
}

function adminOnly(req, res, next) {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Faqat admin uchun' });
    next();
}

// Check & award badges
function checkBadges(userId) {
    const allBadges = queryRows('SELECT * FROM badges');
    const earned = queryRows('SELECT badge_id FROM user_badges WHERE user_id = ?', [userId]);
    const earnedIds = new Set(earned.map(e => e.badge_id));
    const newBadges = [];

    for (const badge of allBadges) {
        if (earnedIds.has(badge.id)) continue;
        let met = false;
        switch (badge.condition_type) {
            case 'words_added':
                met = getCount('SELECT COUNT(*) FROM words') >= badge.condition_value;
                break;
            case 'practices':
                met = getCount("SELECT COUNT(*) FROM study_logs WHERE user_id=? AND action='practice'", [userId]) >= badge.condition_value;
                break;
            case 'quizzes':
                met = getCount("SELECT COUNT(DISTINCT created_at) FROM study_logs WHERE user_id=? AND action='quiz'", [userId]) >= badge.condition_value;
                break;
            case 'streak': {
                let streak = 0;
                let d = new Date();
                while (true) {
                    const ds = d.toISOString().split('T')[0];
                    const has = getCount("SELECT COUNT(*) FROM study_logs WHERE user_id=? AND DATE(created_at)=?", [userId, ds]);
                    if (has > 0) { streak++; d.setDate(d.getDate() - 1); }
                    else if (ds === todayStr()) { d.setDate(d.getDate() - 1); }
                    else break;
                }
                met = streak >= badge.condition_value;
                break;
            }
            case 'learned':
                met = getCount('SELECT COUNT(*) FROM words WHERE score >= 4') >= badge.condition_value;
                break;
            case 'reviews':
                met = getCount("SELECT COUNT(*) FROM study_logs WHERE user_id=? AND action='review'", [userId]) >= badge.condition_value;
                break;
            case 'band7_learned':
                met = getCount("SELECT COUNT(*) FROM words WHERE band='7' AND score >= 4") >= badge.condition_value;
                break;
            case 'challenges':
                met = getCount("SELECT COUNT(*) FROM challenge_scores WHERE user_id=?", [userId]) >= badge.condition_value;
                break;
        }
        if (met) {
            db.run('INSERT OR IGNORE INTO user_badges (user_id, badge_id) VALUES (?,?)', [userId, badge.id]);
            newBadges.push(badge);
        }
    }
    if (newBadges.length > 0) saveDb();
    return newBadges;
}

// ========== AUTH ROUTES ==========
app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username va password shart' });
    if (username.length < 3 || password.length < 4) return res.status(400).json({ error: 'Username kamida 3, password kamida 4 belgi' });
    const existing = db.exec('SELECT id FROM users WHERE LOWER(username) = LOWER(?)', [username.trim()]);
    if (existing.length > 0 && existing[0].values.length > 0) return res.status(409).json({ error: 'Bu username band' });
    const hashed = await bcrypt.hash(password, 10);
    const count = getCount('SELECT COUNT(*) FROM users');
    const role = count === 0 ? 'admin' : 'user';
    db.run('INSERT INTO users (username, password, role) VALUES (?,?,?)', [username.trim(), hashed, role]);
    saveDb();
    const user = queryRows('SELECT id, username, role FROM users WHERE username = ?', [username.trim()])[0];
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username va password shart' });
    const users = queryRows('SELECT * FROM users WHERE LOWER(username) = LOWER(?)', [username.trim()]);
    if (users.length === 0) return res.status(401).json({ error: 'Username yoki password noto\'g\'ri' });
    const user = users[0];
    if (!(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Username yoki password noto\'g\'ri' });
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

app.get('/api/auth/me', authMiddleware, (req, res) => res.json({ user: req.user }));

// ========== USERS ==========
app.get('/api/users', authMiddleware, adminOnly, (req, res) => {
    res.json(queryRows('SELECT id, username, role, created_at FROM users ORDER BY id'));
});

app.patch('/api/users/:id/role', authMiddleware, adminOnly, (req, res) => {
    const { role } = req.body;
    const userId = parseInt(req.params.id);
    if (!['admin', 'user'].includes(role)) return res.status(400).json({ error: 'Yaroqsiz role' });
    if (userId === req.user.id) return res.status(400).json({ error: 'O\'zingizni o\'zgartira olmaysiz' });
    db.run('UPDATE users SET role=? WHERE id=?', [role, userId]);
    saveDb();
    res.json({ success: true });
});

// ========== WORDS CRUD ==========
app.get('/api/words', optionalAuth, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 40;
    const search = (req.query.search || '').trim();
    const topic = (req.query.topic || '').trim();
    const tag = (req.query.tag || '').trim();
    const sort = (req.query.sort || '').trim();
    const band = (req.query.band || '').trim();
    const favOnly = req.query.favorites === '1' && req.user;
    const offset = (page - 1) * limit;

    let where = [], params = [];
    if (search) { where.push("(english LIKE ? OR uzbek LIKE ?)"); params.push('%'+search+'%', '%'+search+'%'); }
    if (topic) { where.push("topic = ?"); params.push(topic); }
    if (tag) { where.push("(',' || tags || ',' LIKE ?)"); params.push('%,'+tag+',%'); }
    if (band) { where.push("band = ?"); params.push(band); }
    if (favOnly) { where.push("id IN (SELECT word_id FROM favorites WHERE user_id = ?)"); params.push(req.user.id); }

    const wc = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';
    const sortMap = { 'az':'english ASC','za':'english DESC','newest':'created_at DESC','oldest':'created_at ASC','score_high':'score DESC','score_low':'score ASC' };
    const orderBy = sortMap[sort] || 'created_at DESC';
    const total = getCount('SELECT COUNT(*) FROM words ' + wc, params);
    const words = queryRows('SELECT * FROM words ' + wc + ' ORDER BY ' + orderBy + ' LIMIT ? OFFSET ?', [...params, limit, offset]);
    res.json({ words, total, page, limit, totalPages: Math.ceil(total / limit) });
});

app.get('/api/topics', (req, res) => {
    const rows = db.exec("SELECT DISTINCT topic FROM words WHERE topic != '' AND topic IS NOT NULL ORDER BY topic");
    res.json(rows.length === 0 ? [] : rows[0].values.map(r => r[0]));
});

app.get('/api/words/check', (req, res) => {
    const word = (req.query.word || '').trim();
    if (!word) return res.json({ exists: false });
    const rows = db.exec('SELECT id, english, uzbek FROM words WHERE LOWER(english) = LOWER(?)', [word]);
    if (rows.length > 0 && rows[0].values.length > 0) {
        const [id, english, uzbek] = rows[0].values[0];
        return res.json({ exists: true, word: { id, english, uzbek } });
    }
    res.json({ exists: false });
});

app.post('/api/words', (req, res) => {
    const { english, uzbek, synonyms, example, topic, tags, word_forms, collocations, band } = req.body;
    if (!english || !uzbek) return res.status(400).json({ error: 'english va uzbek shart' });
    const existing = db.exec('SELECT id FROM words WHERE LOWER(english) = LOWER(?)', [english.trim()]);
    if (existing.length > 0 && existing[0].values.length > 0) return res.status(409).json({ error: 'Bu so\'z mavjud: ' + english.trim() });
    db.run('INSERT INTO words (english,uzbek,synonyms,example,topic,tags,word_forms,collocations,band) VALUES (?,?,?,?,?,?,?,?,?)',
        [english.trim(), uzbek.trim(), (synonyms||'').trim(), (example||'').trim(), (topic||'').trim(), (tags||'').trim(), (word_forms||'').trim(), (collocations||'').trim(), (band||'').trim()]);
    saveDb();
    const rows = db.exec('SELECT * FROM words ORDER BY id DESC LIMIT 1');
    const word = {};
    rows[0].columns.forEach((col, i) => word[col] = rows[0].values[0][i]);
    res.status(201).json(word);
});

app.put('/api/words/:id', (req, res) => {
    const { english, uzbek, synonyms, example, topic, tags, word_forms, collocations, band } = req.body;
    if (!english || !uzbek) return res.status(400).json({ error: 'english va uzbek shart' });
    db.run('UPDATE words SET english=?,uzbek=?,synonyms=?,example=?,topic=?,tags=?,word_forms=?,collocations=?,band=? WHERE id=?',
        [english.trim(), uzbek.trim(), (synonyms||'').trim(), (example||'').trim(), (topic||'').trim(), (tags||'').trim(), (word_forms||'').trim(), (collocations||'').trim(), (band||'').trim(), req.params.id]);
    saveDb();
    res.json({ success: true });
});

app.delete('/api/words/:id', authMiddleware, adminOnly, (req, res) => {
    db.run('DELETE FROM words WHERE id=?', [req.params.id]);
    saveDb();
    res.json({ success: true });
});

app.patch('/api/words/:id/score', (req, res) => {
    db.run('UPDATE words SET score = MAX(0, MIN(5, score + ?)) WHERE id=?', [req.body.delta, req.params.id]);
    saveDb();
    res.json({ success: true });
});

// ========== FAVORITES ==========
app.get('/api/favorites', authMiddleware, (req, res) => {
    const favs = queryRows('SELECT word_id FROM favorites WHERE user_id=?', [req.user.id]);
    res.json(favs.map(f => f.word_id));
});

app.post('/api/favorites/:wordId', authMiddleware, (req, res) => {
    db.run('INSERT OR IGNORE INTO favorites (user_id, word_id) VALUES (?,?)', [req.user.id, parseInt(req.params.wordId)]);
    saveDb();
    res.json({ success: true });
});

app.delete('/api/favorites/:wordId', authMiddleware, (req, res) => {
    db.run('DELETE FROM favorites WHERE user_id=? AND word_id=?', [req.user.id, parseInt(req.params.wordId)]);
    saveDb();
    res.json({ success: true });
});

// ========== PERSONAL NOTES ==========
app.get('/api/notes', authMiddleware, (req, res) => {
    res.json(queryRows('SELECT * FROM user_notes WHERE user_id=?', [req.user.id]));
});

app.put('/api/notes/:wordId', authMiddleware, (req, res) => {
    const { note, mnemonic } = req.body;
    const wid = parseInt(req.params.wordId);
    const existing = queryRows('SELECT id FROM user_notes WHERE user_id=? AND word_id=?', [req.user.id, wid]);
    if (existing.length > 0) {
        db.run('UPDATE user_notes SET note=?, mnemonic=? WHERE user_id=? AND word_id=?', [(note||'').trim(), (mnemonic||'').trim(), req.user.id, wid]);
    } else {
        db.run('INSERT INTO user_notes (user_id, word_id, note, mnemonic) VALUES (?,?,?,?)', [req.user.id, wid, (note||'').trim(), (mnemonic||'').trim()]);
    }
    saveDb();
    res.json({ success: true });
});

// ========== SPACED REPETITION ==========
app.get('/api/words/review', (req, res) => {
    const today = todayStr();
    res.json(queryRows("SELECT * FROM words WHERE next_review <= ? OR next_review = '' OR next_review IS NULL ORDER BY ease_factor ASC, score ASC LIMIT 20", [today]));
});

app.patch('/api/words/:id/review', optionalAuth, (req, res) => {
    const q = Math.max(0, Math.min(5, parseInt(req.body.quality) || 0));
    const id = req.params.id;
    const rows = queryRows('SELECT review_interval, ease_factor FROM words WHERE id=?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Topilmadi' });
    let { review_interval: interval, ease_factor: ef } = rows[0];
    interval = interval || 0; ef = ef || 2.5;
    if (q >= 3) { interval = interval === 0 ? 1 : interval === 1 ? 6 : Math.round(interval * ef); }
    else { interval = 1; }
    ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (ef < 1.3) ef = 1.3;
    const nextReview = new Date(); nextReview.setDate(nextReview.getDate() + interval);
    const nrs = nextReview.toISOString().split('T')[0];
    db.run('UPDATE words SET review_interval=?, ease_factor=?, next_review=?, score=MAX(0,MIN(5,score+?)) WHERE id=?', [interval, ef, nrs, q >= 3 ? 1 : -1, id]);
    saveDb();
    if (req.user) { db.run('INSERT INTO study_logs (user_id,action,word_id,result) VALUES (?,?,?,?)', [req.user.id, 'review', parseInt(id), q >= 3 ? 'correct' : 'incorrect']); saveDb(); }
    res.json({ success: true, next_review: nrs, interval, ease_factor: ef });
});

// ========== WORD OF THE DAY ==========
app.get('/api/word-of-day', (req, res) => {
    const today = todayStr();
    // Deterministic: use date as seed
    const seed = today.replace(/-/g, '');
    const total = getCount('SELECT COUNT(*) FROM words');
    if (total === 0) return res.json(null);
    const idx = parseInt(seed) % total;
    const words = queryRows('SELECT * FROM words LIMIT 1 OFFSET ?', [idx]);
    res.json(words.length > 0 ? words[0] : null);
});

// ========== QUIZ ==========
app.get('/api/quiz/generate', (req, res) => {
    const mode = req.query.mode || 'multiple_choice';
    const count = Math.min(parseInt(req.query.count) || 10, 50);
    const band = (req.query.band || '').trim();
    const topic = (req.query.topic || '').trim();
    let where = [], params = [];
    if (band) { where.push("band=?"); params.push(band); }
    if (topic) { where.push("topic=?"); params.push(topic); }
    const wc = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';
    const allWords = queryRows('SELECT * FROM words ' + wc + ' ORDER BY RANDOM()', params);
    if (allWords.length < 4) return res.status(400).json({ error: 'Kamida 4 ta so\'z kerak' });

    const questions = [];
    const quizWords = allWords.slice(0, count);
    for (const word of quizWords) {
        if (mode === 'multiple_choice') {
            const wrong = allWords.filter(w => w.id !== word.id).sort(() => Math.random() - 0.5).slice(0, 3).map(w => w.uzbek);
            const options = [...wrong, word.uzbek].sort(() => Math.random() - 0.5);
            questions.push({ id: word.id, question: word.english, options, correct: word.uzbek, example: word.example || '' });
        } else if (mode === 'fill_blank' && word.example) {
            const blank = word.example.replace(new RegExp(word.english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '______');
            if (blank !== word.example) questions.push({ id: word.id, question: blank, hint: word.uzbek, correct: word.english });
        } else if (mode === 'spelling') {
            questions.push({ id: word.id, question: word.uzbek, hint: word.english.charAt(0) + '...', correct: word.english });
        } else if (mode === 'collocation') {
            if (word.collocations) {
                const colls = word.collocations.split(',').map(c => c.trim()).filter(Boolean);
                if (colls.length > 0) {
                    const wrongColls = allWords.filter(w => w.id !== word.id && w.collocations).sort(() => Math.random() - 0.5).slice(0, 3).map(w => w.collocations.split(',')[0].trim());
                    const correct = colls[0];
                    const options = [...wrongColls, correct].filter(Boolean).sort(() => Math.random() - 0.5);
                    if (options.length >= 2) questions.push({ id: word.id, question: word.english, options, correct, hint: word.uzbek });
                }
            }
        } else if (mode === 'reverse') {
            const wrong = allWords.filter(w => w.id !== word.id).sort(() => Math.random() - 0.5).slice(0, 3).map(w => w.english);
            const options = [...wrong, word.english].sort(() => Math.random() - 0.5);
            questions.push({ id: word.id, question: word.uzbek, options, correct: word.english });
        }
    }
    res.json({ mode, questions: questions.slice(0, count) });
});

// ========== MOCK TEST ==========
app.get('/api/mock-test/generate', (req, res) => {
    const count = Math.min(parseInt(req.query.count) || 30, 100);
    const band = (req.query.band || '').trim();
    let where = [], params = [];
    if (band) { where.push("band=?"); params.push(band); }
    const wc = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';
    const allWords = queryRows('SELECT * FROM words ' + wc + ' ORDER BY RANDOM()', params);
    if (allWords.length < 4) return res.status(400).json({ error: 'Kamida 4 ta so\'z kerak' });

    const questions = [];
    const modes = ['en_uz', 'uz_en', 'spelling'];
    const testWords = allWords.slice(0, count);
    for (let i = 0; i < testWords.length; i++) {
        const word = testWords[i];
        const mode = modes[i % modes.length];
        if (mode === 'en_uz') {
            const wrong = allWords.filter(w => w.id !== word.id).sort(() => Math.random() - 0.5).slice(0, 3).map(w => w.uzbek);
            questions.push({ id: word.id, type: 'en_uz', question: word.english, options: [...wrong, word.uzbek].sort(() => Math.random() - 0.5), correct: word.uzbek });
        } else if (mode === 'uz_en') {
            const wrong = allWords.filter(w => w.id !== word.id).sort(() => Math.random() - 0.5).slice(0, 3).map(w => w.english);
            questions.push({ id: word.id, type: 'uz_en', question: word.uzbek, options: [...wrong, word.english].sort(() => Math.random() - 0.5), correct: word.english });
        } else {
            questions.push({ id: word.id, type: 'spelling', question: word.uzbek, hint: word.english.charAt(0) + '...' + word.english.charAt(word.english.length - 1), correct: word.english });
        }
    }
    res.json({ questions, timeLimit: count * 30 }); // 30 sec per question
});

// ========== BAND ESTIMATOR ==========
app.get('/api/band-estimate', (req, res) => {
    const total = getCount('SELECT COUNT(*) FROM words');
    if (total === 0) return res.json({ band: 0, details: {} });
    const learned = getCount('SELECT COUNT(*) FROM words WHERE score >= 4');
    const b5 = getCount("SELECT COUNT(*) FROM words WHERE band='5' AND score >= 3");
    const b6 = getCount("SELECT COUNT(*) FROM words WHERE band='6' AND score >= 3");
    const b7 = getCount("SELECT COUNT(*) FROM words WHERE band='7' AND score >= 3");
    const b8 = getCount("SELECT COUNT(*) FROM words WHERE band='8+' AND score >= 3");
    const t5 = getCount("SELECT COUNT(*) FROM words WHERE band='5'") || 1;
    const t6 = getCount("SELECT COUNT(*) FROM words WHERE band='6'") || 1;
    const t7 = getCount("SELECT COUNT(*) FROM words WHERE band='7'") || 1;
    const t8 = getCount("SELECT COUNT(*) FROM words WHERE band='8+'") || 1;

    let estimatedBand = 4;
    if (b5 / t5 >= 0.6) estimatedBand = 5;
    if (b5 / t5 >= 0.8 && b6 / t6 >= 0.5) estimatedBand = 5.5;
    if (b6 / t6 >= 0.7) estimatedBand = 6;
    if (b6 / t6 >= 0.8 && b7 / t7 >= 0.4) estimatedBand = 6.5;
    if (b7 / t7 >= 0.6) estimatedBand = 7;
    if (b7 / t7 >= 0.8 && b8 / t8 >= 0.3) estimatedBand = 7.5;
    if (b8 / t8 >= 0.6) estimatedBand = 8;

    res.json({
        band: estimatedBand, total, learned,
        details: {
            band5: { learned: b5, total: t5, pct: Math.round(b5/t5*100) },
            band6: { learned: b6, total: t6, pct: Math.round(b6/t6*100) },
            band7: { learned: b7, total: t7, pct: Math.round(b7/t7*100) },
            band8: { learned: b8, total: t8, pct: Math.round(b8/t8*100) },
        }
    });
});

// ========== MISTAKES ==========
app.get('/api/mistakes', optionalAuth, (req, res) => {
    const userId = req.user ? req.user.id : null;
    let weakWords;
    if (userId) {
        weakWords = queryRows(`
            SELECT w.*, COUNT(*) as attempts,
            SUM(CASE WHEN sl.result='incorrect' THEN 1 ELSE 0 END) as wrong,
            ROUND(SUM(CASE WHEN sl.result='incorrect' THEN 1.0 ELSE 0 END) / COUNT(*) * 100) as error_rate
            FROM study_logs sl JOIN words w ON w.id = sl.word_id
            WHERE sl.user_id=? AND sl.word_id IS NOT NULL
            GROUP BY sl.word_id HAVING wrong > 0
            ORDER BY error_rate DESC, wrong DESC LIMIT 30`, [userId]);
    } else {
        weakWords = queryRows('SELECT * FROM words WHERE score <= 1 ORDER BY score ASC LIMIT 30');
    }
    res.json(weakWords);
});

// ========== READING PASSAGES ==========
app.get('/api/passages', (req, res) => {
    res.json(queryRows('SELECT id, title, topic, difficulty, created_at FROM reading_passages ORDER BY created_at DESC'));
});

app.get('/api/passages/:id', (req, res) => {
    const p = queryRows('SELECT * FROM reading_passages WHERE id=?', [req.params.id]);
    if (p.length === 0) return res.status(404).json({ error: 'Topilmadi' });
    res.json(p[0]);
});

app.post('/api/passages', authMiddleware, adminOnly, (req, res) => {
    const { title, content, topic, difficulty, questions } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title va content shart' });
    db.run('INSERT INTO reading_passages (title,content,topic,difficulty,questions) VALUES (?,?,?,?,?)',
        [title.trim(), content.trim(), (topic||'').trim(), difficulty || 'medium', JSON.stringify(questions || [])]);
    saveDb();
    res.status(201).json({ success: true });
});

// ========== WEEKLY CHALLENGES ==========
app.get('/api/challenges', (req, res) => {
    const today = todayStr();
    res.json(queryRows('SELECT * FROM weekly_challenges ORDER BY start_date DESC LIMIT 10'));
});

app.get('/api/challenges/current', (req, res) => {
    const today = todayStr();
    const ch = queryRows('SELECT * FROM weekly_challenges WHERE start_date <= ? AND end_date >= ? LIMIT 1', [today, today]);
    if (ch.length === 0) return res.json(null);
    const challenge = ch[0];
    const wordIds = JSON.parse(challenge.word_ids || '[]');
    const words = wordIds.length > 0 ? queryRows('SELECT * FROM words WHERE id IN (' + wordIds.join(',') + ')') : [];
    const leaderboard = queryRows('SELECT cs.*, u.username FROM challenge_scores cs JOIN users u ON u.id = cs.user_id WHERE cs.challenge_id=? ORDER BY cs.score DESC, cs.time_seconds ASC LIMIT 20', [challenge.id]);
    res.json({ ...challenge, words, leaderboard });
});

app.post('/api/challenges', authMiddleware, adminOnly, (req, res) => {
    const { title, word_count } = req.body;
    const count = Math.min(parseInt(word_count) || 20, 50);
    const wordIds = queryRows('SELECT id FROM words ORDER BY RANDOM() LIMIT ?', [count]).map(w => w.id);
    if (wordIds.length < 4) return res.status(400).json({ error: 'Yetarli so\'z yo\'q' });
    const start = todayStr();
    const end = new Date(); end.setDate(end.getDate() + 7);
    db.run('INSERT INTO weekly_challenges (title,word_ids,start_date,end_date) VALUES (?,?,?,?)',
        [(title || 'Haftalik challenge').trim(), JSON.stringify(wordIds), start, end.toISOString().split('T')[0]]);
    saveDb();
    res.status(201).json({ success: true });
});

app.post('/api/challenges/:id/submit', authMiddleware, (req, res) => {
    const { score, total, time_seconds } = req.body;
    const chId = parseInt(req.params.id);
    const existing = queryRows('SELECT id FROM challenge_scores WHERE user_id=? AND challenge_id=?', [req.user.id, chId]);
    if (existing.length > 0) {
        db.run('UPDATE challenge_scores SET score=?, total=?, time_seconds=? WHERE user_id=? AND challenge_id=?',
            [score, total, time_seconds || 0, req.user.id, chId]);
    } else {
        db.run('INSERT INTO challenge_scores (user_id,challenge_id,score,total,time_seconds) VALUES (?,?,?,?,?)',
            [req.user.id, chId, score, total, time_seconds || 0]);
    }
    saveDb();
    checkBadges(req.user.id);
    res.json({ success: true });
});

// ========== BADGES ==========
app.get('/api/badges', authMiddleware, (req, res) => {
    checkBadges(req.user.id);
    const all = queryRows('SELECT * FROM badges ORDER BY id');
    const earned = queryRows('SELECT badge_id, earned_at FROM user_badges WHERE user_id=?', [req.user.id]);
    const earnedMap = {};
    earned.forEach(e => earnedMap[e.badge_id] = e.earned_at);
    res.json(all.map(b => ({ ...b, earned: !!earnedMap[b.id], earned_at: earnedMap[b.id] || null })));
});

// ========== WRITING PRACTICE ==========
app.get('/api/writing-prompt', (req, res) => {
    const words = queryRows('SELECT english, uzbek FROM words ORDER BY RANDOM() LIMIT 5');
    if (words.length < 3) return res.json(null);
    const topics = ['Education', 'Environment', 'Technology', 'Health', 'Society', 'Culture', 'Economy', 'Travel', 'Media', 'Crime'];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const prompts = [
        `"${topic}" mavzusida quyidagi so'zlarni ishlatib 3-5 jumla yozing`,
        `Quyidagi so'zlarni ishlatib "${topic}" haqida qisqa paragraph yozing`,
        `"${topic}" mavzusida IELTS Writing Task 2 uslubida quyidagi so'zlar bilan javob yozing`,
    ];
    res.json({ prompt: prompts[Math.floor(Math.random() * prompts.length)], words, topic });
});

// ========== STATISTICS ==========
app.get('/api/stats', optionalAuth, (req, res) => {
    const total = getCount('SELECT COUNT(*) FROM words');
    const learned = getCount('SELECT COUNT(*) FROM words WHERE score >= 4');
    const learning = getCount('SELECT COUNT(*) FROM words WHERE score > 0 AND score < 4');
    const newWords = getCount('SELECT COUNT(*) FROM words WHERE score = 0');
    const dueForReview = getCount("SELECT COUNT(*) FROM words WHERE next_review <= ? AND next_review != '' AND next_review IS NOT NULL", [todayStr()]);
    const bandDist = queryRows("SELECT band, COUNT(*) as cnt FROM words WHERE band != '' GROUP BY band ORDER BY band");
    const topicDist = queryRows("SELECT topic, COUNT(*) as cnt FROM words WHERE topic != '' GROUP BY topic ORDER BY cnt DESC LIMIT 10");
    const tagStats = { speaking: 0, listening: 0, reading: 0, writing: 0 };
    queryRows("SELECT tags FROM words WHERE tags != ''").forEach(r => {
        (r.tags || '').split(',').forEach(t => { t = t.trim(); if (tagStats.hasOwnProperty(t)) tagStats[t]++; });
    });
    const scoreDist = queryRows('SELECT score, COUNT(*) as cnt FROM words GROUP BY score ORDER BY score');

    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const dailyActivity = queryRows("SELECT DATE(created_at) as day, COUNT(*) as cnt, SUM(CASE WHEN result='correct' THEN 1 ELSE 0 END) as correct FROM study_logs WHERE created_at >= ? GROUP BY DATE(created_at) ORDER BY day", [weekAgo.toISOString().split('T')[0]]);

    let streak = 0;
    let checkDate = new Date();
    while (true) {
        const ds = checkDate.toISOString().split('T')[0];
        const has = getCount("SELECT COUNT(*) FROM study_logs WHERE DATE(created_at) = ?", [ds]);
        if (has > 0) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
        else if (ds === todayStr()) { checkDate.setDate(checkDate.getDate() - 1); }
        else break;
    }

    res.json({ total, learned, learning, newWords, dueForReview, bandDistribution: bandDist, topicDistribution: topicDist, tagStats, scoreDistribution: scoreDist, dailyActivity, streak });
});

// ========== CSV ==========
app.get('/api/words/export', (req, res) => {
    const words = queryRows('SELECT * FROM words ORDER BY id');
    const headers = ['english','uzbek','synonyms','example','topic','tags','word_forms','collocations','band','score'];
    const csvRows = [headers.join(',')];
    words.forEach(w => csvRows.push(headers.map(h => '"' + (w[h]||'').toString().replace(/"/g,'""') + '"').join(',')));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=ielts_words.csv');
    res.send('\uFEFF' + csvRows.join('\n'));
});

app.post('/api/words/import', (req, res) => {
    const { words } = req.body;
    if (!Array.isArray(words) || words.length === 0) return res.status(400).json({ error: 'Bo\'sh' });
    let imported = 0, skipped = 0;
    for (const w of words) {
        if (!w.english || !w.uzbek) { skipped++; continue; }
        const existing = db.exec('SELECT id FROM words WHERE LOWER(english) = LOWER(?)', [w.english.trim()]);
        if (existing.length > 0 && existing[0].values.length > 0) { skipped++; continue; }
        db.run('INSERT INTO words (english,uzbek,synonyms,example,topic,tags,word_forms,collocations,band) VALUES (?,?,?,?,?,?,?,?,?)',
            [w.english.trim(), w.uzbek.trim(), (w.synonyms||'').trim(), (w.example||'').trim(), (w.topic||'').trim(), (w.tags||'').trim(), (w.word_forms||'').trim(), (w.collocations||'').trim(), (w.band||'').trim()]);
        imported++;
    }
    saveDb();
    res.json({ imported, skipped, total: words.length });
});

// ========== STUDY LOG ==========
app.post('/api/study-log', optionalAuth, (req, res) => {
    const { action, word_id, result, quiz_type } = req.body;
    const userId = req.user ? req.user.id : null;
    db.run('INSERT INTO study_logs (user_id,action,word_id,result,quiz_type) VALUES (?,?,?,?,?)',
        [userId, action || 'practice', word_id || null, result || '', quiz_type || '']);
    saveDb();
    if (userId) {
        const newBadges = checkBadges(userId);
        return res.json({ success: true, newBadges: newBadges.map(b => b.name) });
    }
    res.json({ success: true });
});

initDb().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server ishga tushdi: http://0.0.0.0:${PORT}`);
    });
});
