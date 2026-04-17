import { Link, useParams } from 'react-router-dom'
import { getAnimeBySlug } from '../services/animeService.js'

export default function AnimeDetails() {
  const { slug } = useParams()
  const anime = getAnimeBySlug(slug)

  if (!anime) {
    return (
      <div className="page">
        <div className="container">
          <h1>Аніме не знайдено</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="section-title">{anime.title}</h1>
        <p className="section-text" style={{ marginBottom: '20px' }}>
          {anime.description}
        </p>

        <p><strong>Рік:</strong> {anime.year}</p>
        <p><strong>Статус:</strong> {anime.status}</p>
        <p><strong>Серій:</strong> {anime.episodes}</p>
        <p><strong>Жанри:</strong> {anime.genres.join(', ')}</p>

        <div className="actions" style={{ marginTop: '20px' }}>
          <Link to={`/watch/${anime.slug}`} className="button">
            Перейти до перегляду
          </Link>
        </div>
      </div>
    </div>
  )
}