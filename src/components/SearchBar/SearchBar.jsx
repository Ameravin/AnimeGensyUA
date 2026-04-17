import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()

    const trimmedQuery = query.trim()

    if (!trimmedQuery) return

    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`)
    setQuery('')
  }

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <input
        type="text"
        placeholder="Пошук аніме..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={inputStyle}
      />
      <button type="submit" style={buttonStyle}>
        Знайти
      </button>
    </form>
  )
}

const formStyle = {
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
  flexWrap: 'wrap',
}

const inputStyle = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #333',
  background: '#222',
  color: '#fff',
  outline: 'none',
  minWidth: '220px',
}

const buttonStyle = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: 'none',
  background: '#333',
  color: '#fff',
  cursor: 'pointer',
}