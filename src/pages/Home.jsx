import AnimeCard from '../components/AnimeCard/AnimeCard.jsx'
import { getPopularAnime } from '../services/animeService.js'

export default function Home() {
  const popularAnime = getPopularAnime()

  return (
    <div className="page">
      <div className="container">
        <h1 className="section-title">AnimeGensyUA</h1>
        <p className="section-text">Дивись популярні аніме українською.</p>

        <div className="grid">
          {popularAnime.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </div>
    </div>
  )
}