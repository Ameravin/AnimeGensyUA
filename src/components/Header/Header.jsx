import { Link, NavLink } from 'react-router-dom'
import SearchBar from '../SearchBar/SearchBar.jsx'

export default function Header() {
  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <Link to="/" style={logoStyle}>
          AnimeGensyUA
        </Link>

        <nav style={navStyle}>
          <NavLink to="/" style={getLinkStyle}>
            Головна
          </NavLink>

          <NavLink to="/catalog" style={getLinkStyle}>
            Каталог
          </NavLink>
        </nav>

        <SearchBar />
      </div>
    </header>
  )
}

const headerStyle = {
  width: '100%',
  background: '#181818',
  borderBottom: '1px solid #2a2a2a',
  position: 'sticky',
  top: 0,
  zIndex: 100,
}

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '16px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '20px',
  flexWrap: 'wrap',
}

const logoStyle = {
  fontSize: '24px',
  fontWeight: '700',
  textDecoration: 'none',
  color: '#fff',
}

const navStyle = {
  display: 'flex',
  gap: '14px',
  flexWrap: 'wrap',
}

const baseLinkStyle = {
  textDecoration: 'none',
  color: '#ccc',
  padding: '10px 14px',
  borderRadius: '8px',
  transition: '0.2s',
}

function getLinkStyle({ isActive }) {
  return {
    ...baseLinkStyle,
    background: isActive ? '#2c2c2c' : 'transparent',
    color: isActive ? '#fff' : '#ccc',
  }
}