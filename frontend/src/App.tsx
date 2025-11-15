import { useEffect } from 'react'
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import Gallery from './pages/Gallery'
import MemeDetail from './pages/MemeDetail'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'

const tokenKey = 'memehub_token'

function useAuth() {
  const token = localStorage.getItem(tokenKey)
  return { token, setToken: (t?: string) => t ? localStorage.setItem(tokenKey, t) : localStorage.removeItem(tokenKey) }
}

function Protected({ children }: { children: JSX.Element }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/auth" replace />
  return children
}

export default function App() {
  const nav = useNavigate()
  const { token, setToken } = useAuth()
  useEffect(() => { /* noop */ }, [token])

  return (
    <div className="min-h-screen">
      <header className="p-4 border-b flex gap-4 items-center">
        <Link to="/" className="font-semibold">Meme Gallery Hub</Link>
        <nav className="flex gap-3 ml-auto">
          <Link to="/">Gallery</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/memes/upload">Upload</Link>
          {token ? (
            <button onClick={() => { setToken(undefined); nav('/') }} className="text-red-600">Logout</button>
          ) : (
            <Link to="/auth">Login</Link>
          )}
        </nav>
      </header>
      <main className="p-4">
        <Routes>
          <Route path="/" element={<Gallery />} />
          <Route path="/memes/:id" element={<MemeDetail />} />
          <Route path="/auth" element={<Auth onAuth={(t) => { localStorage.setItem(tokenKey, t); nav('/dashboard') }} />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/memes/upload" element={<Protected><Upload /></Protected>} />
        </Routes>
      </main>
    </div>
  )
}
