# Memory Game Backend

Node.js Express server voor de Memory Game

## Installatie

```bash
npm install
```

## Starten

```bash
npm start
```

Server draait op `http://localhost:3000`

## API Endpoints

### GET /api/scores
Haal alle scores op (max 10, gesorteerd op hoogte)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Jan",
    "score": 100,
    "moves": 15,
    "time": 45
  }
]
```

### POST /api/scores
Sla een nieuw score op

**Request Body:**
```json
{
  "name": "Jan",
  "score": 100,
  "moves": 15,
  "time": 45
}
```

### GET /api/scores/:id
Haal een specifieke score op

### DELETE /api/scores/:id
Verwijder een score

### GET /api/health
Health check

## Database

SQLite database wordt automatisch aangemaakt: `game.db`

**Tabel: scores**
- id (PRIMARY KEY)
- name (TEXT)
- score (INTEGER)
- moves (INTEGER)
- time (INTEGER)
- created_at (DATETIME)
