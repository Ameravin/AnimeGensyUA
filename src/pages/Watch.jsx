import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAnimeBySlug } from '../services/animeService.js'

export default function Watch() {
  const { slug } = useParams()
  const anime = getAnimeBySlug(slug)

  const initialEpisode = anime?.episodeList?.[0]?.number || 1
  const initialSource = anime?.sources?.[0] || ''
  const initialVoice = anime?.voices?.[0] || ''

  const [selectedEpisode, setSelectedEpisode] = useState(initialEpisode)
  const [selectedSource, setSelectedSource] = useState(initialSource)
  const [selectedVoice, setSelectedVoice] = useState(initialVoice)

  const currentEpisode = useMemo(() => {
    return anime?.episodeList?.find(
      (episode) => episode.number === Number(selectedEpisode)
    )
  }, [anime, selectedEpisode])

  if (!anime) {
    return (
      <div className="page">
        <div className="container">
          <h1>Аніме не знайдено</h1>
        </div>
      </div>
    )
  }

  function handlePrevEpisode() {
    if (selectedEpisode > 1) {
      setSelectedEpisode((prev) => prev - 1)
    }
  }

  function handleNextEpisode() {
    if (selectedEpisode < anime.episodeList.length) {
      setSelectedEpisode((prev) => prev + 1)
    }
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="section-title">Перегляд: {anime.title}</h1>
        <p className="section-text" style={{ marginBottom: '24px' }}>
          Серія {selectedEpisode}
          {currentEpisode?.title ? ` — ${currentEpisode.title}` : ''}
        </p>

        <div className="watch-panel">
          <div className="source-tabs">
            {anime.sources.map((source) => (
              <button
                key={source}
                type="button"
                className={`source-tab ${
                  selectedSource === source ? 'active' : ''
                }`}
                onClick={() => setSelectedSource(source)}
              >
                {source}
              </button>
            ))}
          </div>

          <div className="watch-controls">
            <button
              type="button"
              className="control-arrow"
              onClick={handlePrevEpisode}
              disabled={selectedEpisode === 1}
            >
              ‹
            </button>

            <select
              className="control-select control-select-episode"
              value={selectedEpisode}
              onChange={(e) => setSelectedEpisode(Number(e.target.value))}
            >
              {anime.episodeList.map((episode) => (
                <option key={episode.number} value={episode.number}>
                  {episode.number} серія
                </option>
              ))}
            </select>

            <button
              type="button"
              className="control-arrow"
              onClick={handleNextEpisode}
              disabled={selectedEpisode === anime.episodeList.length}
            >
              ›
            </button>

            <select
              className="control-select control-select-voice"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
            >
              {anime.voices.map((voice) => (
                <option key={voice} value={voice}>
                  {voice}
                </option>
              ))}
            </select>
          </div>

          <div className="video-frame">
            <div className="video-overlay">
              <div className="video-badge">Плеєр-заглушка</div>
              <h2 className="video-title">{anime.title}</h2>
              <p className="video-meta">
                Джерело: {selectedSource} • Серія: {selectedEpisode} • Озвучка:{' '}
                {selectedVoice}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}