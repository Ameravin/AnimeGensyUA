const fs = require("fs");
const path = require("path");
const axios = require("axios");

const OUTPUT_FILE = path.join(__dirname, "data", "animeData.json");
const API_URL = "https://graphql.anilist.co";

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const idx = args.indexOf(name);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : def;
};

const pages = Math.max(1, parseInt(getArg("--pages", "10"), 10));
const perPage = Math.min(50, Math.max(1, parseInt(getArg("--perPage", "50"), 10)));
const mergeMode = args.includes("--merge");

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readExisting() {
  try {
    if (!fs.existsSync(OUTPUT_FILE)) return [];
    const raw = fs.readFileSync(OUTPUT_FILE, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Не вдалося прочитати animeData.json:", err.message);
    return [];
  }
}

function saveData(data) {
  ensureDir(OUTPUT_FILE);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), "utf8");
}

function cleanText(text) {
  if (!text) return "";
  return String(text)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

function pickStudio(studios) {
  const list = studios?.edges || [];
  if (!list.length) return "";
  const main = list.find((s) => s.isMain);
  return main?.node?.name || list[0]?.node?.name || "";
}

function toAnimeItem(media) {
  const titleRomaji = media.title?.romaji || "";
  const titleEnglish = media.title?.english || "";
  const titleNative = media.title?.native || "";
  const title = titleEnglish || titleRomaji || titleNative || "Без назви";

  const description = cleanText(media.description) || "Опис відсутній";
  const posterUrl = media.coverImage?.large || media.coverImage?.extraLarge || "";
  const year = media.seasonYear || "";
  const episodes = media.episodes || "";
  const genres = Array.isArray(media.genres) ? media.genres.join(", ") : "";
  const studio = pickStudio(media.studios);

  return {
    id: media.id,
    title,
    title_ua: "",
    title_native: titleNative,
    year: year ? String(year) : "",
    studio,
    studio_ua: "",
    genres,
    episodes: episodes ? String(episodes) : "",
    description,
    description_ua: "",
    posterUrl,
    image: posterUrl,
    status: media.status || "",
    format: media.format || "",
    season: media.season || "",
    score: media.averageScore || "",
    trailerUrl: media.trailer?.site && media.trailer?.id ? `${media.trailer.site}/${media.trailer.id}` : "",
    dub_ua: "",
    voice_studio: "",
    playerUrl: []
  };
}

async function fetchPage(page) {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
        }
        media(type: ANIME, sort: POPULARITY_DESC) {
          id
          title {
            romaji
            english
            native
          }
          description(asHtml: false)
          seasonYear
          episodes
          genres
          averageScore
          format
          season
          status
          coverImage {
            large
            extraLarge
          }
          trailer {
            site
            id
          }
          studios(isMain: true) {
            edges {
              isMain
              node {
                name
              }
            }
          }
        }
      }
    }
  `;

  const response = await axios.post(
    API_URL,
    { query, variables: { page, perPage } },
    {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      timeout: 30000
    }
  );

  if (response.data.errors) {
    throw new Error(JSON.stringify(response.data.errors));
  }

  return response.data.data.Page;
}

async function main() {
  console.log(`Старт імпорту: pages=${pages}, perPage=${perPage}, merge=${mergeMode}`);

  const allItems = [];
  let totalPages = pages;

  for (let page = 1; page <= totalPages; page++) {
    process.stdout.write(`Завантажую сторінку ${page}/${totalPages}...\r`);
    const result = await fetchPage(page);

    if (page === 1 && result?.pageInfo?.lastPage) {
      totalPages = Math.min(totalPages, result.pageInfo.lastPage);
    }

    const media = result?.media || [];
    for (const item of media) {
      allItems.push(toAnimeItem(item));
    }
  }

  let finalData = allItems;

  if (mergeMode) {
    const existing = readExisting();
    const map = new Map();

    for (const item of existing) {
      map.set(String(item.id), item);
    }

    for (const item of allItems) {
      map.set(String(item.id), item);
    }

    finalData = Array.from(map.values());
  }

  finalData.sort((a, b) => {
    const aTitle = (a.title || "").toLowerCase();
    const bTitle = (b.title || "").toLowerCase();
    return aTitle.localeCompare(bTitle);
  });

  saveData(finalData);

  console.log(`Готово. Записано ${finalData.length} аніме у ${OUTPUT_FILE}`);
  console.log("UA-поля залишені порожніми для ручного доповнення.");
}

main().catch((err) => {
  console.error("Помилка імпорту:", err.message || err);
  process.exit(1);
});