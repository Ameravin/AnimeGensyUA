import animeData from '../data/anime.json'

export function getAllAnime() {
  return animeData
}

export function getAnimeBySlug(slug) {
  return animeData.find((anime) => anime.slug === slug)
}

export function getPopularAnime(limit = 4) {
  return animeData.slice(0, limit)
}

export function searchAnime(query) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) return []

  return animeData.filter((anime) =>
    anime.title.toLowerCase().includes(normalizedQuery)
  )
}