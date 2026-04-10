import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 1. КОНФІГУРАЦІЯ FIREBASE (Твої ключі)
const firebaseConfig = {
  apiKey: "AIzaSyBRlTtULChSV0V8JlCRgzICqH6rR5neg4Y",
  authDomain: "animegensyua.firebaseapp.com",
  projectId: "animegensyua",
  storageBucket: "animegensyua.firebasestorage.app",
  messagingSenderId: "39273223584",
  appId: "1:39273223584:web:802054de3c260ed76440c5",
  measurementId: "G-ML2DDWLJ1E"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Елементи інтерфейсу (Авторизація)
const authBtn = document.getElementById('auth-btn');
const authModal = document.getElementById('auth-modal');
const closeModal = document.querySelector('.close-modal');
const profileBlock = document.getElementById('profile-block');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');

// --- ЛОГІКА АВТОРИЗАЦІЇ ---

if (authBtn) authBtn.onclick = () => authModal.style.display = "flex";
if (closeModal) closeModal.onclick = () => authModal.style.display = "none";

// Вхід через Google
const btnGoogle = document.getElementById('btn-google');
if (btnGoogle) {
    btnGoogle.onclick = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            authModal.style.display = "none";
        } catch (error) {
            console.error("Google Auth Error:", error);
        }
    };
}

// Вихід
if (logoutBtn) {
    logoutBtn.onclick = (e) => {
        e.preventDefault();
        signOut(auth);
    };
}

// Стан користувача (Зберігається при перезавантаженні)
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (authBtn) authBtn.style.display = "none";
        if (profileBlock) profileBlock.style.display = "flex";
        if (userName) userName.innerText = user.displayName || user.email.split('@')[0];
        if (userAvatar) userAvatar.src = user.photoURL || "https://via.placeholder.com/35";
    } else {
        if (authBtn) authBtn.style.display = "block";
        if (profileBlock) profileBlock.style.display = "none";
    }
});

// Функція для збереження профілю
const saveBtn = document.getElementById('save-profile-btn');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const fileInput = document.getElementById('avatar-file-input');
        const newName = document.getElementById('display-name-input').value;
        const status = document.getElementById('save-status');
        
        // !!! ВСТАВ СВІЙ КЛЮЧ ТУТ !!!
        const IMGBB_API_KEY = '639434d76b34da4071bc50f6a9171a3e'; 

        try {
            let photoURL = user.photoURL;

            // Якщо вибрано новий файл — вантажимо на ImgBB
            if (fileInput && fileInput.files[0]) {
                const formData = new FormData();
                formData.append('image', fileInput.files[0]);

                const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                    method: 'POST',
                    body: formData
                });

                const imgbbData = await imgbbResponse.json();
                if (imgbbData.success) {
                    photoURL = imgbbData.data.url;
                } else {
                    throw new Error("ImgBB upload failed");
                }
            }

            // Оновлюємо Firebase профіль
            await updateProfile(user, {
                displayName: newName,
                photoURL: photoURL
            });

            // Зберігаємо біо в LocalStorage
            const bioText = document.getElementById('bio-input').value;
            localStorage.setItem(`bio_${user.uid}`, bioText);

            if (status) status.style.display = "block";
            alert("Зміни збережено!");
            location.reload(); 

        } catch (error) {
            console.error("Помилка оновлення:", error);
            alert("Сталася помилка при збереженні.");
        }
    };
}

// Чекаємо завантаження сторінки

// Заповнення полів даними при завантаженні сторінки профілю
onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname.includes('profile.html')) {
        document.getElementById('display-name-input').value = user.displayName || "";
        document.getElementById('avatar-url-input').value = user.photoURL || "";
        document.getElementById('edit-avatar-preview').src = user.photoURL || "https://via.placeholder.com/100?text=?";
        
        const savedBio = localStorage.getItem(`bio_${user.uid}`);
        if (savedBio) document.getElementById('bio-input').value = savedBio;
    }
});

onAuthStateChanged(auth, (user) => {
    const adminLink = document.querySelector('a[href="admin.html"]'); // Шукаємо посилання в меню
    const ADMIN_UID = "1mkKuWCJ5gQGOglP5L5JI5ueiB62";

    if (user && user.uid === ADMIN_UID) {
        if (adminLink) adminLink.style.display = "block"; // Показуємо адмінку тільки тобі
    } else {
        if (adminLink) adminLink.style.display = "none";  // Ховаємо від усіх інших
    }
    
    // ... твій інший код відображення імені та аватара
});

// --- ЛОГІКА ВИСУВНОГО МЕНЮ ПО КЛІКУ ---


// --- ЛОГІКА КОНТЕНТУ (Твій код) ---

// 1. ЗАВАНТАЖЕННЯ ГОЛОВНОЇ СІТКИ (Index Page)
async function loadMainGrid() {
    const grid = document.getElementById('main-anime-grid');
    if (!grid) return; 

    try {
        const response = await fetch('/api/anime');
        const data = await response.json();
        grid.innerHTML = ''; 

        if (data.length === 0) {
            grid.innerHTML = '<p style="color: #777; grid-column: 1/-1; text-align: center;">База порожня.</p>';
            return;
        }

        data.forEach((anime) => {
            const card = document.createElement('div');
            card.className = 'anime-card';
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
        console.error("Помилка завантаження сітки:", error);
    }
}

// 2. ЗАВАНТАЖЕННЯ СТОРІНКИ АНІМЕ (Anime Page)
async function loadAnimePage() {
    const params = new URLSearchParams(window.location.search);
    const animeId = params.get('id');
    const episodesGrid = document.getElementById('episodes-list');
    if (!animeId || !episodesGrid) return;

    try {
        const response = await fetch('/api/anime');
        const data = await response.json();
        const anime = data.find(item => item.id == animeId);

        if (!anime) {
            document.getElementById('anime-title').innerText = "Аніме не знайдено";
            return;
        }

        document.getElementById('anime-title').innerText = anime.title;
        document.getElementById('anime-genres').innerText = anime.genres;
        document.getElementById('anime-poster').src = anime.posterUrl || anime.image;
        document.getElementById('anime-description').innerText = anime.description || 'Опис відсутній';

        const player = document.getElementById('main-player');
        let episodesArray = [];

        // Парсимо серії
        if (typeof anime.playerUrl === 'string') {
            try {
                episodesArray = JSON.parse(anime.playerUrl);
            } catch(e) {
                episodesArray = [{ nr: 1, url: anime.playerUrl }];
            }
        } else if (Array.isArray(anime.playerUrl)) {
            episodesArray = anime.playerUrl;
        }

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

        if (episodesArray.length > 0 && player) player.src = episodesArray[0].url;

    } catch (error) {
        console.error("Помилка сторінки аніме:", error);
    }
}

// 3. ПОШУК
const searchInput = document.getElementById('anime-search');
if (searchInput) {
    searchInput.addEventListener('input', async (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length < 2) return;

        try {
            const response = await fetch('/api/anime');
            const data = await response.json();
            const filtered = data.filter(a => a.title.toLowerCase().includes(query));
            console.log("Знайдено:", filtered.length);
        } catch (err) {
            console.error("Помилка пошуку:", err);
        }
    });
}

// Залиш ТІЛЬКИ ЦЕЙ блок для меню в кінці script.js
document.addEventListener('DOMContentLoaded', () => {
    const profileBtn = document.querySelector('.profile-preview');
    const dropdown = document.querySelector('.dropdown-content');

    if (profileBtn && dropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }
});

// Функція керування меню
const initDropdown = () => {
    const profileBtn = document.querySelector('.profile-preview');
    const dropdown = document.querySelector('.dropdown-content');

    if (profileBtn && dropdown) {
        // Очищуємо старі обробники, щоб не було дублів
        profileBtn.onclick = null;

        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Клік по профілю!"); // Для перевірки в консолі (F12)
            dropdown.classList.toggle('show');
        });

        // Закриття при кліку поза меню
        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    } else {
        console.log("Елементи меню не знайдено на цій сторінці");
    }
};

// Запускаємо відразу і при зміні стану авторизації
document.addEventListener('DOMContentLoaded', initDropdown);
// Додай цей виклик також всередину onAuthStateChanged(auth, (user) => { ... })
// щоб меню працювало після того, як юзер залогінився

// ЗАПУСК ПРИ ЗАВАНТАЖЕННІ
document.addEventListener('DOMContentLoaded', () => {
    loadMainGrid();
    loadAnimePage();
});