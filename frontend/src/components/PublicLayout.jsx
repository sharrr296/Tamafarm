import { Link, Outlet } from 'react-router-dom'
import { homeFor, useAuth } from '../context/AuthContext'

export default function PublicLayout() {
  const { user } = useAuth()
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-mist">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="font-display text-2xl font-extrabold tracking-tight">
            Tama<span className="text-shell">farm</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm font-semibold">
            <Link to="/#katalog" className="hover:underline underline-offset-4">Katalog</Link>
            {user ? (
              <Link to={homeFor(user)} className="rounded-md bg-tank px-4 py-2 text-foam hover:bg-tank-soft">
                Buka Dashboard
              </Link>
            ) : (
              <Link to="/login" className="rounded-md border border-tank px-4 py-2 hover:bg-tank hover:text-foam">
                Masuk
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-mist">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-tank/70">
          Tamafarm. Lobster hidup dan paket kemitraan.
        </div>
      </footer>
    </div>
  )
}
