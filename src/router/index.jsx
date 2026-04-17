import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout.jsx'
import Home from '../pages/Home.jsx'
import Catalog from '../pages/Catalog.jsx'
import AnimeDetails from '../pages/AnimeDetails.jsx'
import Watch from '../pages/Watch.jsx'
import Search from '../pages/Search.jsx'
import NotFound from '../pages/NotFound.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'catalog',
        element: <Catalog />,
      },
      {
        path: 'anime/:slug',
        element: <AnimeDetails />,
      },
      {
        path: 'watch/:slug',
        element: <Watch />,
      },
      {
        path: 'search',
        element: <Search />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
])

export default router