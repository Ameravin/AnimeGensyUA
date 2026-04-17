import AnimeCard from '../components/AnimeCard/AnimeCard.jsx'
import { getAllAnime } from '../services/animeService.js'

export default function Catalog() {
  const animeList = getAllAnime()

  return (
    <div className="page">
      <div className="container">
        <h1 className="section-title">Каталог аніме</h1>
        <p className="section-text">Усі доступні тайтли на сайті.</p>

        <div className="grid">
          {animeList.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </div>
    </div>
  )
}