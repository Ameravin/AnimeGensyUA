export default function Footer() {
  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        <p style={textStyle}>© 2026 AnimeGensyUA. Всі права захищені.</p>
      </div>
    </footer>
  )
}

const footerStyle = {
  borderTop: '1px solid #2a2a2a',
  background: '#181818',
  marginTop: '40px',
}

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '20px',
}

const textStyle = {
  margin: 0,
  color: '#999',
  fontSize: '14px',
}