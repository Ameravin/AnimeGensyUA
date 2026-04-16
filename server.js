const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "animeData.json");

app.use(express.json());
app.use(express.static(PUBLIC_DIR));

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf8");
    }
  } catch (error) {
    console.error("Помилка створення data/animeData.json:", error);
  }
}

function readData() {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Помилка при читанні JSON:", error);
    return [];
  }
}

function saveData(data) {
  try {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Помилка при записі JSON:", error);
  }
}

// Pages
app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

app.get("/anime-page.html", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "anime-page.html"));
});

app.get("/profile.html", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "profile.html"));
});

app.get("/admin.html", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "admin.html"));
});

// API
app.get("/api/anime", (req, res) => {
  res.json(readData());
});

app.get("/api/anime/:id", (req, res) => {
  const data = readData();
  const anime = data.find((item) => String(item.id) === String(req.params.id));

  if (!anime) {
    return res.status(404).json({ error: "Аніме не знайдено" });
  }

  res.json(anime);
});

app.post("/api/add-anime", (req, res) => {
  try {
    const data = readData();

    const newAnime = {
      id: Date.now(),
      title: req.body.title || "Без назви",
      ...req.body
    };

    data.push(newAnime);
    saveData(data);

    res.status(201).json({ success: true, anime: newAnime });
  } catch (error) {
    console.error("Помилка додавання аніме:", error);
    res.status(500).json({ error: "Не вдалося зберегти дані" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер працює на порту ${PORT}`);
});