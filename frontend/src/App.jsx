import { Navigate, Route, Routes } from 'react-router-dom'
import PublicLayout from './components/PublicLayout'
import RequireRole from './components/RequireRole'
import { homeFor, useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import ProductDetail from './pages/ProductDetail'
import Akun from './pages/panel/Akun'
import Kategori from './pages/panel/Kategori'
import PanelLayout from './pages/panel/PanelLayout'
import Produk from './pages/panel/Produk'

function PanelIndex() {
  const { user } = useAuth()
  return <Navigate to={homeFor(user)} replace />
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/produk/:id" element={<ProductDetail />} />
      </Route>

      <Route path="/login" element={<Login />} />

      <Route
        path="/panel"
        element={
          <RequireRole>
            <PanelLayout />
          </RequireRole>
        }
      >
        <Route index element={<PanelIndex />} />
        <Route path="produk" element={<RequireRole roles={['admin']}><Produk /></RequireRole>} />
        <Route path="kategori" element={<RequireRole roles={['admin']}><Kategori /></RequireRole>} />
        <Route path="akun" element={<RequireRole roles={['pemilik']}><Akun /></RequireRole>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
