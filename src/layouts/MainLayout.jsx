import { Outlet } from 'react-router-dom'
import Header from '../components/Header/Header.jsx'
import Footer from '../components/Footer/Footer.jsx'

export default function MainLayout() {
  return (
    <div style={layoutStyle}>
      <Header />

      <main style={mainStyle}>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

const layoutStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
}

const mainStyle = {
  flex: 1,
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
}