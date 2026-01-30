const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// ===== EXPRESS SETUP =====
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ===== DATABASE SETUP =====
const dbPath = path.join(__dirname, 'game.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeDatabase();
    }
});

// ===== CREATE TABLE IF NOT EXISTS =====
function initializeDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            score INTEGER NOT NULL,
            moves INTEGER NOT NULL,
            time INTEGER NOT NULL,
            difficulty TEXT DEFAULT 'normal',
            deviceType TEXT,
            deviceOS TEXT,
            browser TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err);
        } else {
            console.log('✅ Scores table ready');
        }
    });
}

// ===== API ENDPOINTS =====

// GET all scores (sorted by score, highest first)
app.get('/api/scores', (req, res) => {
    db.all(
        'SELECT id, name, score, moves, time, difficulty, created_at FROM scores ORDER BY score DESC LIMIT 10',
        (err, rows) => {
            if (err) {
                console.error('Error fetching scores:', err);
                res.status(500).json({ error: 'Database error' });
            } else {
                res.json(rows);
            }
        }
    );
});

// POST new score
app.post('/api/scores', (req, res) => {
    const { name, score, moves, time, difficulty } = req.body;

    // Validate input
    if (!name || score === undefined || moves === undefined || time === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    db.run(
        'INSERT INTO scores (name, score, moves, time, difficulty) VALUES (?, ?, ?, ?, ?)',
        [name, score, moves, time, difficulty || 'normal'],
        function(err) {
            if (err) {
                console.error('Error inserting score:', err);
                res.status(500).json({ error: 'Failed to save score' });
            } else {
                res.status(201).json({
                    id: this.lastID,
                    name,
                    score,
                    moves,
                    time,
                    difficulty
                });
            }
        }
    );
});

// GET score by ID
app.get('/api/scores/:id', (req, res) => {
    const { id } = req.params;

    db.get(
        'SELECT * FROM scores WHERE id = ?',
        [id],
        (err, row) => {
            if (err) {
                res.status(500).json({ error: 'Database error' });
            } else if (!row) {
                res.status(404).json({ error: 'Score not found' });
            } else {
                res.json(row);
            }
        }
    );
});

// DELETE score by ID
app.delete('/api/scores/:id', (req, res) => {
    const { id } = req.params;

    db.run(
        'DELETE FROM scores WHERE id = ?',
        [id],
        function(err) {
            if (err) {
                res.status(500).json({ error: 'Database error' });
            } else if (this.changes === 0) {
                res.status(404).json({ error: 'Score not found' });
            } else {
                res.json({ message: 'Score deleted successfully' });
            }
        }
    );
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running!' });
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log(`🎮 Memory Game Server is running on http://localhost:${PORT}`);
    console.log(`📊 Scores endpoint: http://localhost:${PORT}/api/scores`);
});

// ===== GRACEFUL SHUTDOWN =====
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('✅ Database connection closed');
        }
        process.exit(0);
    });
});
