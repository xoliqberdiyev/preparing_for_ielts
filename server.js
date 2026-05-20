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

    // Users jadvali
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

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

// Auth middleware
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token talab qilinadi' });
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Yaroqsiz token' });
    }
}

function adminOnly(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Faqat admin uchun' });
    }
    next();
}

// Register
app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username va password shart' });
    }
    if (username.length < 3 || password.length < 4) {
        return res.status(400).json({ error: 'Username kamida 3, password kamida 4 belgi' });
    }

    const existing = db.exec('SELECT id FROM users WHERE LOWER(username) = LOWER(?)', [username.trim()]);
    if (existing.length > 0 && existing[0].values.length > 0) {
        return res.status(409).json({ error: 'Bu username allaqachon band' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Birinchi user admin bo'ladi
    const userCount = db.exec('SELECT COUNT(*) FROM users');
    const count = userCount.length > 0 ? userCount[0].values[0][0] : 0;
    const role = count === 0 ? 'admin' : 'user';

    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username.trim(), hashedPassword, role]);
    saveDb();

    const newUser = queryRows('SELECT id, username, role FROM users WHERE username = ?', [username.trim()]);
    const user = newUser[0];
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username va password shart' });
    }

    const users = queryRows('SELECT * FROM users WHERE LOWER(username) = LOWER(?)', [username.trim()]);
    if (users.length === 0) {
        return res.status(401).json({ error: 'Username yoki password noto\'g\'ri' });
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return res.status(401).json({ error: 'Username yoki password noto\'g\'ri' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// Joriy foydalanuvchi ma'lumotlari
app.get('/api/auth/me', authMiddleware, (req, res) => {
    res.json({ user: req.user });
});

// Barcha userlarni olish (faqat admin)
app.get('/api/users', authMiddleware, adminOnly, (req, res) => {
    const users = queryRows('SELECT id, username, role, created_at FROM users ORDER BY id');
    res.json(users);
});

// User rolini o'zgartirish (faqat admin)
app.patch('/api/users/:id/role', authMiddleware, adminOnly, (req, res) => {
    const { role } = req.body;
    const userId = parseInt(req.params.id);
    if (!role || !['admin', 'user'].includes(role)) {
        return res.status(400).json({ error: 'Role faqat "admin" yoki "user" bo\'lishi mumkin' });
    }
    if (userId === req.user.id) {
        return res.status(400).json({ error: 'O\'zingizning rolingizni o\'zgartira olmaysiz' });
    }
    const existing = queryRows('SELECT id FROM users WHERE id = ?', [userId]);
    if (existing.length === 0) {
        return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }
    db.run('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    saveDb();
    res.json({ success: true });
});

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

// So'zni o'chirish (faqat admin)
app.delete('/api/words/:id', authMiddleware, adminOnly, (req, res) => {
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
