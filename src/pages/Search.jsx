import { useSearchParams } from 'react-router-dom'
import AnimeCard from '../components/AnimeCard/AnimeCard.jsx'
import { searchAnime } from '../services/animeService.js'

export default function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const results = searchAnime(query)

  return (
    <div className="page">
      <div className="container">
        <h1 className="section-title">Пошук</h1>
        <p className="section-text">
          Результати для: <strong>{query || '...'}</strong>
        </p>

        {query && results.length > 0 ? (
          <div className="grid">
            {results.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        ) : query ? (
          <p style={{ marginTop: '20px' }}>Нічого не знайдено.</p>
        ) : (
          <p style={{ marginTop: '20px' }}>Введи запит у пошуку.</p>
        )}
      </div>
    </div>
  )
}