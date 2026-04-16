const fs = require("fs");
const path = require("path");

const OUTPUT_FILE = path.join(__dirname, "data", "animeData.json");
const API_URL = "https://graphql.anilist.co";
const TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single";

const args = process.argv.slice(2);

function getArg(name, def) {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const pages = Math.max(1, parseInt(getArg("--pages", "10"), 10));
const perPage = Math.min(50, Math.max(1, parseInt(getArg("--perPage", "50"), 10)));
const mergeMode = args.includes("--merge");

const translateCache = new Map();

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

async function translateUk(text) {
  const src = (text || "").trim();
  if (!src) return "";

  if (translateCache.has(src)) return translateCache.get(src);

  try {
    const url =
      `${TRANSLATE_URL}?client=gtx&sl=auto&tl=uk&dt=t&q=` +
      encodeURIComponent(src);

    const res = await fetch(url);
    const data = await res.json();

    const translated = Array.isArray(data?.[0])
      ? data[0].map((part) => part[0]).join("").trim()
      : src;

    translateCache.set(src, translated || src);
    return translated || src;
  } catch (err) {
    translateCache.set(src, src);
    return src;
  }
}

async function fetchPage(page) {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
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

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { page, perPage },
    }),
  });

  const json = await res.json();

  if (json.errors) {
    throw new Error(JSON.stringify(json.errors));
  }

  return json.data.Page;
}

async function toAnimeItem(media) {
  const titleSource =
    media.title?.english ||
    media.title?.romaji ||
    media.title?.native ||
    "Без назви";

  const descriptionSource = cleanText(media.description) || "Опис відсутній";
  const genresSource = Array.isArray(media.genres) ? media.genres.join(", ") : "";
  const studioSource = pickStudio(media.studios);

  const [titleUa, descriptionUa, genresUa, studioUa] = await Promise.all([
    translateUk(titleSource),
    translateUk(descriptionSource),
    translateUk(genresSource),
    translateUk(studioSource),
  ]);

  const posterUrl = media.coverImage?.large || media.coverImage?.extraLarge || "";

  return {
    id: media.id,
    title: titleSource,
    title_ua: titleUa || titleSource,
    title_native: media.title?.native || "",
    year: media.seasonYear ? String(media.seasonYear) : "",
    studio: studioSource,
    studio_ua: studioUa || studioSource,
    genres: genresSource,
    genres_ua: genresUa || genresSource,
    episodes: media.episodes ? String(media.episodes) : "",
    description: descriptionSource,
    description_ua: descriptionUa || descriptionSource,
    posterUrl,
    image: posterUrl,
    status: media.status || "",
    format: media.format || "",
    season: media.season || "",
    score: media.averageScore || "",
    trailerUrl:
      media.trailer?.site && media.trailer?.id
        ? `${media.trailer.site}/${media.trailer.id}`
        : "",
    dub_ua: "",
    voice_studio: "",
    playerUrl: [],
  };
}

async function main() {
  console.log(`Старт імпорту: pages=${pages}, perPage=${perPage}, merge=${mergeMode}`);

  const allItems = [];

  for (let page = 1; page <= pages; page++) {
    process.stdout.write(`Завантажую сторінку ${page}/${pages}...\r`);
    const result = await fetchPage(page);
    const media = result?.media || [];

    for (const item of media) {
      allItems.push(await toAnimeItem(item));
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
    const aTitle = (a.title_ua || a.title || "").toLowerCase();
    const bTitle = (b.title_ua || b.title || "").toLowerCase();
    return aTitle.localeCompare(bTitle);
  });

  saveData(finalData);

  console.log(`Готово. Записано ${finalData.length} аніме у ${OUTPUT_FILE}`);
  console.log("UA-поля заповнені автоматично.");
}

main().catch((err) => {
  console.error("Помилка імпорту:", err.message || err);
  process.exit(1);
});