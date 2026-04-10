const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Render автоматично призначає порт через змінну оточення PORT
const PORT = process.env.PORT || 3000;

// Дозволяємо серверу роздавати статичні файли (html, css, js) з поточної папки
app.use(express.static(__dirname));
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'animeData.json');

// Функція для безпечного читання даних
function readData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            // Якщо файлу бази даних немає, створюємо його з порожнім масивом
            fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
            return [];
        }
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (error) {
        console.error("Помилка при читанні JSON:", error);
        return [];
    }
}

// Функція для запису даних
function saveData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Помилка при записі JSON:", error);
    }
}

// Головна сторінка (щоб Render знав, що показувати першим)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Отримати всі аніме
app.get('/api/anime', (req, res) => {
    const data = readData();
    res.json(data);
});

// Отримати одне конкретне аніме за ID
app.get('/api/anime/:id', (req, res) => {
    const data = readData();
    const anime = data.find(a => a.id == req.params.id);
    if (anime) {
        res.json(anime);
    } else {
        res.status(404).json({ error: "Аніме не знайдено" });
    }
});

// Додати нове аніме через адмінку
app.post('/api/add-anime', (req, res) => {
    try {
        const data = readData();
        const newAnime = {
            id: Date.now(), // Унікальний ID на основі часу
            title: req.body.title || "Без назви",
            ...req.body
        };
        data.push(newAnime);
        saveData(data);
        res.status(201).json({ success: true, anime: newAnime });
    } catch (error) {
        res.status(500).json({ error: "Не вдалося зберегти дані" });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер працює на порту ${PORT}`);
});