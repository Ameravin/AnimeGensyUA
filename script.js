// 1. ЗАВАНТАЖЕННЯ ГОЛОВНОЇ СІТКИ (Index Page)
async function loadMainGrid() {
    try {
        const response = await fetch('/api/anime');
        const data = await response.json();
        const grid = document.getElementById('main-anime-grid');
        
        if (!grid) return; 
        grid.innerHTML = ''; 

        if (data.length === 0) {
            grid.innerHTML = '<p style="color: #777; grid-column: 1/-1; text-align: center;">База порожня.</p>';
            return;
        }

        data.forEach((anime) => {
            const card = document.createElement('div');
            card.className = 'anime-card';
            
            // ФІКС: використовуємо posterUrl або image, якщо першого немає
            const poster = anime.posterUrl || anime.image || 'https://via.placeholder.com/200x300';
            
            card.innerHTML = `
                <a href="anime-page.html?id=${anime.id}" class="card-link">
                    <div class="poster">
                        <img src="${poster}" alt="${anime.title}">
                        <div class="episodes-badge">${anime.episodes || '?'} серій</div>
                    </div>
                    <div class="info">
                        <div class="title">${anime.title}</div>
                        <div class="meta">${anime.genres || 'Жанри не вказані'}</div>
                    </div>
                </a>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error("Помилка завантаження головної сторінки:", error);
    }
}

// 2. ЗАВАНТАЖЕННЯ СТОРІНКИ АНІМЕ (Anime Page)
async function loadAnimePage() {
    const params = new URLSearchParams(window.location.search);
    const animeId = params.get('id');
    const episodesGrid = document.getElementById('episodes-list');
    if (!animeId || !episodesGrid) return;

    try {
        // Отримуємо всі аніме і шукаємо потрібне (або через окремий API, якщо він є)
        const response = await fetch('/api/anime');
        const data = await response.json();
        const anime = data.find(item => item.id == animeId);

        if (!anime) {
            document.getElementById('anime-title').innerText = "Аніме не знайдено";
            return;
        }

        // Заповнюємо дані
        document.getElementById('anime-title').innerText = anime.title;
        document.getElementById('anime-genres').innerText = anime.genres;
        document.getElementById('anime-poster').src = anime.posterUrl || anime.image;
        document.getElementById('anime-year').innerText = anime.year || '2020';
        document.getElementById('anime-studio').innerText = anime.studio || 'Невідомо';
        document.getElementById('anime-description').innerText = anime.description || 'Опис відсутній';

        const player = document.getElementById('main-player');
        
        // Обробка серій (якщо playerUrl це масив або рядок)
        let episodesArray = [];
        if (typeof anime.playerUrl === 'string') {
            try {
                episodesArray = JSON.parse(anime.playerUrl);
            } catch(e) {
                episodesArray = [{ nr: 1, url: anime.playerUrl }];
            }
        } else if (Array.isArray(anime.playerUrl)) {
            episodesArray = anime.playerUrl;
        }

        // Виведення кнопок серій
        episodesGrid.innerHTML = '';
        episodesArray.forEach((ep, index) => {
            const btn = document.createElement('button');
            btn.className = 'ep-btn';
            btn.innerText = `${ep.nr || index + 1} серія`;
            btn.onclick = () => {
                player.src = ep.url;
                document.querySelectorAll('.ep-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            };
            episodesGrid.appendChild(btn);
        });

        // Перша серія в плеєр за замовчуванням
        if (episodesArray.length > 0) player.src = episodesArray[0].url;

    } catch (error) {
        console.error("Помилка:", error);
    }
}

// 3. ПОШУК (Фікс для випадаючого списку)
const searchInput = document.getElementById('anime-search');
if (searchInput) {
    searchInput.addEventListener('input', async (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length < 2) return;

        const response = await fetch('/api/anime');
        const data = await response.json();
        const filtered = data.filter(a => a.title.toLowerCase().includes(query));
        
        console.log("Знайдено аніме:", filtered.length);
        // Тут можна додати малювання випадаючого списку, якщо він є в HTML
    });
}

// ЗАПУСК
document.addEventListener('DOMContentLoaded', () => {
    loadMainGrid();
    loadAnimePage();
});