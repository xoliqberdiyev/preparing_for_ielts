const express = require('express');
const path = require('path');
const initSqlJs = require('sql.js');
const fs = require('fs');

const app = express();
const PORT = parseInt(process.env.PORT) || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'words.db');

app.use(express.json());
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

    db.run(`
        CREATE TABLE IF NOT EXISTS words (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            english TEXT NOT NULL,
            uzbek TEXT NOT NULL,
            synonyms TEXT DEFAULT '',
            example TEXT DEFAULT '',
            topic TEXT DEFAULT '',
            tags TEXT DEFAULT '',
            score INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Eski jadvalga yangi ustunlar qo'shish (agar mavjud bo'lmasa)
    try { db.run('ALTER TABLE words ADD COLUMN topic TEXT DEFAULT ""'); } catch(e) {}
    try { db.run('ALTER TABLE words ADD COLUMN tags TEXT DEFAULT ""'); } catch(e) {}

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

// So'zlarni olish (pagination + filter)
app.get('/api/words', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 40;
    const search = (req.query.search || '').trim();
    const topic = (req.query.topic || '').trim();
    const tag = (req.query.tag || '').trim();
    const sort = (req.query.sort || '').trim();
    const offset = (page - 1) * limit;

    let where = [];
    let params = [];

    if (search) {
        where.push("(english LIKE ? OR uzbek LIKE ?)");
        params.push('%' + search + '%', '%' + search + '%');
    }
    if (topic) {
        where.push("topic = ?");
        params.push(topic);
    }
    if (tag) {
        where.push("(',' || tags || ',' LIKE ?)");
        params.push('%,' + tag + ',%');
    }

    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    // Sorting
    const sortMap = {
        'az': 'english ASC',
        'za': 'english DESC',
        'newest': 'created_at DESC',
        'oldest': 'created_at ASC',
        'score_high': 'score DESC',
        'score_low': 'score ASC'
    };
    const orderBy = sortMap[sort] || 'created_at DESC';

    // Jami son
    const countResult = db.exec('SELECT COUNT(*) as cnt FROM words ' + whereClause, params);
    const total = countResult.length > 0 ? countResult[0].values[0][0] : 0;

    // So'zlar
    const words = queryRows(
        'SELECT * FROM words ' + whereClause + ' ORDER BY ' + orderBy + ' LIMIT ? OFFSET ?',
        [...params, limit, offset]
    );

    res.json({ words, total, page, limit, totalPages: Math.ceil(total / limit) });
});

// Barcha topiclarni olish
app.get('/api/topics', (req, res) => {
    const rows = db.exec("SELECT DISTINCT topic FROM words WHERE topic != '' AND topic IS NOT NULL ORDER BY topic");
    if (rows.length === 0) return res.json([]);
    res.json(rows[0].values.map(r => r[0]));
});

// So'z mavjudligini tekshirish
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

// Yangi so'z qo'shish
app.post('/api/words', (req, res) => {
    const { english, uzbek, synonyms, example, topic, tags } = req.body;
    if (!english || !uzbek) {
        return res.status(400).json({ error: 'english va uzbek maydonlari shart' });
    }

    // Duplikat tekshirish
    const existing = db.exec('SELECT id FROM words WHERE LOWER(english) = LOWER(?)', [english.trim()]);
    if (existing.length > 0 && existing[0].values.length > 0) {
        return res.status(409).json({ error: 'Bu so\'z allaqachon mavjud: ' + english.trim() });
    }

    db.run(
        'INSERT INTO words (english, uzbek, synonyms, example, topic, tags) VALUES (?, ?, ?, ?, ?, ?)',
        [english.trim(), uzbek.trim(), (synonyms || '').trim(), (example || '').trim(), (topic || '').trim(), (tags || '').trim()]
    );
    saveDb();

    const rows = db.exec('SELECT * FROM words ORDER BY id DESC LIMIT 1');
    const columns = rows[0].columns;
    const word = {};
    columns.forEach((col, i) => word[col] = rows[0].values[0][i]);

    res.status(201).json(word);
});

// So'zni yangilash
app.put('/api/words/:id', (req, res) => {
    const { id } = req.params;
    const { english, uzbek, synonyms, example, topic, tags } = req.body;
    if (!english || !uzbek) {
        return res.status(400).json({ error: 'english va uzbek maydonlari shart' });
    }

    db.run(
        'UPDATE words SET english = ?, uzbek = ?, synonyms = ?, example = ?, topic = ?, tags = ? WHERE id = ?',
        [english.trim(), uzbek.trim(), (synonyms || '').trim(), (example || '').trim(), (topic || '').trim(), (tags || '').trim(), id]
    );
    saveDb();
    res.json({ success: true });
});

// So'zni o'chirish
app.delete('/api/words/:id', (req, res) => {
    db.run('DELETE FROM words WHERE id = ?', [req.params.id]);
    saveDb();
    res.json({ success: true });
});

// Score yangilash
app.patch('/api/words/:id/score', (req, res) => {
    const { delta } = req.body;
    db.run(
        'UPDATE words SET score = MAX(0, MIN(5, score + ?)) WHERE id = ?',
        [delta, req.params.id]
    );
    saveDb();
    res.json({ success: true });
});

initDb().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server ishga tushdi: http://0.0.0.0:${PORT}`);
    });
});
