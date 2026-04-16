const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "data", "animeData.json");
const TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single";

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

async function translateUk(text) {
  const src = cleanText(text);
  if (!src) return "";
  if (src.length > 5000) return src; // щоб не ламати дуже довгі тексти

  const url =
    `${TRANSLATE_URL}?client=gtx&sl=auto&tl=uk&dt=t&q=` +
    encodeURIComponent(src);

  const res = await fetch(url);
  const data = await res.json();

  return Array.isArray(data?.[0])
    ? data[0].map((p) => p[0]).join("").trim()
    : src;
}

(async () => {
  const raw = fs.readFileSync(FILE, "utf8");
  const anime = JSON.parse(raw);

  for (let i = 0; i < anime.length; i++) {
    const item = anime[i];

    item.title_ua = item.title_ua || (await translateUk(item.title));
    item.genres_ua = item.genres_ua || (await translateUk(item.genres));
    item.studio_ua = item.studio_ua || (await translateUk(item.studio));
    item.description_ua = item.description_ua || (await translateUk(item.description));

    console.log(`Готово: ${i + 1}/${anime.length}`);
  }

  fs.writeFileSync(FILE, JSON.stringify(anime, null, 2), "utf8");
  console.log("Перекладено і збережено у data/animeData.json");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});