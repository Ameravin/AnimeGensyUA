import { Link } from 'react-router-dom'

export default function AnimeCard({ anime }) {
  return (
    <div className="card">
      <div className="poster">
        {anime.image ? (
          <img src={anime.image} alt={anime.title} />
        ) : (
          <div className="poster-empty">Немає постера</div>
        )}
      </div>

      <h3 style={{ marginTop: '14px', marginBottom: '10px' }}>{anime.title}</h3>
      <p className="meta">Рік: {anime.year}</p>
      <p className="meta">Серій: {anime.episodes}</p>

      <div className="actions">
        <Link to={`/anime/${anime.slug}`} className="button">
          Детальніше
        </Link>

        <Link to={`/watch/${anime.slug}`} className="button">
          Дивитися
        </Link>
      </div>
    </div>
  )
}