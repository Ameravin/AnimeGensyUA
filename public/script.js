import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// =========================
// FIREBASE CONFIG
// =========================
const firebaseConfig = {
  apiKey: "AIzaSyBRlTtULChSV0V8JlCRgzICqH6rR5neg4Y",
  authDomain: "animegensyua.firebaseapp.com",
  projectId: "animegensyua",
  storageBucket: "animegensyua.firebasestorage.app",
  messagingSenderId: "39273223584",
  appId: "1:39273223584:web:802054de3c260ed76440c5",
  measurementId: "G-ML2DDWLJ1E"
};

const ADMIN_UID = "1mkKuWCJ5gQGOglP5L5JI5ueiB62";
const IMGBB_API_KEY = "639434d76b34da4071bc50f6a9171a3e";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// =========================
// HELPERS
// =========================
function $(selector, root = document) {
  return root.querySelector(selector);
}

function $all(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function getCurrentPage() {
  return window.location.pathname.split("/").pop() || "index.html";
}

function isProfilePage() {
  return getCurrentPage().includes("profile.html");
}

function isAnimePage() {
  return getCurrentPage().includes("anime-page.html");
}

function safeName(user) {
  return user?.displayName || user?.email?.split("@")[0] || "Користувач";
}

function getSavedBio(uid) {
  return localStorage.getItem(`bio_${uid}`) || "";
}

function setSavedBio(uid, value) {
  localStorage.setItem(`bio_${uid}`, value || "");
}

function getAnimeTitle(anime) {
  return anime?.title_ua || anime?.title || anime?.title_native || "Без назви";
}

function getAnimeGenres(anime) {
  return anime?.genres_ua || anime?.genres || "Жанри не вказані";
}

function getAnimeDescription(anime) {
  return anime?.description_ua || anime?.description || "Опис відсутній";
}

function getAnimeStudio(anime) {
  return anime?.studio_ua || anime?.studio || "";
}

// =========================
// AUTH MODAL
// =========================
function bindAuthModal() {
  const authBtn = $("#auth-btn");
  const authModal = $("#auth-modal");
  const closeModal = $(".close-modal");
  const btnGoogle = $("#btn-google");

  if (authBtn && authModal) {
    authBtn.addEventListener("click", () => {
      authModal.style.display = "flex";
    });
  }

  if (closeModal && authModal) {
    closeModal.addEventListener("click", () => {
      authModal.style.display = "none";
    });
  }

  if (authModal) {
    authModal.addEventListener("click", (e) => {
      if (e.target === authModal) authModal.style.display = "none";
    });
  }

  if (btnGoogle) {
    btnGoogle.addEventListener("click", async () => {
      try {
        await signInWithPopup(auth, googleProvider);
        if (authModal) authModal.style.display = "none";
      } catch (error) {
        console.error("Google Auth Error:", error);
        alert("Не вдалося увійти через Google.");
      }
    });
  }
}

function bindLogout() {
  const logoutBtn = $("#logout-btn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  });
}

// =========================
// DROPDOWN
// =========================
let dropdownBound = false;

function closeAllDropdowns() {
  $all(".dropdown-content").forEach((menu) => menu.classList.remove("show"));
}

function bindDropdowns() {
  if (dropdownBound) return;

  const profileBlocks = $all(".profile-preview");
  if (!profileBlocks.length) return;

  dropdownBound = true;

  profileBlocks.forEach((profileBtn) => {
    const dropdown = $(".dropdown-content", profileBtn);
    if (!dropdown) return;

    profileBtn.addEventListener("click", (e) => {
      if (e.target.closest(".dropdown-content a")) return;

      e.preventDefault();
      e.stopPropagation();

      const isOpen = dropdown.classList.contains("show");
      closeAllDropdowns();
      if (!isOpen) dropdown.classList.add("show");
    });
  });

  document.addEventListener("click", () => {
    closeAllDropdowns();
  });
}

// =========================
// AUTH UI
// =========================
function renderAuthUI(user) {
  const authBtn = $("#auth-btn");
  const profileBlock = $("#profile-block");
  const adminLinks = $all('a[href="admin.html"]');
  const userAvatarTargets = $all("#user-avatar, .profile-preview img.avatar");
  const userNameTargets = $all("#user-name, .profile-preview .username");

  if (user) {
    if (authBtn) authBtn.style.display = "none";
    if (profileBlock) profileBlock.style.display = "flex";

    const name = safeName(user);
    userNameTargets.forEach((el) => (el.textContent = name));
    userAvatarTargets.forEach((el) => {
      el.src = user.photoURL || "https://via.placeholder.com/35";
    });
  } else {
    if (authBtn) authBtn.style.display = "block";
    if (profileBlock) profileBlock.style.display = "none";

    userNameTargets.forEach((el) => (el.textContent = "Профіль"));
    userAvatarTargets.forEach((el) => {
      el.src = "https://via.placeholder.com/35";
    });
  }

  adminLinks.forEach((link) => {
    link.style.display = user && user.uid === ADMIN_UID ? "block" : "none";
  });
}

// =========================
// PROFILE PAGE
// =========================
function renderProfilePage(user) {
  if (!isProfilePage()) return;

  const profileTitle = $("#profile-title-name");
  const infoDisplayName = $("#info-display-name");
  const infoBioDisplay = $("#info-bio-display");
  const avatarPreview = $("#edit-avatar-preview");
  const displayNameInput = $("#display-name-input");
  const bioInput = $("#bio-input");
  const statusIndicator = $(".status-indicator");

  if (!user) {
    if (profileTitle) profileTitle.textContent = "Гість";
    if (infoDisplayName) infoDisplayName.textContent = "Гість";
    if (infoBioDisplay) infoBioDisplay.textContent = "Увійдіть, щоб редагувати профіль.";
    if (avatarPreview) avatarPreview.src = "https://via.placeholder.com/100?text=?";
    if (displayNameInput) displayNameInput.value = "";
    if (bioInput) bioInput.value = "";
    if (statusIndicator) statusIndicator.textContent = "OFFLINE";
    return;
  }

  const name = safeName(user);
  const bio = getSavedBio(user.uid);

  if (profileTitle) profileTitle.textContent = name;
  if (infoDisplayName) infoDisplayName.textContent = name;
  if (infoBioDisplay) infoBioDisplay.textContent = bio || "Напишіть щось про себе...";
  if (avatarPreview) avatarPreview.src = user.photoURL || "https://via.placeholder.com/100?text=?";
  if (displayNameInput) displayNameInput.value = user.displayName || "";
  if (bioInput) bioInput.value = bio;
  if (statusIndicator) statusIndicator.textContent = "ОНЛАЙН";
}

function bindProfileEditor() {
  const toggleBtn = $("#toggle-edit-btn");
  const editSection = $("#edit-section");
  const avatarFileInput = $("#avatar-file-input");
  const avatarPreview = $("#edit-avatar-preview");
  const saveBtn = $("#save-profile-btn");
  const bioInput = $("#bio-input");
  const displayNameInput = $("#display-name-input");
  const saveStatus = $("#save-status");

  if (toggleBtn && editSection) {
    toggleBtn.addEventListener("click", () => {
      editSection.style.display =
        getComputedStyle(editSection).display === "none" ? "block" : "none";
    });
  }

  if (avatarFileInput && avatarPreview) {
    avatarFileInput.addEventListener("change", () => {
      const file = avatarFileInput.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        avatarPreview.src = e.target?.result || avatarPreview.src;
      };
      reader.readAsDataURL(file);
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      const user = auth.currentUser;
      if (!user) {
        alert("Спочатку увійдіть у акаунт.");
        return;
      }

      const newName = displayNameInput ? displayNameInput.value.trim() : "";
      const newBio = bioInput ? bioInput.value.trim() : "";
      const file = avatarFileInput?.files?.[0] || null;

      try {
        let photoURL = user.photoURL || "";

        if (file) {
          const formData = new FormData();
          formData.append("image", file);

          const response = await fetch(
            `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
            {
              method: "POST",
              body: formData
            }
          );

          const data = await response.json();
          if (!data?.success || !data?.data?.url) {
            throw new Error("ImgBB upload failed");
          }

          photoURL = data.data.url;
        }

        await updateProfile(user, {
          displayName: newName || user.displayName || "",
          photoURL: photoURL || user.photoURL || ""
        });

        setSavedBio(user.uid, newBio);

        if (saveStatus) {
          saveStatus.style.display = "block";
          saveStatus.textContent = "Зміни збережено!";
        }

        renderProfilePage(auth.currentUser);
        renderAuthUI(auth.currentUser);

        alert("Зміни збережено!");
      } catch (error) {
        console.error("Помилка оновлення профілю:", error);
        alert("Сталася помилка при збереженні.");
      }
    });
  }
}

// =========================
// ANIME LIST / MAIN PAGE
// =========================
let animeCache = [];

function renderAnimeCards(data) {
  const grid = $("#main-anime-grid");
  if (!grid) return;

  grid.innerHTML = "";

  if (!Array.isArray(data) || data.length === 0) {
    grid.innerHTML =
      '<p style="color:#777; grid-column:1/-1; text-align:center;">База порожня.</p>';
    return;
  }

  data.forEach((anime) => {
    const card = document.createElement("div");
    card.className = "anime-card";

    const poster = anime.posterUrl || anime.image || "https://via.placeholder.com/200x300";
    const title = getAnimeTitle(anime);
    const genres = getAnimeGenres(anime);
    const episodes = anime.episodes || "?";

    card.innerHTML = `
      <a href="anime-page.html?id=${encodeURIComponent(anime.id)}" class="card-link">
        <div class="poster">
          <img src="${poster}" alt="${title}">
          <div class="episodes-badge">${episodes} серій</div>
        </div>
        <div class="info">
          <div class="title">${title}</div>
          <div class="meta">${genres}</div>
        </div>
      </a>
    `;

    grid.appendChild(card);
  });
}

async function loadMainGrid() {
  const grid = $("#main-anime-grid");
  if (!grid) return;

  try {
    const response = await fetch("/api/anime");
    const data = await response.json();
    animeCache = Array.isArray(data) ? data : [];
    renderAnimeCards(animeCache);
  } catch (error) {
    console.error("Помилка завантаження сітки:", error);
  }
}

function bindSearch() {
  const searchInput = $("#anime-search");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim().toLowerCase();

    if (!query) {
      renderAnimeCards(animeCache);
      return;
    }

    const filtered = animeCache.filter((anime) =>
      getAnimeTitle(anime).toLowerCase().includes(query)
    );

    renderAnimeCards(filtered);
  });
}

// =========================
// ANIME PAGE
// =========================
function parseEpisodes(playerUrl) {
  if (!playerUrl) return [];

  if (typeof playerUrl === "string") {
    try {
      const parsed = JSON.parse(playerUrl);
      return Array.isArray(parsed) ? parsed : [{ nr: 1, url: playerUrl }];
    } catch {
      return [{ nr: 1, url: playerUrl }];
    }
  }

  if (Array.isArray(playerUrl)) return playerUrl;

  return [];
}

async function loadAnimePage() {
  const params = new URLSearchParams(window.location.search);
  const animeId = params.get("id");

  const titleEl = $("#anime-title");
  const genresEl = $("#anime-genres");
  const posterEl = $("#anime-poster");
  const descriptionEl = $("#anime-description");
  const playerEl = $("#main-player") || $(".player-wrapper iframe") || $("iframe");
  const episodesGrid = $("#episodes-list") || $(".episodes-grid");

  if (!animeId || !titleEl || !posterEl || !descriptionEl || !playerEl || !episodesGrid) return;

  try {
    const response = await fetch("/api/anime");
    const data = await response.json();
    const anime = Array.isArray(data)
      ? data.find((item) => String(item.id) === String(animeId))
      : null;

    if (!anime) {
      titleEl.textContent = "Аніме не знайдено";
      return;
    }

    titleEl.textContent = getAnimeTitle(anime);
    if (genresEl) genresEl.textContent = getAnimeGenres(anime);
    posterEl.src = anime.posterUrl || anime.image || "https://via.placeholder.com/300x450";
    descriptionEl.textContent = getAnimeDescription(anime);

    const episodesArray = parseEpisodes(anime.playerUrl);
    episodesGrid.innerHTML = "";

    if (!episodesArray.length) {
      episodesGrid.innerHTML = '<p style="color:#777;">Серії не знайдені.</p>';
      if ("src" in playerEl) playerEl.src = "";
      return;
    }

    episodesArray.forEach((ep, index) => {
      const btn = document.createElement("button");
      btn.className = "ep-btn";
      btn.type = "button";
      btn.textContent = `${ep.nr || index + 1} серія`;

      btn.addEventListener("click", () => {
        if (ep.url && "src" in playerEl) {
          playerEl.src = ep.url;
        }

        $all(".ep-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });

      episodesGrid.appendChild(btn);
    });

    if (episodesArray[0]?.url && "src" in playerEl) {
      playerEl.src = episodesArray[0].url;
    }

    const firstBtn = episodesGrid.querySelector(".ep-btn");
    if (firstBtn) firstBtn.classList.add("active");
  } catch (error) {
    console.error("Помилка сторінки аніме:", error);
  }
}

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", () => {
  bindAuthModal();
  bindLogout();
  bindDropdowns();
  bindProfileEditor();
  bindSearch();
  loadMainGrid();
  loadAnimePage();
});

onAuthStateChanged(auth, (user) => {
  renderAuthUI(user);
  renderProfilePage(user);
  bindDropdowns();
});