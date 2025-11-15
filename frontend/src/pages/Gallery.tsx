import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const API = import.meta.env.VITE_API_BASE_URL

export default function Gallery() {
  const [q, setQ] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['memes', q],
    queryFn: async () => q
      ? (await axios.get(`${API}/memes/search`, { params: { q } })).data
      : (await axios.get(`${API}/memes/public`)).data,
  })

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => (await axios.get(`${API}/tags`)).data,
  })

  return (
    <div>
      <h1 className="text-xl mb-4">Public Gallery</h1>

      <div className="flex gap-2 mb-4 items-center">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search title, description, tag, or user"
               className="border p-2 rounded w-full max-w-xl" />
        <button onClick={()=>setQ('')} className="px-3 py-2 border rounded">Clear</button>
      </div>

      {tags && (
        <div className="mb-4 flex gap-2 flex-wrap">
          {tags.slice(0, 12).map((t: any) => (
            <button key={t.id} onClick={()=>setQ(t.name)} className="px-2 py-1 text-xs bg-gray-200 rounded">
              #{t.name}
            </button>
          ))}
        </div>
      )}

      {isLoading ? <p>Loading...</p> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data?.map((m: any) => (
            <Link key={m.id} to={`/memes/${m.id}`} className="block border rounded overflow-hidden">
              <img src={m.s3Url} alt={m.title} className="w-full aspect-square object-cover" draggable={false} onContextMenu={(e)=>e.preventDefault()} />
              <div className="p-2 text-sm">{m.title}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
