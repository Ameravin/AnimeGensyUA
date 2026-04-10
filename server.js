const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.static(__dirname));
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'animeData.json');

// Читання даних
function readData() {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE);
    return JSON.parse(raw);
}

// Запис даних
function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Геттер для всіх аніме (те, що викликає головна сторінка)
app.get('/api/anime', (req, res) => {
    const data = readData();
    res.json(data);
});

// Геттер для одного аніме (для сторінки перегляду)
app.get('/api/anime/:id', (req, res) => {
    const data = readData();
    const anime = data.find(a => a.id == req.params.id);
    if (anime) res.json(anime);
    else res.status(404).send("Not found");
});

// Додавання аніме через адмінку
app.post('/api/add-anime', (req, res) => {
    const data = readData();
    const newAnime = {
        id: Date.now(), // Створюємо унікальний ID
        ...req.body
    };
    data.push(newAnime);
    saveData(data);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущено: http://localhost:${PORT}`);
});