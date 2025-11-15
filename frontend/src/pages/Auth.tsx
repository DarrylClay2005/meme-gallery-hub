import { useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_BASE_URL

export default function Auth({ onAuth }: { onAuth: (t: string) => void }) {
  const [mode, setMode] = useState<'login'|'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const url = mode === 'login' ? `${API}/auth/login` : `${API}/auth/register`
      const payload: any = { email, password }
      if (mode === 'register') payload.username = username
      const { data } = await axios.post(url, payload)
      onAuth(data.token)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl mb-4">{mode === 'login' ? 'Login' : 'Register'}</h1>
      <form onSubmit={submit} className="flex flex-col gap-3">
        {mode === 'register' && (
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username"
                 className="border p-2 rounded" required />
        )}
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"
               className="border p-2 rounded" required />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password"
               className="border p-2 rounded" required />
        {error && <p className="text-red-600 text-sm">{String(error)}</p>}
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
        <button type="button" className="text-sm underline" onClick={() => setMode(m => m==='login'?'register':'login')}>
          Switch to {mode === 'login' ? 'Register' : 'Login'}
        </button>
      </form>
    </div>
  )
}
